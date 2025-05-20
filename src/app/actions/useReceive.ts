import { useCallback } from "react";
import { UseBurnTxDetailsType } from "../hooks/useBurnTxDetails";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { MESSAGE_TRANSMITTER_ABI } from "../abis/MessageTransmitter";
import { Address } from "viem";

export function useReceive(data?: UseBurnTxDetailsType) {
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { chainId } = useAccount();

  return useCallback(async () => {
    if (!data || !data.dstChain) {
      return;
    }

    if (chainId !== data.dstChain.id) {
      await switchChainAsync({ chainId: data.dstChain.id });
    }

    return await writeContractAsync({
      address: (data.isV1
        ? data.dstChain.messageTransmitterV1
        : data.dstChain.messageTransmitterV2) as Address,
      abi: MESSAGE_TRANSMITTER_ABI,
      functionName: "receiveMessage",
      args: [data.message, data.attestation],
      chainId: data.dstChain.id,
    });
  }, [switchChainAsync, writeContractAsync, data, chainId]);
}
