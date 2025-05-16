import { formatUnits } from "viem";
import { useBurnTxDetails, useETA } from "../hooks/useBurnTxDetails";
import { BurnTx } from "../types";
import Loader from "./ui/Loader";
import { USDC_ICON } from "../constants";
import ChainIcon from "./ChainIcon";
import { useState } from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import Link from "next/link";
import { useReceive } from "../actions/useReceive";
import { usePublicClient } from "wagmi";

type Props = {
  tx: BurnTx;
  clearTx: { (): void };
};

export default function TxCard({ tx, clearTx }: Props) {
  const { data, isLoading, refetchNonceUsed } = useBurnTxDetails(tx);
  const eta = useETA(data);
  const receive = useReceive(data);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const client = usePublicClient({ chainId: data?.dstChain?.id ?? 1 });

  const onClaim = async () => {
    if (!receive || !client) {
      return;
    }

    const hash = await receive();

    if (!hash) {
      return;
    }

    setConfirmationPending(true);
    await client.waitForTransactionReceipt({ hash });
    await refetchNonceUsed();
    setConfirmationPending(false);
  };

  return (
    <div className="relative card card-transparent card-body">
      <div
        onClick={clearTx}
        className="absolute top-4 right-4 rounded-lg bg-dark border border-dark cursor-pointer hover:bg-darker"
      >
        <XMarkIcon className="size-8 text-dark" />
      </div>
      <div className="flex flex-col items-center justify-center min-h-96">
        {(isLoading || !data) && (
          <Loader text="Retrieving transaction data..." />
        )}
        {!isLoading && data && (
          <>
            <div className="flex items-start">
              {(data.isPending || data.isComplete) && (
                <ArrowPathIcon className="size-8 animate-spin mt-1.5 mr-4 text-primary" />
              )}
              {data.isMinted && (
                <CheckCircleIcon className="size-8 mt-0.5 mr-4 text-primary" />
              )}
              <div>
                <h2 className="font-bold text-3xl">
                  Transfer {formatUnits(data.amount, 6)}{" "}
                  <img
                    alt="usdc icon"
                    src={USDC_ICON}
                    className="size-6 -translate-y-[3px] inline-block"
                  />{" "}
                  to {data.dstChain?.name}{" "}
                  <ChainIcon
                    chainId={data.dstChain?.id ?? 1}
                    className="inline-block -translate-y-[3px] size-6"
                  />
                </h2>
                <h3 className="text-xl text-dark">
                  {data.isPending &&
                    `Wait for your USDC to arrive on the destination chain.`}
                  {data.isComplete &&
                    `Claim your USDC on ${data.dstChain?.name} to complete the transfer`}
                  {data.isMinted &&
                    `Transfer complete. Your USDC are now available.`}
                </h3>
              </div>
            </div>
            <div className="flex mt-6 gap-x-2">
              {!data.isMinted && (
                <button
                  onClick={onClaim}
                  disabled={!data.isComplete || confirmationPending}
                  className="btn btn-primary"
                >
                  {confirmationPending
                    ? "Claiming..."
                    : data.isPending
                      ? "ETA: " + eta
                      : "Claim"}
                </button>
              )}
              {data.isMinted && (
                <button onClick={() => clearTx()} className="btn btn-primary">
                  Close
                </button>
              )}
              <Link
                href={`${data.srcChain.blockExplorers?.default.url}/tx/${data.hash}`}
                target="_blank"
                className="btn btn-secondary"
              >
                View Tx
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
