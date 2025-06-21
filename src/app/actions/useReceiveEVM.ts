import { useAppKitNetwork } from "@reown/appkit/react";
import { useCallback } from "react";
import { Address } from "viem";
import { useWriteContract } from "wagmi";
import { MESSAGE_TRANSMITTER_ABI } from "../abis/MessageTransmitter";
import { UseBurnTxDetailsType } from "../hooks/useBurnTxDetails";

export function useEVMReceive(data?: UseBurnTxDetailsType) {
  const { switchNetwork } = useAppKitNetwork();
  const { writeContractAsync } = useWriteContract();
  const { chainId } = useAppKitNetwork();

  return useCallback(async () => {
    if (!data || !data.dstChain) {
      return;
    }

    if (chainId !== data.dstChain.id) {
      switchNetwork(data.dstChain.network);
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
  }, [switchNetwork, writeContractAsync, data, chainId]);
}
