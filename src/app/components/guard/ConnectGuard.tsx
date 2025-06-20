import { Chain } from "@/app/types";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Connector, useAccount, useConnectors, useSwitchChain } from "wagmi";
import { useAppKit } from "@reown/appkit/react";

type Props = {
  chain: Chain;
  children: ReactNode;
  skip?: boolean;
};

export default function ConnectGuard({ chain, children, skip }: Props) {
  const [open, setOpen] = useState(false);
  const { switchChainAsync } = useSwitchChain();
  const { isConnected, chainId: requiredChainId } = useAccount();
  const appKit = useAppKit();

  const onButtonClick = useCallback(async () => {
    if (isConnected) {
      await switchChainAsync({ chainId: chain.id });
      setOpen(false);
    } else {
      appKit.open();
    }
  }, [appKit, chain.id, isConnected, switchChainAsync]);

  if (skip === true || (isConnected && chain.id === requiredChainId)) {
    return children;
  }

  return (
    <div>
      <button className="btn btn-xl btn-primary w-full" onClick={onButtonClick}>
        {isConnected ? `Connect to ${chain.name}` : "Connect wallet"}
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
              key={connector.id}
              onClick={() => onConnectorClick(connector)}
              className="card hover:bg-darker px-4 py-3 flex items-center gap-x-2"
            >
              {connector.icon && (
                <img
                  alt={connector.name}
                  src={connector.icon}
                  className="size-6"
                />
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
