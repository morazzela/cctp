import { useCallback } from "react";
import { Address } from "viem";
import { useWriteContract } from "wagmi";
import { MESSAGE_TRANSMITTER_ABI } from "../abis/MessageTransmitter";
import { UseBurnTxDetailsType } from "../hooks/useBurnTxDetails";

export function useEVMReceive(data?: UseBurnTxDetailsType) {
  const { writeContractAsync } = useWriteContract();

  return useCallback(async () => {
    if (!data || !data.dstChain) {
      return;
    }

    return await writeContractAsync({
      address: (data.isV1
        ? data.dstChain.messageTransmitterV1
        : data.dstChain.messageTransmitterV2) as Address,
      abi: MESSAGE_TRANSMITTER_ABI,
      functionName: "receiveMessage",
      args: [data.message, data.attestation],
      chainId: data.dstChain.id as number,
    });
  }, [writeContractAsync, data]);
}
