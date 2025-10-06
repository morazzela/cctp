import { BurnTx, Chain } from "../types";
import { useBlock, useWaitForTransactionReceipt } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { decodeEventLog, encodePacked, Hex, keccak256 } from "viem";
import { useMessages } from "./useApi";
import { TOKEN_MESSENGER_ABI } from "../abis/TokenMessenger";
import { useTime } from "./useUtils";
import moment from "moment";
import {
  CHAINS,
  DEPOSIT_FOR_BURN_TOPIC_V1,
  DEPOSIT_FOR_BURN_TOPIC_V2,
} from "../constants";
import { findChainByDomainId } from "../utils";
import { TOKEN_MESSENGER_V1_ABI } from "../abis/TokenMessengerV1";
import { useNonceUsed } from "./useNonceUsed";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import {
  useTokenMessengerMinterV1,
  useTokenMessengerMinterV2,
} from "./useSolana";

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
  hash: string;
  recipient: string;
};

export function useBurnTxDetails(tx: BurnTx) {
  const [needsRefresh, setNeedsRefresh] = useState(true);

  const srcChain = useMemo(
    () => findChainByDomainId(tx.srcDomain),
    [tx.srcDomain],
  );

  const evmRes = useEVMBurnTxDetails(tx, srcChain, needsRefresh);
  const solanaRes = useSolanaBurnTxDetails(tx, srcChain, needsRefresh);

  const { data: res, isLoading } = useMemo(
    () => (srcChain.isEVM ? evmRes : solanaRes),
    [srcChain, evmRes, solanaRes],
  );

  const { data: nonceUsed, refetch: refetchNonceUsed } = useNonceUsed(res);

  const resWithNonceUsed = useMemo(() => {
    if (res === undefined) {
      return;
    }
    if (!nonceUsed) {
      return res;
    }
    return { ...res, isMinted: nonceUsed, isPending: false, isComplete: false };
  }, [res, nonceUsed]);

  useEffect(() => {
    async function main() {
      const now = moment().utc().unix();

      if (
        !resWithNonceUsed ||
        resWithNonceUsed.isMinted ||
        resWithNonceUsed.isComplete ||
        !resWithNonceUsed.isFast
      ) {
        return;
      }

      if (resWithNonceUsed.time > now - 86400) {
        return;
      }

      await fetch(
        `https://iris-api.circle.com/v2/reattest/${resWithNonceUsed.nonce}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    main();
  }, [resWithNonceUsed]);

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

export function useEVMBurnTxDetails(
  tx: BurnTx,
  srcChain: Chain,
  needsRefresh: boolean,
) {
  const { data: receipt, isLoading: receiptLoading } =
    useWaitForTransactionReceipt({
      hash: tx.hash as Hex,
      chainId: srcChain.id as number,
      query: {
        enabled: srcChain.isEVM,
      },
    });

  const { data: messages } = useMessages({
    srcDomain: tx.srcDomain,
    txHash: tx.hash,
    refetchInterval: needsRefresh ? 10_000 : Infinity,
  });

  const { data: block, isLoading: blockLoading } = useBlock({
    blockNumber: receipt?.blockNumber,
    chainId: srcChain.id as number,
    includeTransactions: false,
    query: {
      enabled: srcChain.isEVM,
    },
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

  return {
    data: res,
    isLoading: blockLoading || receiptLoading,
  };
}

export function useSolanaBurnTxDetails(
  tx: BurnTx,
  srcChain: Chain,
  needsRefresh: boolean,
) {
  const [state, setState] = useState<UseBurnTxDetailsType>();
  const [isLoading, setIsLoading] = useState(true);
  const [reloadCounter, setReloadCounter] = useState(0);
  const { connection } = useAppKitConnection();
  const tokenMessengerMinterV1 = useTokenMessengerMinterV1();
  const tokenMessengerMinterV2 = useTokenMessengerMinterV2();

  const { data: messages } = useMessages({
    srcDomain: tx.srcDomain,
    txHash: tx.hash,
    refetchInterval: needsRefresh ? 10_000 : Infinity,
  });

  useEffect(() => {
    async function main() {
      if (
        !srcChain.isSolana ||
        !connection ||
        !tokenMessengerMinterV1 ||
        !tokenMessengerMinterV2
      ) {
        return;
      }

      const hasMessages = messages !== undefined && messages.length > 0;

      if (!hasMessages) {
        return;
      }

      const msg = messages[0];

      const dstChain = CHAINS.find(
        (c) => c.domain === Number(msg.decodedMessage?.destinationDomain),
      );

      if (!dstChain) {
        return;
      }

      const isV1 = msg.cctpVersion === 1;

      const onChainTx = await connection.getTransaction(tx.hash, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      if (!onChainTx) {
        return;
      }

      const minFinalityThreshold = isV1
        ? undefined
        : Number(msg.decodedMessage?.minFinalityThreshold ?? 0);

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
        time: Number(onChainTx.blockTime),
        srcChain,
        dstChain,
        attestation: hasMessages ? msg.attestation : "0x",
        message: hasMessages ? msg.message : "0x",
        nonce: encodedNonce,
        isPending: !hasMessages || msg.status === "pending_confirmations",
        isComplete: hasMessages && msg.status === "complete",
        isMinted: false,
        amount: BigInt(
          messages?.[0].decodedMessage?.decodedMessageBody?.amount ?? 0,
        ),
        minFinalityThreshold,
        isFast:
          isV1 || minFinalityThreshold === undefined
            ? false
            : minFinalityThreshold <= 1000,
        hash: tx.hash,
        isV1,
        isV2: !isV1,
        recipient: msg.decodedMessage?.decodedMessageBody?.mintRecipient ?? "",
      };

      setState(res);
      setIsLoading(false);
    }

    main();
  }, [
    tx,
    connection,
    messages,
    tokenMessengerMinterV1,
    tokenMessengerMinterV2,
    reloadCounter,
    srcChain,
  ]);

  useEffect(() => {
    if (!needsRefresh) {
      return;
    }

    const id = setInterval(() => {
      setReloadCounter((val) => val + 1);
    }, 10_000);

    return () => {
      clearInterval(id);
    };
  }, [needsRefresh]);

  return {
    data: state,
    isLoading: isLoading,
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
