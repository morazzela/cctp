import ChainSelect from "./ui/ChainSelect";
import { useCallback, useEffect, useMemo, useState } from "react";
import TokenInput from "./ui/TokenInput";
import { useAccount, usePublicClient } from "wagmi";
import ApproveGuard from "./guard/ApproveGuard";
import { ETHEREUM, LOCAL_STORAGE_TRANSACTIONS_KEY, SONIC } from "../constants";
import { formatUnits, getAddress, isAddress, parseUnits } from "viem";
import { useFastBurnAllowance, useFastBurnFees } from "../hooks/useApi";
import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import { BurnTx, Chain } from "../types";
import ConnectGuard from "./guard/ConnectGuard";
import Checkbox from "./ui/Checkbox";
import moment from "moment";
import {
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { track } from "@vercel/analytics";
import { useUSDCBalances } from "../hooks/useUSDCBalances";
import TxCard from "./TxCard";
import { useBurn } from "../actions/useBurn";
import ManualClaimCard from "./ManualClaimCard";
import { useBurnLimits } from "../hooks/useBurnLimits";

export default function BurnCard() {
  const isClient = useIsClient();
  const [, setTransactions] = useLocalStorage<BurnTx[]>(
    LOCAL_STORAGE_TRANSACTIONS_KEY,
    [],
  );
  const { address, isConnected } = useAccount();
  const { data: balances, refetch: refetchBalances } = useUSDCBalances();
  const { data: fastBurnAllowance, isLoading: fastBurnAllowanceLoading } =
    useFastBurnAllowance();
  const { data: burnLimits, isLoading: burnLimitsLoading } = useBurnLimits();
  const [currentBurnTx, setCurrentBurnTx] = useState<BurnTx | undefined>();
  const [isBurnTxFromManualClaim, setIsBurnTxFromManualClaim] = useState(false);

  const [fast, setFast] = useState(true);
  const [recipientAddressOpen, setRecipientAddressOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState(address ?? "");
  const [srcChain, setSrcChain] = useState<Chain>(ETHEREUM);
  const [dstChain, setDstChain] = useState<Chain>(SONIC);
  const [amount, setAmount] = useState(0n);
  const client = usePublicClient({ chainId: srcChain.id });
  const [bridging, setBridging] = useState(false);
  const [manualClaim, setManualClaim] = useState(false);

  const recipientAddressValid = useMemo(
    () => recipientAddress !== undefined && isAddress(recipientAddress),
    [recipientAddress],
  );

  const balance = useMemo(() => balances[srcChain.id], [balances, srcChain.id]);

  const { data: fastBurnFee, isLoading: fastBurnFeeLoading } = useFastBurnFees({
    srcDomain: srcChain.domain,
    dstDomain: dstChain.domain,
  });

  const isLoading = useMemo(() => {
    return fastBurnFeeLoading || fastBurnAllowanceLoading || burnLimitsLoading;
  }, [fastBurnFeeLoading, fastBurnAllowanceLoading, burnLimitsLoading]);

  const isFastTransferAvailable = useMemo(() => {
    if (fastBurnAllowanceLoading || fastBurnAllowance === undefined) {
      return false;
    }

    return (
      srcChain.fastETA !== undefined &&
      amount <= BigInt(parseUnits(fastBurnAllowance.allowance.toFixed(), 6))
    );
  }, [fastBurnAllowance, fastBurnAllowanceLoading, srcChain.fastETA, amount]);

  const exceedsBurnAllowance = useMemo(() => {
    return (
      !burnLimitsLoading &&
      burnLimits[srcChain.id] > 0n &&
      amount > burnLimits[srcChain.id]
    );
  }, [burnLimits, amount, srcChain.id, burnLimitsLoading]);

  const fee = useMemo(() => {
    if (
      !fast ||
      fastBurnFee === undefined ||
      isFastTransferAvailable === false
    ) {
      return 0n;
    }

    const fee = (amount * BigInt(fastBurnFee)) / 10000n;
    const remainder = (amount * BigInt(fastBurnFee)) % 10000n;

    return remainder === 0n ? fee : fee + 1n;
  }, [amount, fast, fastBurnFee, isFastTransferAvailable]);

  const buttonText = useMemo(() => {
    if (exceedsBurnAllowance) {
      return `Exceeds Circle's allowance`;
    }

    if (balance === undefined || (amount > 0n && balance < amount)) {
      return "Insufficient Balance";
    }

    if (!recipientAddressValid) {
      return "Invalid Recipient Address";
    }

    if (bridging) {
      return "Bridging...";
    }

    if (srcChain.fastETA !== undefined && fast && !isFastTransferAvailable) {
      return "Fast Transfer not Available";
    }

    return "Bridge";
  }, [
    balance,
    amount,
    recipientAddressValid,
    bridging,
    exceedsBurnAllowance,
    fast,
    isFastTransferAvailable,
    srcChain.fastETA,
  ]);

  const burn = useBurn({
    srcChain,
    dstChain,
    amount,
    recipient: recipientAddressValid ? getAddress(recipientAddress) : undefined,
    fee,
    minFinalityThreshold: fast && isFastTransferAvailable ? 1000 : 2000,
  });

  const onSourceChainChange = useCallback(
    (chain: Chain) => {
      if (dstChain.id === chain.id) {
        setDstChain(srcChain);
      }
      setSrcChain(chain);
    },
    [dstChain.id, srcChain],
  );

  const onDestChainChange = (chain: Chain) => {
    if (srcChain.id === chain.id) {
      setSrcChain(dstChain);
    }
    setDstChain(chain);
  };

  const onBurnClick = async () => {
    if (!address) {
      return;
    }

    setBridging(true);

    const res = await burn().catch(() => setBridging(false));

    if (!res) {
      return;
    }

    const receipt = await client?.waitForTransactionReceipt({ hash: res });
    const block = await client?.getBlock({ blockNumber: receipt?.blockNumber });

    track("Burn");

    const burnTx: BurnTx = {
      hash: res,
      srcDomain: srcChain.domain,
      time: Number(block?.timestamp ?? 0),
      fromAddress: address,
    };

    setBridging(false);
    setTransactions((txs) => [burnTx, ...txs]);
    setIsBurnTxFromManualClaim(false);
    setCurrentBurnTx(burnTx);
    setAmount(0n);

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
      <TxCard
        isManual={isBurnTxFromManualClaim}
        tx={currentBurnTx}
        clearTx={() => {
          setCurrentBurnTx(undefined);
          setIsBurnTxFromManualClaim(false);
        }}
      />
    );
  }

  if (manualClaim) {
    return (
      <ManualClaimCard
        onClose={() => setManualClaim(false)}
        onLoaded={(tx) => {
          setManualClaim(false);
          setCurrentBurnTx(tx);
          setIsBurnTxFromManualClaim(true);
        }}
      />
    );
  }

  return (
    <div className="relative card card-body rounded-2xl card-transparent w-full lg:max-w-3xl">
      <div className="flex justify-between items-start max-lg:flex-col-reverse max-lg:gap-y-4 max-lg:items-end">
        <div className="w-full">
          <div className="flex items-center gap-x-4">
            <svg
              width="39"
              height="39"
              viewBox="0 0 39 39"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              className="text-primary-light dark:text-dark-primary"
            >
              <mask
                id="mask0_2953_2413"
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="39"
                height="39"
              >
                <rect width="39" height="39" fill="url(#pattern0_2953_2413)" />
              </mask>
              <g mask="url(#mask0_2953_2413)">
                <rect width="39" height="39" fill="currentColor" />
              </g>
              <defs>
                <pattern
                  id="pattern0_2953_2413"
                  patternContentUnits="objectBoundingBox"
                  width="1"
                  height="1"
                >
                  <use
                    xlinkHref="#image0_2953_2413"
                    transform="scale(0.00195312)"
                  />
                </pattern>
                <image
                  id="image0_2953_2413"
                  width="512"
                  height="512"
                  preserveAspectRatio="none"
                  xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAACAKADAAQAAAABAAACAAAAAAAL+LWFAAAfPklEQVR4Ae3dPbAkVRUAYLGooozASDF5arIYrURo9NRkNdoQsy0iLJMtTTZ8mhiiJJhRRUIZUWVCGQEmqAlKsmqyQAKSqCSoEZ4Dr4vZYd7fzJ2ee/t8t+puz8+b7nu+0337TM+8t5/7nEaAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAjsReCBvax1rJWeDDLct2OcLwwyVsMkQKCuwM0I/ZuDhP/zQcZpmHsS+CjWO0J/ZU/xWy0BAgRaCjwfKxthTs0xlm6fLx294AkQIECAQFEBBUDRxAubAAECBGoLKABq51/0BAgQIFBUQAFQNPHCJkCAAIHaAgqA2vkXPQECBAgUFVAAFE28sAkQIECgtoACoHb+RU+AAAECRQUUAEUTL2wCBAgQqC2gAKidf9ETIECAQFEBBUDRxAubAAECBGoLKABq51/0BAgQIFBUQAFQNPHCJkCAAIHaAgqA2vkXPQECBAgUFVAAFE28sAkQ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+ggQIECAwAACCoABkmSIBAgQIECgtYACoLWo9REgQIAAgQEEFAADJMkQCRAgQIBAawEFQGtR6yNAgAABAgMIKAAGSJIhEiBAgACB1gIKgNai1keAAAECBAYQeHBPY/xtrPedPa279Wp/1nqFe1rfW7HeF/a0bqslQIBAK4GbsaLHW61sz+v52Z7X32r1b7dakfXcL/BR3B2hv3L/sN0jQIBAlwLPx6hGmFNzjKWbjwBKp1/wBAgQIFBVQAFQNfPiJkCAAIHSAgqA0ukXPAECBAhUFVAAVM28uAkQIECgtIACoHT6BU+AAAECVQUUAFUzL24CBAgQKC2gACidfsETIECAQFUBBUDVzIubAAECBEoLKABKp1/wBAgQIFBVQAFQNfPiJkCAAIHSAgqA0ukXPAECBAhUFVAAVM28uAkQIECgtIACoHT6BU+AAAECVQUUAFUzL24CBAgQKC2gACidfsETIECAQFUBBUDVzIubAAECBEoLKABKp1/wBAgQIFBVQAFQNfPiJkCAAIHSAgqA0ukXPAECBAhUFVAAVM28uAkQIECgtIACoHT6BU+AAAECVQUUAFUzL24CBAgQKC2gACidfsETIECAQFUBBUDVzIubAAECBEoLKABKp1/wBAgQIFBVQAFQNfPiJkCAAIHSAgqA0ukXPAECBAhUFVAAVM28uAkQIECgtIACoHT6BU+AAAECVQUUAFUzL24CBAgQKC2gACidfsETIECAQFUBBUDVzIubAAECBEoLKABKp1/wBAgQIFBVQAFQNfPiJkCAAIHSAgqA0ukXPAECBAhUFVAAVM28uAkQIECgtIACoHT6BU+AAAECVQUUAFUzL24CBAgQKC2gACidfsETIECAQFUBBUDVzIubAAECBEoLKABKp1/wBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECgD4H/A6uGSpUxC3qoAAAAAElFTkSuQmCC"
                />
              </defs>
            </svg>
            <h2 className="font-semibold text-3xl">Start Bridging</h2>
          </div>
          <h3 className="text-base text-dark dark:text-light mt-4">
            Move your USDC instantly with zero added fees.
          </h3>
        </div>
        <button
          onClick={() => setManualClaim(true)}
          className="btn whitespace-nowrap"
        >
          Manually Claim
        </button>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <div className="gap-4 flex max-md:flex-wrap">
          <div className="w-full md:w-1/2">
            <div className="text-lg mb-1">Source Chain</div>
            <ChainSelect
              value={srcChain}
              onChange={onSourceChainChange}
              withBalances
            />
          </div>
          <div className="w-full md:w-1/2">
            <div className="text-lg mb-1">Destination Chain</div>
            <ChainSelect
              value={dstChain}
              onChange={onDestChainChange}
              withBalances
            />
          </div>
        </div>
        <div>
          <div className="text-lg mb-1">Amount</div>
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
                  className={`size-4 rounded ${recipientAddressOpen ? "bg-primary-light border-primary-light dark:bg-dark-primary dark:border-dark-primary" : "bg-lighter dark:bg-dark"} border relative`}
                >
                  {recipientAddressOpen && (
                    <CheckIcon className="size-3.5 text-lighter dark:text-darker absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <div
                  className={`cursor-default text-sm ${recipientAddressOpen ? "text-primary-gradient" : "text-dark"}`}
                >
                  Send to a different address
                </div>
              </div>
            )}
            {recipientAddressOpen && (
              <div>
                <div className="text-lg mb-1">Recipient</div>
                <div className="relative">
                  <input
                    type="text"
                    className={`form-control pr-12 ${!recipientAddressOpen ? "text-dark" : ""}`}
                    value={recipientAddress}
                    onInput={(e) => {
                      const val = e.currentTarget.value.trim();

                      try {
                        setRecipientAddress(getAddress(val));
                      } catch (err) {
                        console.error(err);
                        setRecipientAddress(val);
                      }
                    }}
                    disabled={!recipientAddressOpen}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {recipientAddressValid && (
                      <CheckCircleIcon className="size-6 text-green-600" />
                    )}
                    {!recipientAddressValid && (
                      <div className="size-5.5 rounded-full bg-danger">
                        <XMarkIcon className="size-5.5 text-lighter" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between text-dark my-4 gap-x-3 gap-y-6">
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            <div className="bg-primary-light/20 dark:bg-dark-primary/20 rounded-lg px-3 py-1">
              <div className="text-primary-light dark:text-dark-primary font-medium">
                Fee: {formatUnits(fee, 6)} USDC
              </div>
            </div>
            <div className="bg-primary-light/20 dark:bg-dark-primary/20 rounded-lg px-3 py-1">
              <div className="text-primary-light dark:text-dark-primary font-medium">
                ETA:{" "}
                {moment
                  .duration(
                    fast && isFastTransferAvailable
                      ? srcChain.fastETA
                      : srcChain.standardETA,
                    "seconds",
                  )
                  .humanize()}
              </div>
            </div>
          </div>
          {isFastTransferAvailable && (
            <div className="cursor-pointer flex items-center gap-x-2">
              <div
                onClick={() => setFast((val) => !val)}
                className={`font-medium ${fast ? "text-primary-light dark:text-dark-primary" : ""}`}
              >
                Fast Transfer
              </div>
              <Checkbox checked={fast} setChecked={setFast} />
            </div>
          )}
        </div>
        <ConnectGuard chain={srcChain}>
          <ApproveGuard
            tokenAddress={srcChain.usdcAddress}
            amount={amount}
            spender={srcChain.tokenMessengerAddress}
            bypass={balance !== undefined && amount > balance}
          >
            <button
              disabled={
                amount <= 0n ||
                balance === undefined ||
                balance < amount ||
                !recipientAddressValid ||
                bridging
              }
              onClick={onBurnClick}
              className="btn btn-xl btn-primary"
            >
              {buttonText}
            </button>
          </ApproveGuard>
        </ConnectGuard>
      </div>
      <div className="absolute w-full text-center top-full translate-y-2 left-1/2 -translate-x-1/2 text-darker/50 dark:text-lighter/30 text-xs">
        This website does not charge you any extra fees.
      </div>
    </div>
  );
}
