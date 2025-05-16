"use client";

import Content from "./components/Content";
import History from "./components/History";
import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import { BurnTx } from "./types";
import { LOCAL_STORAGE_TRANSACTIONS_KEY } from "./constants";
import { useAccount } from "wagmi";
import ChainIcon from "./components/ChainIcon";
import { useAccountModal } from "@rainbow-me/rainbowkit";

function App() {
  const [txs] = useLocalStorage<BurnTx[]>(LOCAL_STORAGE_TRANSACTIONS_KEY, []);
  const isClient = useIsClient();
  const { address, chainId } = useAccount();
  const { openAccountModal } = useAccountModal();

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
        <div className="relative w-full flex justify-center">
          <Content />
          <div className="absolute h-48 min-w-5xl left-1/2 -translate-x-1/2 w-screen top-1/4 -z-1 bg-linear-to-r from-primary-light via-lighter to-secondary"></div>
        </div>
        {txs.length > 0 && (
          <div className="hidden lg:flex mt-32 w-full">
            <History transactions={txs} />
          </div>
        )}
      </div>
      <div className="bg-white h-96 rounded-t-2xl"></div>
    </div>
  );
}

export default App;
