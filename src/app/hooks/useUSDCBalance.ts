import { useReadContract } from "wagmi";
import { Address, erc20Abi } from "viem";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Chain } from "../types";
import { useAppKitAccount } from "@reown/appkit/react";
import { PublicKey } from "@solana/web3.js";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";

type UseUSDCBalancesProps = {
  enabled?: boolean;
};

export function useUSDCBalance(
  chain: Chain | undefined,
  props?: UseUSDCBalancesProps,
) {
  const evmBalance = useEVMUSDCBalance(chain, props);
  const solanaBalance = useSolanaUSDCBalance(chain, props);

  return useMemo(() => {
    if (chain?.isSolana) {
      return solanaBalance;
    }

    return evmBalance;
  }, [evmBalance, solanaBalance, chain]);
}

function useSolanaUSDCBalance(
  chain: Chain | undefined,
  props?: UseUSDCBalancesProps,
) {
  const [balance, setBalance] = useState(0n);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchCounter, setRefetchCounter] = useState(0);

  const { address } = useAppKitAccount({ namespace: "solana" });
  const { connection } = useAppKitConnection();

  useEffect(() => {
    async function main() {
      if (
        !connection ||
        !address ||
        !chain ||
        !chain.isSolana ||
        props?.enabled === false
      ) {
        setBalance(0n);
        setIsLoading(false);
        return;
      }

      const pk = new PublicKey(address);
      const usdc = new PublicKey(chain.usdc);

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pk, {
        mint: usdc,
      });

      let totalBalance = 0n;

      for (const acc of tokenAccounts.value) {
        const info = acc.account.data.parsed.info;
        totalBalance += BigInt(info.tokenAmount.amount);
      }

      setBalance(totalBalance);
      setIsLoading(false);
    }

    main();
  }, [refetchCounter, address, chain, connection, props?.enabled]);

  const refetch = useCallback(() => {
    setRefetchCounter((val) => val + 1);
  }, []);

  return {
    data: balance,
    isLoading,
    refetch,
  };
}

function useEVMUSDCBalance(
  chain: Chain | undefined,
  props?: UseUSDCBalancesProps,
) {
  const { address } = useAppKitAccount({ namespace: "eip155" });

  const { data, isLoading, refetch } = useReadContract({
    address: chain?.usdc as Address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as Address],
    chainId: chain?.id as number,
    query: {
      enabled:
        chain !== undefined &&
        chain.isEVM &&
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
