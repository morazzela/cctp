import { useQuery } from "@tanstack/react-query";
import { Hex } from "viem";

type UseFastBurnFeesProps = {
  srcDomain: number | undefined;
  dstDomain: number | undefined;
};

export function useFastBurnFees({
  srcDomain,
  dstDomain,
}: UseFastBurnFeesProps) {
  return useQuery({
    queryKey: ["fast-burn-fees", srcDomain, dstDomain],
    queryFn: async () => {
      const res = await fetch(
        `https://iris-api.circle.com/v2/fastBurn/USDC/fees/${srcDomain}/${dstDomain}`,
      );
      const json = (await res.json()) as { minimumFee: number };
      return json.minimumFee;
    },
    enabled: srcDomain !== undefined && dstDomain !== undefined,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

type UseMessagesAndAttestationsProps = {
  srcDomain: number;
  txHash: Hex;
};

export function useMessages({
  srcDomain,
  txHash,
}: UseMessagesAndAttestationsProps) {
  return useQuery({
    queryKey: ["messages", srcDomain, txHash],
    queryFn: async () => {
      const res = await fetch(
        `https://iris-api.circle.com/v2/messages/${srcDomain}?transactionHash=${txHash}`,
      );
      const json = (await res.json()) as {
        messages: {
          attestation: Hex;
          message: Hex;
          eventNonce: Hex;
          cctpVersion: number;
          status: "pending_confirmations" | "complete";
        }[];
      };
      return json.messages;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
