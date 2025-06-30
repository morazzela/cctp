import { useReadContracts } from "wagmi";
import { TOKEN_MINTER_ABI } from "../abis/TokenMinter";
import { useMemo } from "react";
import { CHAINS } from "../constants";
import { Address } from "viem";

export function useBurnLimits() {
  const v1EVMChains = useMemo(
    () => CHAINS.filter((c) => c.hasV1 && c.isEVM),
    [],
  );
  const v2EVMChains = useMemo(
    () => CHAINS.filter((c) => c.hasV2 && c.isEVM),
    [],
  );

  const { data: v1Data, isLoading: v1Loading } = useReadContracts({
    contracts: v1EVMChains.map((chain) => {
      return {
        address: chain.tokenMinterV1 as Address,
        abi: TOKEN_MINTER_ABI,
        functionName: "burnLimitsPerMessage",
        args: [chain.usdc],
        chainId: chain.id as number,
      } as const;
    }),
    query: {
      staleTime: 60 * 60 * 24,
    },
  });

  const { data: v2Data, isLoading: v2Loading } = useReadContracts({
    contracts: v2EVMChains.map((chain) => {
      return {
        address: chain.tokenMinterV2 as Address,
        abi: TOKEN_MINTER_ABI,
        functionName: "burnLimitsPerMessage",
        args: [chain.usdc],
        chainId: chain.id as number,
      } as const;
    }),
    query: {
      staleTime: 60 * 60 * 24,
    },
  });

  const res = useMemo(() => {
    const res: { [key: number]: { [key: number]: bigint } } = {};

    for (const i in CHAINS) {
      res[CHAINS[i].domain] = {
        1: -1n, // -1 means infinite (can't fetch limit on solana)
        2: -1n,
      };
    }

    for (const i in v1EVMChains) {
      res[v1EVMChains[i].domain][1] = v1Data?.[i].result ?? 0n;
    }

    for (const i in v2EVMChains) {
      res[v2EVMChains[i].domain][2] = v2Data?.[i].result ?? 0n;
    }

    return res;
  }, [v1Data, v2Data, v1EVMChains, v2EVMChains]);

  const isLoading = useMemo(
    () => v1Loading || v2Loading,
    [v1Loading, v2Loading],
  );

  return {
    data: res,
    isLoading,
  };
}
