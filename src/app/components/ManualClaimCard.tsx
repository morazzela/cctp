import { useChains, usePublicClient } from "wagmi";
import ChainSelect from "./ui/ChainSelect";
import { useEffect, useMemo, useState } from "react";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { Chain, Hash, isHash } from "viem";
import { useLocalStorage } from "@uidotdev/usehooks";
import { CHAINS_CONFIG, LOCAL_STORAGE_TRANSACTIONS_KEY } from "../constants";
import { BurnTx } from "../types";

type Props = {
  onClose: { (): void };
  onLoaded: { (tx: BurnTx): void };
};

export default function ManualClaimCard({ onClose, onLoaded }: Props) {
  const [txs, setTxs] = useLocalStorage<BurnTx[]>(
    LOCAL_STORAGE_TRANSACTIONS_KEY,
    [],
  );

  const chains = useChains();
  const [chain, setChain] = useState<Chain>(chains[0]);
  const client = usePublicClient({ chainId: chain.id });
  const [checking, setChecking] = useState(false);
  const [hash, setHash] = useState("");
  const [notFound, setNotFound] = useState(false);

  const isValidHash = useMemo(() => {
    return isHash(hash);
  }, [hash]);

  const alreadyExists = useMemo(() => {
    if (!isValidHash) {
      return false;
    }

    return txs.some((tx) => tx.hash.toLowerCase() === hash.toLowerCase());
  }, [txs, hash, isValidHash]);

  const onCheck = async () => {
    if (!isValidHash || !chain || !client || client.chain.id !== chain.id) {
      return;
    }

    setChecking(true);

    const tx = await client
      .getTransaction({ hash: hash as Hash })
      .catch(console.error);

    if (tx === undefined) {
      setChecking(false);
      setNotFound(true);
      return;
    }

    const block = await client
      .getBlock({ blockNumber: tx.blockNumber })
      .catch(console.error);

    if (block === undefined) {
      setChecking(false);
      setNotFound(true);
      return;
    }

    setNotFound(false);

    const burnTx: BurnTx = {
      hash: hash as Hash,
      srcDomain: CHAINS_CONFIG[chain.id].domain,
      time: Number(block.timestamp),
      fromAddress: tx.from,
    };

    if (!alreadyExists) {
      setTxs((txs) => [...txs, burnTx]);
    }

    setChecking(false);
    onLoaded(burnTx);
  };

  useEffect(() => {
    if (notFound) {
      setTimeout(() => {
        setNotFound(false);
      }, 3000);
    }
  }, [notFound]);

  return (
    <div className="relative card card-transparent max-lg:rounded-none card-body min-h-96 w-full lg:max-w-lg max-lg:fixed max-lg:left-0 max-lg:top-0 max-lg:w-screen max-lg:min-h-dvh max-lg:p-6 max-mg:bg-none max-lg:pt-16 max-lg:z-10">
      <div
        onClick={onClose}
        className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 max-lg:-translate-x-1/2 max-lg:translate-y-1/2 p-2 lg:p-1 rounded-xl bg-lighter dark:bg-darker dark:hover:bg-darker border cursor-pointer hover:bg-light"
      >
        <XMarkIcon className="size-8 lg:size-7 text-dark" />
      </div>
      <div>
        <h2 className="font-semibold text-3xl">Manually Claim</h2>
        <h3 className="text-base text-dark mt-4">
          Burn your USDC and claim it on the destination chain.
        </h3>
      </div>
      <div className="mt-6 flex flex-col gap-y-4 mb-6">
        <div>
          <div className="text-lg mb-1">Source Chain</div>
          <ChainSelect
            chains={chains.map((c) => c)}
            value={chain}
            onChange={(c) => {
              setChain(c);
            }}
          />
        </div>
        <div>
          <div className="text-lg mb-1">Transaction Hash</div>
          <input
            value={hash}
            onInput={(e) => setHash(e.currentTarget.value.trim())}
            type="text"
            className="form-control"
          />
        </div>
      </div>
      <button
        disabled={!isValidHash || checking}
        className="btn btn-xl btn-primary w-full"
        onClick={onCheck}
      >
        {!isValidHash && "Invalid Hash"}
        {!checking && notFound && "Transaction not found"}
        {!checking && isValidHash && !notFound && "Check Transaction"}
        {checking && "Checking Transaction..."}
      </button>
    </div>
  );
}
