import { useAccount, useChains, useReadContracts } from "wagmi";
import { CHAINS_CONFIG } from "../constants";
import { erc20Abi, zeroAddress } from "viem";
import { useMemo } from "react";

type UseUSDCBalancesProps = {
  enabled?: boolean;
};

export function useUSDCBalances(props?: UseUSDCBalancesProps) {
  const chains = useChains();
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContracts({
    contracts: chains.map((chain) => {
      return {
        address: CHAINS_CONFIG[chain.id].usdc,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address ?? zeroAddress],
        chainId: chain.id,
      } as const;
    }),
    allowFailure: true,
    query: {
      enabled: props?.enabled !== false && address !== undefined,
      staleTime: 5_000,
    },
  });

  const res = useMemo(() => {
    const res: { [key: number]: bigint } = {};

    for (const index in chains) {
      res[chains[index].id] = data?.[index]?.result ?? 0n;
    }

    return res;
  }, [data, chains]);

  return {
    data: res,
    isLoading,
    refetch,
  };
}
