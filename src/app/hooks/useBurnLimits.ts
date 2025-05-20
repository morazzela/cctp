import { useReadContracts } from "wagmi";
import { TOKEN_MINTER_ABI } from "../abis/TokenMinter";
import { useMemo } from "react";
import { CHAINS } from "../constants";
import { Address } from "viem";

export function useBurnLimits() {
  const v1Chains = useMemo(() => CHAINS.filter((c) => c.hasV1), []);
  const v2Chains = useMemo(() => CHAINS.filter((c) => c.hasV2), []);

  const { data: v1Data, isLoading: v1Loading } = useReadContracts({
    contracts: v1Chains.map((chain) => {
      return {
        address: chain.tokenMinterV1 as Address,
        abi: TOKEN_MINTER_ABI,
        functionName: "burnLimitsPerMessage",
        args: [chain.usdc],
        chainId: chain.id,
      } as const;
    }),
    query: {
      staleTime: 60 * 60 * 24,
    },
  });

  const { data: v2Data, isLoading: v2Loading } = useReadContracts({
    contracts: v2Chains.map((chain) => {
      return {
        address: chain.tokenMinterV2 as Address,
        abi: TOKEN_MINTER_ABI,
        functionName: "burnLimitsPerMessage",
        args: [chain.usdc],
        chainId: chain.id,
      } as const;
    }),
    query: {
      staleTime: 60 * 60 * 24,
    },
  });

  const res = useMemo(() => {
    const res: { [key: number]: { [key: number]: bigint } } = {};

    for (const i in CHAINS) {
      res[CHAINS[i].domain] = {};
    }

    for (const i in v1Chains) {
      res[v1Chains[i].domain][1] = v1Data?.[i].result ?? 0n;
    }

    for (const i in v2Chains) {
      res[v2Chains[i].domain][2] = v2Data?.[i].result ?? 0n;
    }

    return res;
  }, [v1Data, v2Data, v1Chains, v2Chains]);

  const isLoading = useMemo(
    () => v1Loading || v2Loading,
    [v1Loading, v2Loading],
  );

  return {
    data: res,
    isLoading,
  };
}
