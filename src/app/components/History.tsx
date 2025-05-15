import { BurnTx } from "../types";
import { useBurnTxDetails } from "../hooks/useBurnTxDetails";
import moment from "moment";
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { CHAINS_CONFIG } from "../constants";
import { MESSAGE_TRANSMITTER_ABI } from "../abis/MessageTransmitter";
import { formatUnits } from "viem";
import ChainIcon from "./ChainIcon";
import Loader from "./ui/Loader";
import { ArrowPathIcon, BoltIcon, CheckCircleIcon, StrikethroughIcon } from "@heroicons/react/16/solid";

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
      <div className="card card-transparent divide-y divide-dark w-full">
        {transactions.slice(0, 10).map((tx) => (
          <Row key={tx.hash + "-" + tx.srcDomain} tx={tx} />
        ))}
      </div>
    </div>
  );
}

function Row({ tx }: { tx: BurnTx }) {
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { data, isLoading, refetchNonceUsed } = useBurnTxDetails(tx);
  const { chainId } = useAccount();
  const client = usePublicClient({ chainId: data?.dstChain?.id as any })

  const onMintClick = async () => {
    if (!data || !data.dstChain) {
      return;
    }

    if (chainId !== data.dstChain.id) {
      await switchChainAsync({ chainId: data.dstChain.id as any });
    }

    const hash = await writeContractAsync({
      address: CHAINS_CONFIG[data.dstChain.id].messageTransmitter,
      abi: MESSAGE_TRANSMITTER_ABI,
      functionName: "receiveMessage",
      args: [data.message, data.attestation],
      chainId: data.dstChain.id as any,
    });

    await client.waitForTransactionReceipt({ hash })
    await refetchNonceUsed()
  };

  return (
    <div className="relative h-16 flex items-center px-3">
      {(isLoading || data === undefined) && (
        <div className="absolute inset-0 bg-darker flex items-center justify-center">
          <Loader size="sm" />
        </div>
      )}
      {!isLoading && data !== undefined && (
        <>
          <div className="w-1/5 flex items-center">
            {data.minFinalityThreshold <= 1000 && (
              <div className="size-4 mr-2">
                <BoltIcon className="size-4 text-primary"/>
              </div>
            )}
            <span>{moment.utc(Number(data.time) * 1000).format("DD/MM/YYYY HH:mm")}</span>
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
            <img
              className="size-4"
              src="https://raw.githubusercontent.com/Shadow-Exchange/shadow-assets/main/blockchains/sonic/assets/0x29219dd400f2Bf60E5a23d13Be72B486D4038894/logo.png"
            />
          </div>
          <div className="w-1/5 flex items-center">
            {data.isMinted && (
              <div className="flex items-center gap-x-3">
                <span className="text-primary-gradient">Fulfilled</span>
                <CheckCircleIcon className="size-4 text-primary"/>
              </div>
            )}
            {data.isComplete && (
              <div className="flex items-center gap-x-3">
                <span className="text-primary-gradient">Received</span>
                <CheckCircleIcon className="size-4 text-primary"/>
              </div>
            )}
            {data.isPending && (
              <div className="flex items-center gap-x-2">
                <span className="text-primary-gradient">Pending</span>
                <ArrowPathIcon className="size-4 text-primary animate-spin"/>
              </div>
            )}
            {data.isComplete && (
              <button onClick={onMintClick} className="btn btn-sm btn-primary ml-auto">
                Mint
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
