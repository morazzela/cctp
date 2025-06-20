import { useCallback } from "react";
import { Address, formatUnits, pad } from "viem";
import { useWriteContract } from "wagmi";
import { TOKEN_MESSENGER_ABI } from "../abis/TokenMessenger";
import { Chain } from "../types";
import { track } from "@vercel/analytics";
import { shouldUseV1, solanaAddressToHex } from "../utils";
import { TOKEN_MESSENGER_V1_ABI } from "../abis/TokenMessengerV1";

type UseBurnProps = {
  srcChain: Chain;
  dstChain: Chain;
  amount: bigint;
  fee: bigint;
  recipient?: string;
  minFinalityThreshold: number;
};

export function useBurn(props: UseBurnProps) {
  const evmBurn = useEVMBurn(props)

  return evmBurn
}

function useEVMBurn({
  srcChain,
  dstChain,
  amount,
  fee,
  recipient,
  minFinalityThreshold,
}: UseBurnProps) {
  const { writeContractAsync } = useWriteContract();

  return useCallback(async () => {
    if (!recipient || !srcChain.isEVM) {
      return;
    }

    const isV1 = shouldUseV1(srcChain, dstChain);

    let validRecipient = recipient
    if (dstChain.isSolana) {
      validRecipient = solanaAddressToHex(recipient)
    }

    const res = await writeContractAsync({
      address: (isV1
        ? srcChain.tokenMessengerV1
        : srcChain.tokenMessengerV2) as Address,
      abi: isV1 ? TOKEN_MESSENGER_V1_ABI : TOKEN_MESSENGER_ABI,
      functionName: "depositForBurn",
      args: isV1
        ? [amount, dstChain.domain, pad(validRecipient as Address), srcChain.usdc as Address]
        : [
            amount,
            dstChain.domain,
            pad(validRecipient as Address),
            srcChain.usdc as Address,
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
