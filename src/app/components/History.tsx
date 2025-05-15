import { useLocalStorage } from "@uidotdev/usehooks";
import { BurnTx } from "../types";
import { useBurnTxDetails } from "../hooks/useBurnTxDetails";
import moment from "moment";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { CHAINS_CONFIG } from "../constants";
import { getChainIdFromDomainId } from "../utils";
import { MESSAGE_TRANSMITTER_ABI } from "../abis/MessageTransmitter";
import { formatUnits } from "viem";
import { ArrowLongRightIcon } from "@heroicons/react/16/solid";

export default function History() {
  const [burnTxs] = useLocalStorage<BurnTx[]>("transactions", []);

  return (
    <div className="card w-full card-transparent divide-y divide-dark">
      {burnTxs.map((tx) => (
        <Row key={tx.hash + "-" + tx.srcDomain} tx={tx} />
      ))}
    </div>
  );
}

function Row({ tx }: { tx: BurnTx }) {
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const { data, isLoading } = useBurnTxDetails(tx);
  const { chainId } = useAccount();

  const onMintClick = async () => {
    if (!data || !data.dstChain) {
      return;
    }

    if (chainId !== data.dstChain.id) {
      await switchChainAsync({ chainId: data.dstChain.id });
    }

    const res = await writeContractAsync({
      address: CHAINS_CONFIG[data.dstChain.id].messageTransmitter,
      abi: MESSAGE_TRANSMITTER_ABI,
      functionName: "receiveMessage",
      args: [data.message, data.attestation],
      chainId: data.dstChain.id,
    });
  };

  return (
    <div className="relative h-16 flex items-center px-3">
      <div></div>
      {data !== undefined && (
        <>
          <div className="w-1/5 pl-3">
            {moment.utc(Number(data.time) * 1000).format("DD/MM/YYYY HH:mm")}
          </div>
          <div className="w-1/5">{data.srcChain.name}</div>
          <div className="w-1/5">{data.dstChain?.name}</div>
          <div className="w-1/5 flex items-center gap-x-1.5">
            <span>{formatUnits(data.amount, 6)}</span>
            <img
              className="size-4"
              src="https://raw.githubusercontent.com/Shadow-Exchange/shadow-assets/main/blockchains/sonic/assets/0x29219dd400f2Bf60E5a23d13Be72B486D4038894/logo.png"
            />
          </div>
          <div className="w-1/5"></div>
          <div className="w-1/5 text-right">
            {data.isComplete && (
              <button onClick={onMintClick} className="btn btn-primary">
                Mint
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
