"use client";

import BurnCard from "./components/BurnCard";
import History from "./components/History";
import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import { BurnTx } from "./types";
import {
  CHAINS,
  ETHEREUM,
  LOCAL_STORAGE_TRANSACTIONS_KEY,
  SOLANA,
} from "./constants";
import ChainIcon from "./components/ui/ChainIcon";
import Link from "next/link";
import ShadowLogo from "./components/ui/ShadowLogo";
import { useEffect, useMemo, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/16/solid";
import ShadowBackground from "./components/ui/ShadowBackground";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitTheme,
} from "@reown/appkit/react";

function App() {
  const [txs] = useLocalStorage<BurnTx[]>(LOCAL_STORAGE_TRANSACTIONS_KEY, []);
  const isClient = useIsClient();

  const { chainId } = useAppKitNetwork();
  const { address: evmAddress } = useAppKitAccount({ namespace: "eip155" });
  const { address: solanaAddress } = useAppKitAccount({ namespace: "solana" });
  const [dark, setDark] = useLocalStorage("dark-mode", false);
  const appKit = useAppKit();
  const { setThemeMode } = useAppKitTheme();
  const [selectedTx, setSelectedTx] = useState<BurnTx>();

  const validTxs = useMemo(() => {
    if (!evmAddress && !solanaAddress) {
      return [];
    }

    return txs.filter(
      (tx) =>
        tx.fromAddress.toLowerCase() === evmAddress?.toLowerCase() ||
        tx.fromAddress.toLowerCase() === solanaAddress?.toLowerCase(),
    );
  }, [txs, evmAddress, solanaAddress]);

  useEffect(() => {
    setThemeMode(dark ? "dark" : "light");

    if (dark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [dark, setThemeMode]);

  const currentChain = useMemo(
    () => CHAINS.find((c) => c.network.id === chainId),
    [chainId],
  );

  if (!isClient) {
    return;
  }

  return (
    <div className="container mx-auto min-h-dvh flex flex-col justify-center px-4">
      <ShadowBackground className="-z-10 hidden dark:md:block absolute top-0 left-1/2 -translate-x-1/2 translate-y-24" />
      <div className="flex justify-end mt-6 gap-x-2">
        {evmAddress && (
          <button
            onClick={() =>
              appKit.open({ view: "Account", namespace: "eip155" })
            }
            className="btn btn-primary flex items-center gap-x-2"
          >
            <ChainIcon
              chain={currentChain?.isEVM ? currentChain : ETHEREUM}
              className="size-4"
            />
            <span>
              {`${evmAddress.substring(0, 6) + ".." + evmAddress.substring(37)}`.toLowerCase()}
            </span>
          </button>
        )}
        {solanaAddress && (
          <button
            onClick={() =>
              appKit.open({ view: "Account", namespace: "solana" })
            }
            className="btn btn-primary flex items-center gap-x-2"
          >
            <ChainIcon chain={SOLANA} className="size-4" />
            <span>
              {`${solanaAddress.substring(0, 6) + ".." + solanaAddress.substring(37)}`.toLowerCase()}
            </span>
          </button>
        )}
        <button
          onClick={() => setDark((val) => !val)}
          className="btn btn-primary"
        >
          {dark && <SunIcon className="size-4" />}
          {!dark && <MoonIcon className="size-4" />}
        </button>
      </div>
      <div className="py-12 xl:py-24 flex flex-col items-center">
        <div className="relative w-full flex flex-col items-center mb-32">
          <div className="mb-4 flex items-center gap-x-2 text-sm">
            <span>A Public Good by</span>
            <Link
              href="https://shadow.so/"
              target="_blank"
              className="flex items-center"
            >
              <ShadowLogo className="size-4" />
              <span className="ml-1 font-medium text-md dark:text-dark-primary">
                SHADOW
              </span>
            </Link>
          </div>
          <div className="w-full flex justify-center relative">
            <div className="dark:hidden">
              <img
                alt="BG Square"
                src="/images/bg_square.svg"
                className="w-full absolute -z-10 top-1/2 -translate-y-1/2"
              />
              <img
                alt="BG Arrows"
                src="/images/bg_arrow.svg"
                className="w-full absolute -z-10 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
              />
            </div>
            <BurnCard selectedTx={selectedTx} setSelectedTx={setSelectedTx} />
          </div>
        </div>
        {validTxs.length > 0 && (
          <div className="flex w-full">
            <History
              setSelectedTx={setSelectedTx}
              selectedTx={selectedTx}
              transactions={validTxs}
            />
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-darker h-96 rounded-t-2xl p-6 flex items-start justify-between">
        <div className="-ml-6">
          <img
            src="/light.svg"
            alt="CCTP.to"
            className="h-24 w-auto dark:hidden"
          />
          <img
            src="/dark.svg"
            alt="CCTP.to"
            className="h-24 w-auto hidden dark:block"
          />
        </div>
        <div className="flex flex-col items-end justify-center h-24">
          <Link
            href="https://x.com/cctpto"
            target="_blank"
            className="flex items-center gap-x-2 text-gray-600 dark:text-orange-500 hover:text-blue-500 dark:hover:text-white transition-colors duration-200"
          >
            <span className="text-3xl font-bold">𝕏</span>
            <span className="text-sm font-medium">@cctpto</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
