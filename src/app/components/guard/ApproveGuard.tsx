import { ReactNode, useEffect, useState } from "react";
import { Address, erc20Abi, Hex, zeroAddress } from "viem";
import {
  useAccount,
  useClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

type Props = {
  children: ReactNode;
  tokenAddress: Address;
  spender: Address;
  amount: bigint;
};

export default function ApproveGuard({
  children,
  tokenAddress,
  spender,
  amount,
}: Props) {
  const [hash, setHash] = useState<Hex>();

  const { writeContractAsync } = useWriteContract();
  const { data: txReceipt } = useWaitForTransactionReceipt({ hash });
  const { address } = useAccount();

  const { data: allowance, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address ?? zeroAddress, spender],
    query: {
      enabled: amount > 0n && address !== undefined,
    },
  });

  useEffect(() => {
    if (txReceipt === undefined) {
      return;
    }

    refetch();
    setHash(undefined);
  }, [txReceipt]);

  if (amount <= 0n || allowance === undefined || allowance >= amount) {
    return children;
  }

  return (
    <button
      className="btn btn-xl btn-primary"
      onClick={async () => {
        const txHash = await writeContractAsync({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, amount],
        });

        setHash(txHash);
      }}
    >
      Approve
    </button>
  );
}
