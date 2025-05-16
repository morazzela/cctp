import { BurnTx } from "../types";
import { useBurnTxDetails, useETA } from "../hooks/useBurnTxDetails";
import moment from "moment";
import { usePublicClient } from "wagmi";
import { USDC_ICON } from "../constants";
import { formatUnits } from "viem";
import ChainIcon from "./ChainIcon";
import {
  ArrowPathIcon,
  BoltIcon,
  CheckCircleIcon,
} from "@heroicons/react/16/solid";
import Link from "next/link";
import { useReceive } from "../actions/useReceive";

type HistoryProps = {
  transactions: BurnTx[];
};

export default function History({ transactions }: HistoryProps) {
  return (
    <div className="w-full">
      <div className="flex px-3">
        <div className="w-1/5 pb-2 text-dark pl-3">Time</div>
        <div className="w-1/5 pb-2 text-dark">Source</div>
        <div className="w-1/5 pb-2 text-dark">Destination</div>
        <div className="w-1/5 pb-2 text-dark">Amount</div>
        <div className="w-1/5 pb-2 text-dark">Status</div>
      </div>
      <div className="w-full flex flex-col gap-y-2">
        {transactions.slice(0, 10).map((tx) => (
          <Row key={tx.hash + "-" + tx.srcDomain} tx={tx} />
        ))}
      </div>
    </div>
  );
}

function Row({ tx }: { tx: BurnTx }) {
  const { data, isLoading, refetchNonceUsed } = useBurnTxDetails(tx);
  const client = usePublicClient({ chainId: data?.dstChain?.id });
  const eta = useETA(data);
  const receive = useReceive(data);

  const onMintClick = async () => {
    if (!receive) {
      return;
    }

    const hash = await receive();

    if (!hash) {
      return;
    }

    await client?.waitForTransactionReceipt({ hash });
    await refetchNonceUsed();
  };

  if (isLoading || data === undefined) {
    return;
  }

  return (
    <div className="card rounded-xl relative flex items-center px-3 py-5 font-medium">
      <div className="w-1/5 flex items-center">
        <div className="size-4 mr-2 shrink-0">
          {data.isFast && (
            <BoltIcon title="Fast Transfer" className="size-4 text-primary" />
          )}
        </div>
        <span>
          {moment(Number(data.time) * 1000).format("DD/MM/YYYY HH:mm")}
        </span>
      </div>
      <div className="w-1/5 flex items-center gap-x-2">
        <ChainIcon chainId={data.srcChain.id} className="size-4" />
        <span>{data.srcChain.name}</span>
      </div>
      <div className="w-1/5 flex items-center gap-x-2">
        {data.dstChain && (
          <ChainIcon chainId={data.dstChain.id} className="size-4" />
        )}
        <span>{data.dstChain?.name}</span>
      </div>
      <div className="w-1/5 flex items-center gap-x-1.5">
        <span>{formatUnits(data.amount, 6)}</span>
        <img alt="usdc icon" className="size-4" src={USDC_ICON} />
      </div>
      <div className="w-1/5 flex items-center">
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
        <div className="ml-auto flex gap-x-2">
          {data.isComplete && (
            <button onClick={onMintClick} className="btn btn-sm btn-primary">
              Claim
            </button>
          )}
          <Link
            href={`${data.srcChain.blockExplorers?.default.url}/tx/${data.hash}`}
            target="_blank"
            className="btn rounded-xl btn-primary"
          >
            View Tx
          </Link>
        </div>
      </div>
    </div>
  );
}
