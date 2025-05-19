import { useCallback } from "react";
import { Address, pad } from "viem";
import { useWriteContract } from "wagmi";
import { TOKEN_MESSENGER_ABI } from "../abis/TokenMessenger";
import { Chain } from "../types";
import { track } from "@vercel/analytics";

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

    const res = await writeContractAsync({
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

    track("Burn", {
      srcChain: srcChain.name,
      dstChain: dstChain.name,
      amount: amount.toString(),
    });

    return res;
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
