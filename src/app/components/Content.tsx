import { Chain, mainnet, sonic } from "viem/chains";
import ChainSelect from "./ui/ChainSelect";
import { useEffect, useMemo, useState } from "react";
import TokenInput from "./ui/TokenInput";
import { useAccount, useChains, usePublicClient } from "wagmi";
import ApproveGuard from "./guard/ApproveGuard";
import { CHAINS_CONFIG, LOCAL_STORAGE_TRANSACTIONS_KEY } from "../constants";
import { formatUnits, getAddress, isAddress, pad } from "viem";
import { useFastBurnFees } from "../hooks/useApi";
import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import { BurnTx } from "../types";
import ConnectGuard from "./guard/ConnectGuard";
import Checkbox from "./ui/Checkbox";
import moment from "moment";
import { CheckIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { track } from "@vercel/analytics";
import { useUSDCBalances } from "../hooks/useUSDCBalances";
import TxCard from "./TxCard";
import { useBurn } from "../actions/useBurn";

export default function Content() {
  const isClient = useIsClient();
  const [, setTransactions] = useLocalStorage<BurnTx[]>(
    LOCAL_STORAGE_TRANSACTIONS_KEY,
    [],
  );
  const chains = useChains();
  const { address, isConnected } = useAccount();
  const { data: balances, refetch: refetchBalances } = useUSDCBalances();
  const [currentBurnTx, setCurrentBurnTx] = useState<BurnTx | undefined>();

  const [fast, setFast] = useState(true);
  const [recipientAddressOpen, setRecipientAddressOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState(address ?? "");
  const [srcChain, setSrcChain] = useState<Chain>(mainnet);
  const [dstChain, setDstChain] = useState<Chain>(sonic);
  const [amount, setAmount] = useState(0n);
  const client = usePublicClient({ chainId: srcChain.id as any });

  const recipientAddressValid = useMemo(
    () =>
      recipientAddress !== undefined &&
      isAddress(recipientAddress, { strict: false }),
    [recipientAddress],
  );

  const balance = useMemo(() => balances[srcChain.id], [balances, srcChain.id]);

  const { data: fastBurnFee, isLoading: fastBurnFeeLoading } = useFastBurnFees({
    srcDomain: CHAINS_CONFIG[srcChain?.id ?? -1]?.domain,
    dstDomain: CHAINS_CONFIG[dstChain?.id ?? -1]?.domain,
  });

  /* const {
    data: fastBurnAllowance,
    isLoading: fastBurnAllowanceLoading
  } = useFastBurnAllowance(); */

  const fee = useMemo(() => {
    if (
      !fast ||
      fastBurnFee === undefined ||
      CHAINS_CONFIG[srcChain.id].fastAvailable === false
    ) {
      return 0n;
    }

    // we add 1% to the min fee
    return (amount * BigInt(fastBurnFee) * 101n) / 1000000n;
  }, [amount, fast, fastBurnFee, srcChain.id]);

  const burn = useBurn({
    srcChain,
    dstChain,
    amount,
    recipient: recipientAddressValid ? getAddress(recipientAddress) : undefined,
    fee,
    minFinalityThreshold:
      fast && CHAINS_CONFIG[srcChain.id].fastAvailable === true ? 1000 : 2000,
  });

  const onSourceChainChange = (chain: Chain) => {
    if (dstChain.id === chain.id) {
      setDstChain(srcChain);
    }
    setSrcChain(chain);
  };

  const onDestChainChange = (chain: Chain) => {
    if (srcChain.id === chain.id) {
      setSrcChain(dstChain);
    }
    setDstChain(chain);
  };

  const onBurnClick = async () => {
    const res = await burn();

    if (!res) {
      return;
    }

    track("Burn");

    const burnTx: BurnTx = {
      hash: res,
      srcDomain: CHAINS_CONFIG[srcChain.id].domain,
    };

    setTransactions((txs) => [burnTx, ...txs]);
    setCurrentBurnTx(burnTx);
    setAmount(0n);

    await client.waitForTransactionReceipt({ hash: res });
    refetchBalances();
  };

  useEffect(() => {
    if (!recipientAddressOpen) {
      setRecipientAddress(address ?? "");
    }
  }, [recipientAddressOpen, address]);

  useEffect(() => {
    if (address !== undefined) {
      setRecipientAddress(address);
    }
  }, [address]);

  if (!isClient) {
    return;
  }

  if (currentBurnTx !== undefined) {
    return (
      <TxCard tx={currentBurnTx} clearTx={() => setCurrentBurnTx(undefined)} />
    );
  }

  return (
    <div className="card card-body rounded-2xl card-transparent">
      <h2 className="font-bold text-3xl">Start Bridging</h2>
      <h3 className="text-xl text-dark">
        Burn your USDC and claim it on the destination chain
      </h3>
      <div className="mt-6 flex flex-col gap-4">
        <div className="gap-4 flex max-md:flex-wrap">
          <div className="w-full md:w-1/2">
            <div className="text-xl mb-1">Source Chain</div>
            <ChainSelect
              chains={chains.map((c) => c)}
              value={srcChain}
              onChange={onSourceChainChange}
            />
          </div>
          <div className="w-full md:w-1/2">
            <div className="text-xl mb-1">Destination Chain</div>
            <ChainSelect
              chains={chains.map((c) => c)}
              value={dstChain}
              onChange={onDestChainChange}
            />
          </div>
        </div>
        <div>
          <div className="text-xl mb-1">Amount</div>
          <TokenInput
            chainId={srcChain.id}
            value={amount}
            onChange={(val) => setAmount(val)}
          />
        </div>
        {isConnected && (
          <div>
            {address !== undefined && (
              <div
                onClick={() => setRecipientAddressOpen((val) => !val)}
                className="flex items-center justify-end gap-x-2"
              >
                <div
                  className={`size-4 rounded ${recipientAddressOpen ? "bg-primary-gradient" : "bg-dark"} border relative`}
                >
                  {recipientAddressOpen && (
                    <CheckIcon className="size-3.5 text-darker absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <div
                  className={`cursor-default text-base ${recipientAddressOpen ? "text-primary-gradient" : "text-dark"}`}
                >
                  Send USDC to a different address
                </div>
              </div>
            )}
            {recipientAddressOpen && (
              <div>
                <div className="text-xl mb-1">Recipient</div>
                <div className="relative">
                  <input
                    type="text"
                    className={`form-control pr-12 ${!recipientAddressOpen ? "text-dark" : ""}`}
                    value={recipientAddress}
                    onInput={(e) =>
                      setRecipientAddress(e.currentTarget.value.trim())
                    }
                    disabled={!recipientAddressOpen}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {recipientAddressValid && (
                      <CheckIcon className="size-6 text-primary" />
                    )}
                    {!recipientAddressValid && (
                      <XMarkIcon className="size-6 text-danger" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between text-dark my-4 gap-3">
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            <div className="bg-primary/20 rounded-lg px-2 py-0.5">
              <div className="text-primary-gradient">
                Fee: {formatUnits(fee, 6)} USDC
              </div>
            </div>
            <div className="bg-primary/20 rounded-lg px-2 py-0.5">
              <div className="text-primary-gradient">
                ETA:{" "}
                {moment
                  .duration(
                    fast
                      ? CHAINS_CONFIG[srcChain.id].fastEta
                      : CHAINS_CONFIG[srcChain.id].eta,
                    "seconds",
                  )
                  .humanize()}
              </div>
            </div>
          </div>
          {CHAINS_CONFIG[srcChain.id].fastAvailable && (
            <div className="flex items-center gap-x-2">
              <div
                className={`font-medium ${fast ? "text-primary-gradient" : ""}`}
              >
                Fast Transfer
              </div>
              <Checkbox checked={fast} setChecked={setFast} />
            </div>
          )}
        </div>
        <ConnectGuard chain={srcChain}>
          <ApproveGuard
            tokenAddress={CHAINS_CONFIG[srcChain?.id ?? 1].usdc}
            amount={amount}
            spender={CHAINS_CONFIG[srcChain?.id ?? 1].tokenMessenger}
            bypass={balance !== undefined && amount > balance}
          >
            <button
              disabled={
                amount <= 0n ||
                balance === undefined ||
                balance < amount ||
                !recipientAddressValid
              }
              onClick={onBurnClick}
              className="btn btn-xl btn-primary"
            >
              {balance === undefined || (amount > 0n && balance < amount)
                ? "Insufficient balance"
                : recipientAddressValid
                  ? "Burn"
                  : "Invalid Recipient Address"}
            </button>
          </ApproveGuard>
        </ConnectGuard>
      </div>
    </div>
  );
}
