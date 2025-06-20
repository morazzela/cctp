import { Chain } from "@/app/types";
import { ReactNode, useCallback, useMemo } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
} from "@reown/appkit/react";

type Props = {
  chain: Chain;
  children?: ReactNode;
  skip?: boolean;
  className?: string
  mustBeActive?: boolean
};

export default function ConnectGuard({ chain, children, skip, className, mustBeActive }: Props) {
  const appKit = useAppKit();
  const { isConnected } = useAppKitAccount({ namespace: chain.namespace });
  const network = useAppKitNetwork();

  const isActive = useMemo(() => network.chainId === chain.id, [network, chain])

  const onButtonClick = useCallback(async () => {
    if (isConnected) {
      network.switchNetwork(chain.network);
    } else {
      appKit.open({
        view: "Connect",
        namespace: chain.namespace,
      });
    }
  }, [appKit, isConnected, chain, network]);

  if (skip === true || (isConnected && (isActive || mustBeActive !== true))) {
    return children;
  }

  return (
    <button className={`btn btn-xl btn-primary w-full ${className}`} onClick={onButtonClick}>
      {`Connect to ${chain.name}`}
    </button>
  );
}
