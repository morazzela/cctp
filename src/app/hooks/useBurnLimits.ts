import { useChains, useReadContracts } from "wagmi";
import { CHAINS_CONFIG } from "../constants";
import { TOKEN_MINTER_ABI } from "../abis/TokenMinter";
import { useMemo } from "react";

export function useBurnLimits() {
  const chains = useChains();

  const { data, isLoading } = useReadContracts({
    contracts: chains.map((chain) => {
      return {
        address: CHAINS_CONFIG[chain.id].tokenMinter,
        abi: TOKEN_MINTER_ABI,
        functionName: "burnLimitsPerMessage",
        args: [CHAINS_CONFIG[chain.id].usdc],
        chainId: chain.id,
      } as const;
    }),
    query: {
      staleTime: 60 * 60 * 24,
    },
  });

  const res = useMemo(() => {
    const res: { [key: number]: bigint } = {};

    for (const i in chains) {
      res[chains[i].id] = data?.[i]?.result ?? 0n;
    }

    return res;
  }, [data, chains]);

  return {
    data: res,
    isLoading,
  };
}
