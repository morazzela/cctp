import { useCallback } from "react";
import { UseBurnTxDetailsType } from "../hooks/useBurnTxDetails";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { CHAINS_CONFIG } from "../constants";
import { MESSAGE_TRANSMITTER_ABI } from "../abis/MessageTransmitter";

export function useReceive(data?: UseBurnTxDetailsType) {
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { chainId } = useAccount();

  return useCallback(async () => {
    if (!data || !data.dstChain) {
      return;
    }

    if (chainId !== data.dstChain.id) {
      await switchChainAsync({ chainId: data.dstChain.id as any });
    }

    return await writeContractAsync({
      address: CHAINS_CONFIG[data.dstChain.id].messageTransmitter,
      abi: MESSAGE_TRANSMITTER_ABI,
      functionName: "receiveMessage",
      args: [data.message, data.attestation],
      chainId: data.dstChain.id as any,
    });
  }, [switchChainAsync, writeContractAsync, data, chainId]);
}
