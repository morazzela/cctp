import { BurnTx } from "../types";
import { useBlock, useChains, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { getChainIdFromDomainId } from "../utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Chain, decodeEventLog, Hex } from "viem";
import { useMessages } from "./useApi";
import { TOKEN_MESSENGER_ABI } from "../abis/TokenMessenger";
import { CHAINS_CONFIG } from "../constants";
import { MESSAGE_TRANSMITTER_ABI } from "../abis/MessageTransmitter";

type UseBurnTxDetailsType = {
  time: number,
  srcChain: Chain,
  dstChain?: Chain,
  attestation: Hex,
  message: Hex,
  nonce: Hex,
  isPending: boolean,
  isComplete: boolean,
  isMinted: boolean,
  amount: bigint,
  minFinalityThreshold: number,
}

export function useBurnTxDetails(tx: BurnTx) {
  const [needsRefresh, setNeedsRefresh] = useState(true);

  const chains = useChains();

  const chainId = useMemo(
    () => getChainIdFromDomainId(tx.srcDomain),
    [tx.srcDomain],
  );

  const { data: receipt, isLoading: receiptLoading } =
    useWaitForTransactionReceipt({ hash: tx.hash, chainId: chainId as any });

  const { data: messages } = useMessages({
    srcDomain: tx.srcDomain,
    txHash: tx.hash,
    refetchInterval: needsRefresh ? 5_000 : 60_000,
  });

  const { data: block, isLoading: blockLoading } = useBlock({
    blockHash: receipt?.blockHash,
    chainId: chainId as any,
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

    const dstChain = chains.find(
      (c) => c.id === getChainIdFromDomainId(decodedLog.args.destinationDomain),
    );

    const hasMessages = messages !== undefined && messages.length > 0

    const res: UseBurnTxDetailsType = {
      time: Number(block.timestamp),
      srcChain: chains.find((c) => c.id === chainId) as Chain,
      dstChain,
      attestation: hasMessages ? messages[0].attestation : "0x",
      message: hasMessages ? messages[0].message : "0x",
      nonce: hasMessages ? messages[0].eventNonce : "0x",
      isPending: !hasMessages || messages[0].status === "pending_confirmations",
      isComplete: hasMessages && messages[0].status === "complete",
      isMinted: false,
      amount: decodedLog.args.amount,
      minFinalityThreshold: decodedLog.args.minFinalityThreshold,
    };

    return res
  }, [block, messages, receipt]);

  const { data: nonceUsed, refetch: refetchNonceUsed } = useReadContract({
    address: CHAINS_CONFIG[res?.dstChain?.id ?? 1].messageTransmitter,
    abi: MESSAGE_TRANSMITTER_ABI,
    functionName: "usedNonces",
    args: [res?.nonce ?? "0x"],
    chainId: res?.dstChain?.id as any,
    query: {
      enabled: res !== undefined && res.nonce !== "0x" && res.dstChain !== undefined
    }
  })

  const isLoading = useMemo(
    () => receiptLoading || blockLoading,
    [receiptLoading, blockLoading],
  );

  const resWithNonceUsed = useMemo(() => {
    if (res === undefined) { return }
    const minted = nonceUsed === 1n
    if (!minted) { return res }
    return { ...res, isMinted: minted, isPending: false, isComplete: false }
  }, [res, nonceUsed])

  useEffect(() => {
    if (resWithNonceUsed && resWithNonceUsed.isMinted) {
      setNeedsRefresh(false)
    }
  }, [resWithNonceUsed])

  return {
    data: resWithNonceUsed,
    isLoading,
    refetchNonceUsed,
  };
}
