import { useCallback } from "react";
import { Address, formatUnits, pad } from "viem";
import { useWriteContract } from "wagmi";
import { TOKEN_MESSENGER_ABI } from "../abis/TokenMessenger";
import { Chain } from "../types";
import { track } from "@vercel/analytics";
import {
  getSolanaUSDCAccount,
  shouldUseV1,
  solanaAddressToHex,
} from "../utils";
import { TOKEN_MESSENGER_V1_ABI } from "../abis/TokenMessengerV1";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";

type UseBurnProps = {
  srcChain: Chain;
  dstChain: Chain;
  amount: bigint;
  fee: bigint;
  recipient?: string;
  minFinalityThreshold: number;
};

export function useEVMBurn({
  srcChain,
  dstChain,
  amount,
  fee,
  recipient,
  minFinalityThreshold,
}: UseBurnProps) {
  const { writeContractAsync } = useWriteContract();
  const { connection } = useAppKitConnection();

  return useCallback(async () => {
    if (!recipient || !srcChain.isEVM || !connection) {
      return;
    }

    const isV1 = shouldUseV1(srcChain, dstChain);

    let validRecipient = recipient;
    if (dstChain.isSolana) {
      const tokenAccount = await getSolanaUSDCAccount(recipient);
      const parsedTokenAccountInfo =
        await connection.getParsedAccountInfo(tokenAccount);

      if (
        parsedTokenAccountInfo.value &&
        "parsed" in parsedTokenAccountInfo.value.data
      ) {
        if (
          parsedTokenAccountInfo.value.data.parsed.info.owner.toLowerCase() !==
          recipient.toLowerCase()
        ) {
          return;
        }
      }

      validRecipient = solanaAddressToHex(tokenAccount.toBase58());
    }

    const res = await writeContractAsync({
      address: (isV1
        ? srcChain.tokenMessengerV1
        : srcChain.tokenMessengerV2) as Address,
      abi: isV1 ? TOKEN_MESSENGER_V1_ABI : TOKEN_MESSENGER_ABI,
      functionName: "depositForBurn",
      chainId: srcChain.id as number,
      args: isV1
        ? [
            amount,
            dstChain.domain,
            pad(validRecipient as Address),
            srcChain.usdc as Address,
          ]
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
    connection,
  ]);
}
