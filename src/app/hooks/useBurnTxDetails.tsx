import { BurnTx } from "../types";
import { useBlock, useChains, useWaitForTransactionReceipt } from "wagmi";
import { getChainIdFromDomainId } from "../utils";
import { useMemo, useState } from "react";
import { Chain, decodeEventLog } from "viem";
import { useMessages } from "./useApi";
import { TOKEN_MESSENGER_ABI } from "../abis/TokenMessenger";

export function useBurnTxDetails(tx: BurnTx) {
  const chains = useChains();
  const chainId = useMemo(
    () => getChainIdFromDomainId(tx.srcDomain),
    [tx.srcDomain],
  );

  const { data: receipt, isLoading: receiptLoading } =
    useWaitForTransactionReceipt({ hash: tx.hash, chainId: chainId as any });
  const { data: messages, isLoading: messagesLoading } = useMessages({
    srcDomain: tx.srcDomain,
    txHash: tx.hash,
  });
  const { data: block, isLoading: blockLoading } = useBlock({
    blockHash: receipt?.blockHash,
    chainId: chainId as any,
  });

  const isLoading = useMemo(
    () => messagesLoading || receiptLoading || blockLoading,
    [messagesLoading, receiptLoading, blockLoading],
  );

  const res = useMemo(() => {
    if (isLoading || !block || !messages || messages.length === 0 || !receipt) {
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

    const dstChain = chains.find(
      (c) => c.id === getChainIdFromDomainId(decodedLog.args.destinationDomain),
    );

    return {
      time: block.timestamp,
      srcChain: chains.find((c) => c.id === chainId) as Chain,
      dstChain,
      attestation: messages[0].attestation,
      message: messages[0].message,
      isPending: messages[0].status === "pending_confirmations",
      isComplete: messages[0].status === "complete",
      amount: decodedLog.args.amount,
    };
  }, [isLoading, block, messages, receipt]);

  return {
    data: res,
    isLoading,
  };
}
