import { ReactNode, useEffect, useState } from "react";
import { Address, erc20Abi, Hex, isAddress, zeroAddress } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

type Props = {
  children: ReactNode;
  tokenAddress: string;
  spender: Address;
  amount: bigint;
  bypass?: boolean;
};

export default function ApproveGuard({
  children,
  tokenAddress,
  spender,
  amount,
  bypass,
}: Props) {
  const [hash, setHash] = useState<Hex>();
  const [approving, setApproving] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const { data: txReceipt } = useWaitForTransactionReceipt({ hash });
  const { address } = useAccount();

  const { data: allowance, refetch } = useReadContract({
    address: tokenAddress as Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address ?? zeroAddress, spender],
    query: {
      enabled: amount > 0n && address !== undefined && isAddress(tokenAddress),
    },
  });

  useEffect(() => {
    if (txReceipt === undefined) {
      return;
    }

    setApproving(false);
    refetch();
    setHash(undefined);
  }, [txReceipt, refetch]);

  if (
    bypass === true ||
    amount <= 0n ||
    allowance === undefined ||
    allowance >= amount
  ) {
    return children;
  }

  return (
    <button
      className="btn btn-xl btn-primary"
      disabled={approving}
      onClick={async () => {
        if (!isAddress(tokenAddress)) {
          return;
        }

        setApproving(true);

        const txHash = await writeContractAsync({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, amount],
        }).catch((err) => {
          console.error(err);
          setApproving(false);
        });

        if (txHash) {
          setHash(txHash);
        }
      }}
    >
      {approving ? "Approving..." : "Approve"}
    </button>
  );
}
