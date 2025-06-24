import { formatUnits, Hex } from "viem";
import { useBurnTxDetails, useETA } from "../hooks/useBurnTxDetails";
import { BurnTx, Chain } from "../types";
import Loader from "./ui/Loader";
import { USDC_ICON } from "../constants";
import ChainIcon from "./ui/ChainIcon";
import { useEffect, useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { useReceive } from "../actions/useReceive";
import { usePublicClient } from "wagmi";
import ConnectGuard from "./guard/ConnectGuard";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { sleep } from "../utils";

type Props = {
  tx: BurnTx;
  clearTx: { (): void };
};

export default function TxCard({ tx, clearTx }: Props) {
  const { data, isLoading, refetchNonceUsed } = useBurnTxDetails(tx);
  const eta = useETA(data);
  const receive = useReceive(data);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const client = usePublicClient({
    chainId: (data?.dstChain?.id ?? 1) as number,
  });
  const { connection } = useAppKitConnection();

  const onClaim = async () => {
    if (
      !receive ||
      !data ||
      !data.dstChain ||
      (data.dstChain.isEVM && !client) ||
      (data.dstChain.isSolana && !connection)
    ) {
      return;
    }

    setClaiming(true);
    const hash = await receive().catch(() => setClaiming(false));
    setClaiming(false);

    if (!hash) {
      return;
    }

    setConfirmationPending(true);
    if (data.dstChain.isEVM) {
      await client?.waitForTransactionReceipt({ hash: hash as Hex });
    } else if (data.dstChain.isSolana) {
      let success = false;
      do {
        const tx = await connection?.getTransaction(hash, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });

        success = !!tx;

        await sleep(5_000);
      } while (success === false);
    }
    await refetchNonceUsed();
    setConfirmationPending(false);
    setClaimed(true);
  };

  useEffect(() => {
    if (!claimed) {
      return;
    }

    setTimeout(() => {
      setClaimed(false);
    }, 1500);
  }, [claimed]);

  return (
    <div className="relative card max-lg:rounded-none card-transparent card-body min-h-96 w-full lg:max-w-3xl max-lg:fixed max-lg:left-0 max-lg:top-0 max-lg:w-screen max-lg:h-dvh max-lg:overflow-y-auto max-lg:p-6 max-mg:bg-none max-lg:pt-16 max-lg:z-10">
      <div
        onClick={clearTx}
        className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 max-lg:-translate-x-1/2 max-lg:translate-y-1/2 p-2 lg:p-1 rounded-xl bg-lighter dark:bg-darker dark:hover:bg-darker border cursor-pointer hover:bg-light"
      >
        <XMarkIcon className="size-8 lg:size-7 text-dark" />
      </div>
      <div>
        {(isLoading || !data) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader text="Fetching transaction data..." />
          </div>
        )}
        {!isLoading && data && (
          <>
            <div className="flex flex-col items-center">
              <div className="text-center w-full mt-8">
                <h2 className="font-normal max-lg:text-2xl/13 text-4xl/13 text-center">
                  Transfering{" "}
                  <span className="font-bold whitespace-nowrap">
                    {formatUnits(data.amount, 6)}{" "}
                    <img
                      alt="usdc icon"
                      src={USDC_ICON}
                      className="size-10 -translate-y-[5px] inline-block"
                    />
                  </span>{" "}
                  <br />
                  to {data.dstChain?.name}{" "}
                  <ChainIcon
                    chain={data.dstChain}
                    className="inline-block -translate-y-[5px] size-10"
                  />
                </h2>
              </div>
              <div className="flex justify-center py-8">
                <div className="relative bg-primary-light/20 dark:bg-dark-primary/20 rounded-full p-6 border border-primary-light/10 shadow-[0px_0px_100px_var(--color-primary-light-transparent)] dark:shadow-[0px_0px_100px_var(--color-dark-primary-light-transparent)]">
                  {data.isMinted && (
                    <CheckIcon className="z-10 size-16 text-primary-light dark:text-dark-primary" />
                  )}
                  {!data.isMinted && (
                    <svg
                      width="70"
                      height="70"
                      viewBox="0 0 39 39"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      className="z-50 text-primary-light dark:text-dark-primary"
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
                        <rect
                          width="39"
                          height="39"
                          fill="url(#pattern0_2953_2413)"
                        />
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
                  )}
                  <svg
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-light-transparent dark:text-dark-primary/20"
                    width={140}
                    height={140}
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx={50}
                      cy={50}
                      r={46}
                      fill="none"
                      strokeDasharray={!data.isPending ? "" : "100 1000"}
                      strokeWidth={3}
                      className={`origin-center ${!data.isPending ? "" : "animate-spin"}`}
                      stroke="currentColor"
                    />
                  </svg>
                </div>
              </div>
              <div className="font-light text-dark text-lg mb-8 text-center">
                {!data.isMinted && (
                  <span>
                    Claim your USDC on {data.dstChain?.name} once available to
                    <br />
                    complete the transfer.
                  </span>
                )}
                {data.isMinted &&
                  `You successfully claimed ${formatUnits(data.amount, 6)} USDC on ${data.dstChain?.name}`}
              </div>
            </div>
            <div className="mb-6 flex justify-center gap-x-3">
              <div className="font-bold">Status</div>
              <div className="bg-primary text-lighter px-3 py-1 rounded-lg -translate-y-1">
                {data.isPending && "Pending..."}
                {data.isComplete && "Received"}
                {data.isMinted && "Claimed"}
              </div>
            </div>
            <div className="w-full">
              {data.isMinted && !claimed ? (
                <button
                  onClick={() => clearTx()}
                  className="btn btn-xl w-full btn-primary"
                >
                  Close
                </button>
              ) : (
                <ConnectGuard
                  skip={data.isPending}
                  chain={data.dstChain as Chain}
                >
                  <button
                    onClick={onClaim}
                    disabled={
                      !data.isComplete || confirmationPending || claiming
                    }
                    className={`btn btn-xl w-full btn-primary`}
                  >
                    {confirmationPending
                      ? "Claiming..."
                      : data.isPending
                        ? "ETA: " + eta
                        : !data.isMinted
                          ? claiming
                            ? "Claiming..."
                            : "Claim"
                          : "Claimed !"}
                  </button>
                </ConnectGuard>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
