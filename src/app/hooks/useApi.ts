import { useQuery } from "@tanstack/react-query";
import { Hex } from "viem";

type UseFastBurnFeesProps = {
  srcDomain: number | undefined;
  dstDomain: number | undefined;
  enabled: boolean;
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
  });
}

export function useFastBurnFees({
  srcDomain,
  dstDomain,
  enabled,
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
    enabled: enabled && srcDomain !== undefined && dstDomain !== undefined,
    staleTime: 60_000,
  });
}

type UseMessagesAndAttestationsProps = {
  srcDomain: number;
  txHash: string;
  refetchInterval: number;
  enabled?: boolean;
};

export function useMessages({
  srcDomain,
  txHash,
  refetchInterval,
  enabled,
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
          decodedMessage?: {
            sourceDomain: string;
            sender: string;
            recipient: string;
            nonce: string;
            messageBody: string;
            destinationDomain: string;
            destinationCaller: string;
            minFinalityThreshold?: string;
            decodedMessageBody?: {
              amount: string;
              burnToken: string;
              messageSender: string;
              mintRecipient: string;
              maxFee?: string;
            };
          };
        }[];
      };
      return json.messages;
    },
    enabled,
    staleTime: refetchInterval,
    refetchInterval: refetchInterval,
  });
}
