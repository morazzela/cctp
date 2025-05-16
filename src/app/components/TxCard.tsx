import { formatUnits } from "viem";
import { useBurnTxDetails, useETA } from "../hooks/useBurnTxDetails";
import { BurnTx } from "../types";
import Loader from "./ui/Loader";
import { USDC_ICON } from "../constants";
import ChainIcon from "./ChainIcon";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import Link from "next/link";
import { useReceive } from "../actions/useReceive";
import { usePublicClient } from "wagmi";
import moment from "moment";

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
    setClaimed(true);
  };

  const infos = useMemo(() => {
    if (data === undefined) {
      return;
    }

    return [
      {
        label: "Time",
        value: moment(data.time * 1000).format("DD/MM/YY HH:mm"),
      },
      {
        label: "Source",
        value: (
          <div className="flex items-center gap-x-2">
            <span>{data.srcChain.name}</span>
            <ChainIcon chainId={data.srcChain.id} className="size-4" />
          </div>
        ),
      },
      {
        label: "Destination",
        value: (
          <div className="flex items-center gap-x-2">
            <span>{data.dstChain?.name}</span>
            <ChainIcon chainId={data.dstChain?.id ?? 1} className="size-4" />
          </div>
        ),
      },
      {
        label: "Amount",
        value: (
          <div className="flex items-center gap-x-2">
            <span>{formatUnits(data.amount, 6)}</span>
            <img alt="usdc-icon" src={USDC_ICON} className="size-4" />
          </div>
        ),
      },
      {
        label: "Status",
        value: (
          <div className="flex items-center gap-x-2">
            {data.isPending && (
              <ArrowPathIcon className="size-4 animate-spin text-danger" />
            )}
            {data.isMinted && (
              <CheckCircleIcon className="size-4 text-primary" />
            )}

            {data.isPending && <span className="text-danger">Pending</span>}
            {data.isComplete && <span className="text-danger">Received</span>}
            {data.isMinted && (
              <span className="text-primary-gradient">Fulfilled</span>
            )}
          </div>
        ),
      },
      {
        label: "Transaction",
        value: (
          <Link
            href={`${data.srcChain.blockExplorers?.default.url}/tx/${data.hash}`}
            target="_blank"
            className="text-primary"
          >
            {data.hash.substring(0, 6) + ".." + data.hash.substring(62)}
          </Link>
        ),
      },
    ];
  }, [data]);

  useEffect(() => {
    if (!claimed) {
      return;
    }

    setTimeout(() => {
      setClaimed(false);
    }, 3000);
  }, [claimed]);

  return (
    <div className="relative card card-transparent card-body min-h-96">
      <div
        onClick={clearTx}
        className="absolute top-4 right-4 rounded-lg bg-dark border border-dark cursor-pointer hover:bg-darker"
      >
        <XMarkIcon className="size-8 text-dark" />
      </div>
      <div>
        {(isLoading || !infos || !data) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader text="Fetching transaction data..." />
          </div>
        )}
        {!isLoading && infos && data && (
          <>
            <div className="flex items-start">
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
            <div className="flex flex-col my-6 divide-y divide-dark">
              {infos.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-3"
                >
                  <div className="text-dark">{label}</div>
                  <div>{value}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-x-2">
              {data.isMinted && !claimed ? (
                <button
                  onClick={() => clearTx()}
                  className="btn btn-xl w-full btn-primary"
                >
                  Close
                </button>
              ) : (
                <button
                  onClick={onClaim}
                  disabled={!data.isComplete || confirmationPending}
                  className={`btn btn-xl w-full btn-primary ${data.isMinted ? "disabled:text-primary outline disabled:outline-primary" : ""}`}
                >
                  {confirmationPending
                    ? "Claiming..."
                    : data.isPending
                      ? "ETA: " + eta
                      : !data.isMinted
                        ? "Claim"
                        : "Claimed !"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
