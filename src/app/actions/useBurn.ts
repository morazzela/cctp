import { useCallback } from "react";
import { Address, Chain, pad } from "viem";
import { useWriteContract } from "wagmi";
import { CHAINS_CONFIG } from "../constants";
import { TOKEN_MESSENGER_ABI } from "../abis/TokenMessenger";
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
      address: CHAINS_CONFIG[srcChain.id].tokenMessenger,
      abi: TOKEN_MESSENGER_ABI,
      functionName: "depositForBurn",
      args: [
        amount,
        CHAINS_CONFIG[dstChain.id].domain,
        pad(recipient),
        CHAINS_CONFIG[srcChain.id].usdc,
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
