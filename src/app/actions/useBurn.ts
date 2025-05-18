import { useCallback } from "react";
import { Address, pad } from "viem";
import { useWriteContract } from "wagmi";
import { TOKEN_MESSENGER_ABI } from "../abis/TokenMessenger";
import { Chain } from "../types";

type UseBurnProps = {
  srcChain: Chain;
  dstChain: Chain;
  amount: bigint;
  fee: bigint;
  recipient?: Address;
  minFinalityThreshold: number;
};

export function useBurn({
  srcChain,
  dstChain,
  amount,
  fee,
  recipient,
  minFinalityThreshold,
}: UseBurnProps) {
  const { writeContractAsync } = useWriteContract();

  return useCallback(async () => {
    if (!recipient) {
      return;
    }

    return writeContractAsync({
      address: srcChain.tokenMessengerAddress,
      abi: TOKEN_MESSENGER_ABI,
      functionName: "depositForBurn",
      args: [
        amount,
        dstChain.domain,
        pad(recipient),
        srcChain.usdcAddress,
        pad("0x"),
        fee,
        minFinalityThreshold,
      ],
    });
  }, [
    recipient,
    srcChain,
    dstChain,
    amount,
    fee,
    minFinalityThreshold,
    writeContractAsync,
  ]);
}
