import { useReadContracts } from "wagmi";
import { TOKEN_MINTER_ABI } from "../abis/TokenMinter";
import { useMemo } from "react";
import { CHAINS } from "../constants";

export function useBurnLimits() {
  const { data, isLoading } = useReadContracts({
    contracts: CHAINS.map((chain) => {
      return {
        address: chain.tokenMinterAddress,
        abi: TOKEN_MINTER_ABI,
        functionName: "burnLimitsPerMessage",
        args: [chain.usdcAddress],
        chainId: chain.id,
      } as const;
    }),
  });

  const res = useMemo(() => {
    const res: { [key: number]: bigint } = {};

    for (const i in CHAINS) {
      res[CHAINS[i].id] = data?.[i]?.result ?? 0n;
    }

    return res;
  }, [data]);

  return {
    data: res,
    isLoading,
  };
}
