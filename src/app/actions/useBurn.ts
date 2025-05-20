import { useCallback } from "react";
import { Address, formatUnits, pad } from "viem";
import { useWriteContract } from "wagmi";
import { TOKEN_MESSENGER_ABI } from "../abis/TokenMessenger";
import { Chain } from "../types";
import { track } from "@vercel/analytics";
import { shouldUseV1 } from "../utils";
import { TOKEN_MESSENGER_V1_ABI } from "../abis/TokenMessengerV1";

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

    const isV1 = shouldUseV1(srcChain, dstChain);

    const res = await writeContractAsync({
      address: (isV1
        ? srcChain.tokenMessengerV1
        : srcChain.tokenMessengerV2) as Address,
      abi: isV1 ? TOKEN_MESSENGER_V1_ABI : TOKEN_MESSENGER_ABI,
      functionName: "depositForBurn",
      args: isV1
        ? [amount, dstChain.domain, pad(recipient), srcChain.usdc]
        : [
            amount,
            dstChain.domain,
            pad(recipient),
            srcChain.usdc,
            pad("0x"),
            fee,
            minFinalityThreshold,
          ],
    });

    track("Burn", {
      srcChain: srcChain.name,
      dstChain: dstChain.name,
      amount: formatUnits(amount, 6),
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
