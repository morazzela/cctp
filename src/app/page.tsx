"use client";

import Content from "./components/Content";
import History from "./components/History";
import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import { BurnTx } from "./types";
import { LOCAL_STORAGE_TRANSACTIONS_KEY } from "./constants";
import { useAccount } from "wagmi";
import ChainIcon from "./components/ChainIcon";
import { useAccountModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import ShadowLogo from "./components/ui/ShadowLogo";
import { useMemo } from "react";

function App() {
  const [txs] = useLocalStorage<BurnTx[]>(LOCAL_STORAGE_TRANSACTIONS_KEY, []);
  const isClient = useIsClient();
  const { address, chainId } = useAccount();
  const { openAccountModal } = useAccountModal();

  const validTxs = useMemo(() => {
    if (!address) {
      return [];
    }

    return txs.filter((tx) => tx.fromAddress === address);
  }, [txs, address]);

  if (!isClient) {
    return;
  }

  return (
    <div className="container mx-auto min-h-dvh flex flex-col justify-center px-4">
      <div className="flex justify-end mt-6">
        {address && (
          <button
            onClick={openAccountModal}
            className="btn btn-primary flex items-center gap-x-2"
          >
            <ChainIcon chainId={chainId ?? 1} className="size-4" />
            <span>
              {`${address.substring(0, 6) + ".." + address.substring(37)}`.toLowerCase()}
            </span>
          </button>
        )}
      </div>
      <div className="py-12 xl:py-24 flex flex-col items-center">
        <div className="relative w-full flex flex-col items-center">
          <div className="mb-4 flex items-center gap-x-2 text-sm ">
            <span>A Public Good by</span>
            <Link
              href="https://shadow.so/"
              target="_blank"
              className="flex items-center"
            >
              <ShadowLogo className="size-4" />
              <span className="ml-2">SHADOW</span>
            </Link>
          </div>
          <Content />
          <div className="absolute h-48 min-w-5xl left-1/2 -translate-x-1/2 w-screen top-1/4 -z-1 bg-linear-to-r from-primary-light via-lighter to-secondary"></div>
        </div>
        {validTxs.length > 0 && (
          <div className="hidden lg:flex mt-32 w-full">
            <History transactions={validTxs} />
          </div>
        )}
      </div>
      <div className="bg-white h-96 rounded-t-2xl p-6">
        <div className="flex items-center gap-x-2">
          <ShadowLogo className="size-6" />
          <span className="text-2xl">SHADOW</span>
        </div>
        <div className="text-base mt-2 text-dark">
          Sonic-native concentrated liquidity layer
        </div>
      </div>
    </div>
  );
}

export default App;
