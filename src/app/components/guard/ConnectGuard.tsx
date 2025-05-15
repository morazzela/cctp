import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";
import { Chain } from "viem";
import { Connector, useAccount, useConnectors, useSwitchChain } from "wagmi";

type Props = {
  chain: Chain;
  children: ReactNode;
};

export default function ConnectGuard({ chain, children }: Props) {
  const [open, setOpen] = useState(false);
  const { switchChainAsync } = useSwitchChain();
  const { isConnected, chainId: requiredChainId } = useAccount();

  const onClick = () => {
    if (isConnected) {
      switchChainAsync({ chainId: chain.id as any });
      return;
    }

    setOpen(true);
  };

  if (isConnected && chain.id === requiredChainId) {
    return children;
  }

  return (
    <div>
      <button onClick={onClick} className="btn btn-xl btn-primary w-full">
        {isConnected && chain.id !== requiredChainId
          ? `Connect to ${chain.name}`
          : "Connect wallet"}
      </button>
      <Modal chainId={chain.id} open={open} setOpen={setOpen} />
    </div>
  );
}

type ModalProps = {
  chainId: number;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

function Modal({ chainId, open, setOpen }: ModalProps) {
  const connectors = useConnectors();

  const onConnectorClick = async (con: Connector) => {
    await con.connect({ chainId });
    setOpen(false);
  };

  if (!open) {
    return;
  }

  return createPortal(
    <div
      className="fixed inset-0 backdrop-blur-md flex items-center justify-center"
      onClick={() => setOpen(false)}
    >
      <div
        className="card card-dark card-body w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-4xl">Connect Wallet</h2>
        <div className="flex flex-col gap-y-2 mt-6">
          {connectors.map((connector) => (
            <button
              onClick={() => onConnectorClick(connector)}
              className="card hover:bg-darker px-3 py-2 flex items-center gap-x-2"
            >
              {connector.icon && (
                <img src={connector.icon} className="size-6" />
              )}
              <span>{connector.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
