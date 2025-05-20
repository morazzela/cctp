import { useAccount, useReadContract } from "wagmi";
import { erc20Abi, zeroAddress } from "viem";
import { useMemo } from "react";
import { Chain } from "../types";

type UseUSDCBalancesProps = {
  enabled?: boolean;
};

export function useUSDCBalance(
  chain: Chain | undefined,
  props?: UseUSDCBalancesProps,
) {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: chain?.usdc,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    chainId: chain?.id,
    query: {
      enabled:
        chain !== undefined &&
        props?.enabled !== false &&
        address !== undefined,
      staleTime: 5_000,
    },
  });

  const res = useMemo(() => {
    return data ?? 0n;
  }, [data]);

  return {
    data: res,
    isLoading,
    refetch,
  };
}
