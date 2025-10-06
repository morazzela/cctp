import { BurnTx } from "../types";
import { useBurnTxDetails, useETA } from "../hooks/useBurnTxDetails";
import moment from "moment";
import { USDC_ICON } from "../constants";
import { formatUnits } from "viem";
import ChainIcon from "./ui/ChainIcon";
import {
  ArrowLongRightIcon,
  ArrowPathIcon,
  BoltIcon,
  CheckCircleIcon,
} from "@heroicons/react/16/solid";
import Link from "next/link";
import { useMemo } from "react";

type HistoryProps = {
  transactions: BurnTx[];
  setSelectedTx: { (tx: BurnTx): void };
  selectedTx: BurnTx | undefined;
};

export default function History({
  transactions,
  setSelectedTx,
  selectedTx,
}: HistoryProps) {
  const sortedTxs = useMemo(() => {
    const txs = [...transactions];
    return txs.sort((a, b) => (a.time > b.time ? -1 : 1));
  }, [transactions]);

  return (
    <div className="w-full">
      <div className="hidden lg:flex px-3">
        <div className="w-1/5 pb-2 text-dark pl-3">Time</div>
        <div className="w-1/5 pb-2 text-dark">Source</div>
        <div className="w-1/5 pb-2 text-dark">Destination</div>
        <div className="w-1/5 pb-2 text-dark">Amount</div>
        <div className="w-1/5 pb-2 text-dark">Status</div>
      </div>
      <div className="w-full flex flex-col gap-y-2">
        {sortedTxs.slice(0, 10).map((tx) => (
          <Row
            onClick={setSelectedTx}
            key={tx.hash + "-" + tx.srcDomain}
            tx={tx}
            isSelected={selectedTx?.hash === tx.hash}
          />
        ))}
      </div>
    </div>
  );
}

function Row({
  tx,
  onClick,
  isSelected,
}: {
  isSelected: boolean;
  tx: BurnTx;
  onClick: { (tx: BurnTx): void };
}) {
  const { data, isLoading } = useBurnTxDetails(tx);
  const eta = useETA(data);

  if (isLoading || data === undefined) {
    return;
  }

  return (
    <div className="card rounded-xl relative grid grid-cols-5 gap-y-6 items-center p-3 lg:py-4 font-medium">
      <div className="max-lg:col-span-3 flex max-lg:flex-row-reverse max-lg:justify-end items-center">
        <div className="size-4 mr-2 shrink-0">
          {data.isFast && (
            <BoltIcon title="Fast Transfer" className="size-4 text-primary" />
          )}
        </div>
        <span>{moment(Number(data.time) * 1000).format("DD/MM/YY HH:mm")}</span>
      </div>
      <div className="col-span-2 flex lg:hidden justify-end items-center gap-x-1.5">
        <span>{formatUnits(data.amount, 6)}</span>
        <img alt="usdc icon" className="size-6" src={USDC_ICON} />
      </div>
      <div className="max-lg:col-span-2 flex items-center max-lg:justify-end gap-x-2">
        <ChainIcon chain={data.srcChain} className="size-6" />
        <span>{data.srcChain.name}</span>
      </div>
      <div className="flex justify-center items-center lg:hidden">
        <ArrowLongRightIcon className="size-6" />
      </div>
      <div className="max-lg:col-span-2 flex items-center max-lg:justify-start gap-x-2">
        {data.dstChain && (
          <ChainIcon chain={data.dstChain} className="size-6" />
        )}
        <span>{data.dstChain?.name}</span>
      </div>
      <div className="hidden lg:flex items-center gap-x-1.5">
        <span>{formatUnits(data.amount, 6)}</span>
        <img alt="usdc icon" className="size-6" src={USDC_ICON} />
      </div>
      <div className="flex items-center max-lg:col-span-5">
        {data.isMinted && (
          <div className="flex items-center gap-x-2">
            <span className="text-primary-gradient">Fulfilled</span>
            <CheckCircleIcon className="size-6 text-green-600" />
          </div>
        )}
        {data.isComplete && (
          <div className="flex items-center gap-x-2">
            <span className="text-primary-gradient">Received</span>
            <CheckCircleIcon className="size-6 text-green-600" />
          </div>
        )}
        {data.isPending && (
          <div>
            <div className="flex items-center gap-x-2">
              <span className="text-primary-gradient">Pending</span>
              <ArrowPathIcon className="size-6 text-purple-600 animate-spin" />
            </div>
            <div className="text-dark text-sm">ETA: {eta ?? "now"}</div>
          </div>
        )}
        <div className="max-lg:col-span-5 ml-auto flex gap-x-2">
          {data.isComplete && (
            <button
              onClick={() => onClick(tx)}
              disabled={isSelected}
              className="btn btn-sm btn-primary"
            >
              Claim
            </button>
          )}
          <Link
            href={data.srcChain.getTxUri(data.hash) ?? ""}
            target="_blank"
            className="btn btn-sm btn-primary whitespace-nowrap"
          >
            View Tx
          </Link>
        </div>
      </div>
    </div>
  );
}
