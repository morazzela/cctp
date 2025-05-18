import { useAccount, useReadContracts } from "wagmi";
import { erc20Abi, zeroAddress } from "viem";
import { useMemo } from "react";
import { CHAINS } from "../constants";

type UseUSDCBalancesProps = {
  enabled?: boolean;
};

export function useUSDCBalances(props?: UseUSDCBalancesProps) {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContracts({
    contracts: CHAINS.map((chain) => {
      return {
        address: chain.usdcAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address ?? zeroAddress],
        chainId: chain.id,
      } as const;
    }),
    query: {
      enabled: props?.enabled !== false && address !== undefined,
    },
  });

  const res = useMemo(() => {
    const res: { [key: number]: bigint } = {};

    for (const index in CHAINS) {
      res[CHAINS[index].id] = data?.[index]?.result ?? 0n;
    }

    return res;
  }, [data]);

  return {
    data: res,
    isLoading,
    refetch,
  };
}
