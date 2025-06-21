import { BurnTx, Chain } from "../types";
import { useBlock, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { decodeEventLog, encodePacked, Hex, keccak256 } from "viem";
import { useMessages } from "./useApi";
import { TOKEN_MESSENGER_ABI } from "../abis/TokenMessenger";
import { MESSAGE_TRANSMITTER_ABI } from "../abis/MessageTransmitter";
import { useTime } from "./useUtils";
import moment from "moment";
import {
  CHAINS,
  DEPOSIT_FOR_BURN_TOPIC_V1,
  DEPOSIT_FOR_BURN_TOPIC_V2,
} from "../constants";
import { findChainByDomainId } from "../utils";
import { TOKEN_MESSENGER_V1_ABI } from "../abis/TokenMessengerV1";

export type UseBurnTxDetailsType = {
  time: number;
  srcChain: Chain;
  dstChain?: Chain;
  attestation: Hex;
  message: Hex;
  nonce: Hex;
  isPending: boolean;
  isComplete: boolean;
  isMinted: boolean;
  amount: bigint;
  minFinalityThreshold?: number;
  isFast: boolean;
  isV1: boolean;
  isV2: boolean;
  hash: Hex;
  recipient: string;
};

export function useBurnTxDetails(tx: BurnTx) {
  const [needsRefresh, setNeedsRefresh] = useState(true);

  const srcChain = useMemo(
    () => findChainByDomainId(tx.srcDomain),
    [tx.srcDomain],
  );

  const { data: receipt, isLoading: receiptLoading } =
    useWaitForTransactionReceipt({ hash: tx.hash, chainId: srcChain.id });

  const { data: messages } = useMessages({
    srcDomain: tx.srcDomain,
    txHash: tx.hash,
    refetchInterval: needsRefresh ? 10_000 : 60_000,
  });

  const { data: block, isLoading: blockLoading } = useBlock({
    blockNumber: receipt?.blockNumber,
    chainId: srcChain.id,
    includeTransactions: false,
  });

  const res = useMemo(() => {
    if (!block || !receipt) {
      return;
    }

    const isV1 =
      receipt.logs.findIndex(
        (log) => log.topics[0] === DEPOSIT_FOR_BURN_TOPIC_V1,
      ) !== -1;

    const depositForBurnLog = receipt.logs.find(
      (log) =>
        log.topics[0] ===
        (isV1 ? DEPOSIT_FOR_BURN_TOPIC_V1 : DEPOSIT_FOR_BURN_TOPIC_V2),
    );

    if (!depositForBurnLog) {
      return;
    }

    const depositForBurnDecodedLog = decodeEventLog({
      abi: isV1 ? TOKEN_MESSENGER_V1_ABI : TOKEN_MESSENGER_ABI,
      eventName: "DepositForBurn",
      topics: depositForBurnLog.topics,
      data: depositForBurnLog.data,
    });

    const dstChain = CHAINS.find(
      (c) => c.domain === depositForBurnDecodedLog.args.destinationDomain,
    );

    const hasMessages = messages !== undefined && messages.length > 0;
    // eslint-disable-next-line
    const minFinalityThreshold = (depositForBurnDecodedLog.args as any)
      .minFinalityThreshold;

    let encodedNonce = hasMessages ? messages[0].eventNonce : "0x";

    if (isV1 && hasMessages) {
      encodedNonce = keccak256(
        encodePacked(
          ["uint32", "uint64"],
          [tx.srcDomain, BigInt(encodedNonce)],
        ),
      );
    }

    const res: UseBurnTxDetailsType = {
      time: Number(block.timestamp),
      srcChain,
      dstChain,
      attestation: hasMessages ? messages[0].attestation : "0x",
      message: hasMessages ? messages[0].message : "0x",
      nonce: encodedNonce,
      isPending: !hasMessages || messages[0].status === "pending_confirmations",
      isComplete: hasMessages && messages[0].status === "complete",
      isMinted: false,
      amount: depositForBurnDecodedLog.args.amount,
      minFinalityThreshold: isV1 ? undefined : minFinalityThreshold,
      isFast: isV1 ? false : minFinalityThreshold <= 1000,
      hash: tx.hash,
      isV1,
      isV2: !isV1,
      recipient: depositForBurnDecodedLog.args.mintRecipient,
    };

    return res;
  }, [block, messages, receipt, srcChain, tx.hash, tx.srcDomain]);

  const { data: nonceUsed, refetch: refetchNonceUsed } = useReadContract({
    address: res?.isV1
      ? res?.dstChain?.messageTransmitterV1
      : res?.dstChain?.messageTransmitterV2,
    abi: MESSAGE_TRANSMITTER_ABI,
    functionName: "usedNonces",
    args: [res?.nonce ?? "0x"],
    chainId: res?.dstChain?.id,
    query: {
      enabled:
        res !== undefined && res.nonce !== "0x" && res.dstChain !== undefined,
    },
  });

  const isLoading = useMemo(
    () => receiptLoading || blockLoading,
    [receiptLoading, blockLoading],
  );

  const resWithNonceUsed = useMemo(() => {
    if (res === undefined) {
      return;
    }
    const minted = nonceUsed === 1n;
    if (!minted) {
      return res;
    }
    return { ...res, isMinted: minted, isPending: false, isComplete: false };
  }, [res, nonceUsed]);

  useEffect(() => {
    if (resWithNonceUsed && resWithNonceUsed.isMinted) {
      setNeedsRefresh(false);
    }
  }, [resWithNonceUsed]);

  return {
    data: resWithNonceUsed,
    isLoading,
    refetchNonceUsed,
  };
}

export function useETA(data?: UseBurnTxDetailsType) {
  const time = useTime();

  return useMemo(() => {
    if (data === undefined || !data.isPending) {
      return;
    }

    const eta =
      data.isFast && data.srcChain.fastETA
        ? data.srcChain.fastETA
        : data.srcChain.standardETA;

    if (data.time + eta < time) {
      return "a few seconds";
    }

    return moment(data.time * 1000)
      .add()
      .add(eta, "seconds")
      .fromNow(true);
  }, [time, data]);
}
