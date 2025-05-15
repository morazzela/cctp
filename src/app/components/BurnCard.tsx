import { Chain } from "viem/chains";
import ChainSelect from "./ui/ChainSelect";
import { useState } from "react";
import TokenInput from "./ui/TokenInput";
import { useAccount, useChains, useSwitchChain, useWriteContract } from "wagmi";
import ApproveGuard from "./guard/ApproveGuard";
import { CHAINS_CONFIG } from "../constants";
import { TOKEN_MESSENGER_ABI } from "../abis/TokenMessenger";
import { Hex, pad } from "viem";
import { useFastBurnFees } from "../hooks/useApi";
import { useLocalStorage } from "@uidotdev/usehooks";
import { BurnTx } from "../types";

export default function BurnCard() {
  const [, setTransactions] = useLocalStorage<BurnTx[]>("transactions", []);
  const chains = useChains();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { address, chain } = useAccount();

  const [srcChain, setSrcChain] = useState<Chain | undefined>(chain);
  const [destChain, setDestChain] = useState<Chain | undefined>();
  const [amount, setAmount] = useState(0n);

  const { data: minFee } = useFastBurnFees({
    srcDomain: CHAINS_CONFIG[srcChain?.id ?? -1]?.domain,
    dstDomain: CHAINS_CONFIG[destChain?.id ?? -1]?.domain,
  });

  const onBurnClick = async () => {
    if (
      !srcChain ||
      !destChain ||
      amount <= 0n ||
      address === undefined ||
      minFee === undefined
    ) {
      return;
    }

    const res = await writeContractAsync({
      address: CHAINS_CONFIG[srcChain.id].tokenMessenger,
      abi: TOKEN_MESSENGER_ABI,
      functionName: "depositForBurn",
      args: [
        amount,
        CHAINS_CONFIG[destChain.id].domain,
        pad(address),
        CHAINS_CONFIG[srcChain.id].usdc,
        pad("0x"),
        (amount * 5n) / 1000n,
        2000,
      ],
    });

    setTransactions((txs) => [
      { hash: res, srcDomain: CHAINS_CONFIG[srcChain.id].domain },
      ...txs,
    ]);
  };

  return (
    <div className="card card-body card-transparent">
      <h2 className="font-bold text-3xl">Start Bridging</h2>
      <h3 className="text-xl text-dark">
        Burn your USDC and claim it on the destination chain
      </h3>
      <div className="mt-6 flex flex-col gap-4">
        <div className="gap-x-2 flex">
          <div className="w-1/2">
            <div className="text-xl mb-1">Source Chain</div>
            <ChainSelect
              chains={chains.filter((c) => c.id !== destChain?.id)}
              value={srcChain}
              onChange={(chain) => {
                setSrcChain(chain);
                switchChainAsync({ chainId: chain.id as any });
              }}
            />
          </div>
          <div className="w-1/2">
            <div className="text-xl mb-1">Destination Chain</div>
            <ChainSelect
              chains={chains.filter((c) => c.id !== srcChain?.id)}
              value={destChain}
              onChange={(chain) => setDestChain(chain)}
            />
          </div>
        </div>
        <TokenInput value={amount} onChange={(val) => setAmount(val)} />
        <ApproveGuard
          tokenAddress={CHAINS_CONFIG[srcChain?.id ?? 1].usdc}
          amount={amount}
          spender={CHAINS_CONFIG[srcChain?.id ?? 1].tokenMessenger}
        >
          <button
            disabled={amount <= 0n}
            onClick={onBurnClick}
            className="btn btn-xl btn-primary"
          >
            Burn
          </button>
        </ApproveGuard>
      </div>
    </div>
  );
}
