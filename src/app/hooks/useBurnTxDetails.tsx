import { BurnTx, Chain } from "../types";
import { useBlock, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { decodeEventLog, Hex } from "viem";
import { useMessages } from "./useApi";
import { TOKEN_MESSENGER_ABI } from "../abis/TokenMessenger";
import { MESSAGE_TRANSMITTER_ABI } from "../abis/MessageTransmitter";
import { useTime } from "./useUtils";
import moment from "moment";
import { CHAINS } from "../constants";
import { findChainByDomainId } from "../utils";

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
  minFinalityThreshold: number;
  isFast: boolean;
  hash: Hex;
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
    refetchInterval: needsRefresh ? 5_000 : 60_000,
  });

  const { data: block, isLoading: blockLoading } = useBlock({
    blockHash: receipt?.blockHash,
    chainId: srcChain.id,
  });

  const res = useMemo(() => {
    if (!block || !receipt) {
      return;
    }

    const log = receipt.logs.find(
      (log) =>
        log.topics[0] ===
        "0x0c8c1cbdc5190613ebd485511d4e2812cfa45eecb79d845893331fedad5130a5",
    );

    if (!log) {
      return;
    }

    const decodedLog = decodeEventLog({
      abi: TOKEN_MESSENGER_ABI,
      eventName: "DepositForBurn",
      topics: log.topics,
      data: log.data,
    });

    const dstChain = CHAINS.find(
      (c) => c.domain === decodedLog.args.destinationDomain,
    );

    const hasMessages = messages !== undefined && messages.length > 0;

    const res: UseBurnTxDetailsType = {
      time: Number(block.timestamp),
      srcChain,
      dstChain,
      attestation: hasMessages ? messages[0].attestation : "0x",
      message: hasMessages ? messages[0].message : "0x",
      nonce: hasMessages ? messages[0].eventNonce : "0x",
      isPending: !hasMessages || messages[0].status === "pending_confirmations",
      isComplete: hasMessages && messages[0].status === "complete",
      isMinted: false,
      amount: decodedLog.args.amount,
      minFinalityThreshold: decodedLog.args.minFinalityThreshold,
      isFast: decodedLog.args.minFinalityThreshold <= 1000,
      hash: tx.hash,
    };

    return res;
  }, [block, messages, receipt, srcChain, tx.hash]);

  const { data: nonceUsed, refetch: refetchNonceUsed } = useReadContract({
    address: res?.dstChain?.messageTransmitterAddress,
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
