import { useQuery } from "@tanstack/react-query";
import { Hex, verifyTypedData } from "viem";

type UseFastBurnFeesProps = {
  srcDomain: number | undefined;
  dstDomain: number | undefined;
};

export function useFastBurnAllowance() {
  return useQuery({
    queryKey: ["fast-burn-allowance"],
    queryFn: async () => {
      const res = await fetch(
        `https://iris-api.circle.com/v2/fastBurn/USDC/allowance`,
      );
      const json = (await res.json()) as {
        allowance: number;
        lastUpdated: string;
      };
      return json;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

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
  refetchInterval: number;
};

export function useMessages({
  srcDomain,
  txHash,
  refetchInterval,
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
    staleTime: refetchInterval,
    refetchInterval: refetchInterval,
  });
}
