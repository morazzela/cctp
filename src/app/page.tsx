"use client";

import BurnCard from "./components/BurnCard";
import History from "./components/History";
import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import { BurnTx } from "./types";
import { LOCAL_STORAGE_TRANSACTIONS_KEY } from "./constants";
import { useAccount } from "wagmi";
import ChainIcon from "./components/ui/ChainIcon";
import { useAccountModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import ShadowLogo from "./components/ui/ShadowLogo";
import { useEffect, useMemo } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/16/solid";
import ShadowBackground from "./components/ui/ShadowBackground";
import SonicLogo from "./components/ui/SonicLogo";

function App() {
  const [txs] = useLocalStorage<BurnTx[]>(LOCAL_STORAGE_TRANSACTIONS_KEY, []);
  const isClient = useIsClient();
  const { address, chainId } = useAccount();
  const { openAccountModal } = useAccountModal();
  const [dark, setDark] = useLocalStorage("dark-mode", false);

  const validTxs = useMemo(() => {
    if (!address) {
      return [];
    }

    return txs.filter((tx) => tx.fromAddress === address);
  }, [txs, address]);

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [dark]);

  if (!isClient) {
    return;
  }

  return (
    <div className="container mx-auto min-h-dvh flex flex-col justify-center px-4">
      <ShadowBackground className="-z-10 hidden dark:md:block absolute top-0 left-1/2 -translate-x-1/2 translate-y-24" />
      <div className="flex justify-end mt-6 gap-x-2">
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
          <BurnCard />
          <div className="dark:hidden absolute h-40 left-1/2 -translate-x-1/2 top-56 -translate-y-1/2 w-screen -z-1 bg-linear-[90deg,var(--color-primary-light)_0%,var(--color-lighter)_35%,var(--color-lighter)_65%,var(--color-secondary)_90%] dark:bg-linear-[90deg,var(--color-primary-light)_0%,var(--color-dark)_35%,var(--color-dark)_65%,var(--color-secondary)_90%]"></div>
          <div className="dark:hidden absolute h-40 left-1/2 -translate-x-1/2 top-56 w-screen -z-1 border-y-2 border-primary-light"></div>
        </div>
        {validTxs.length > 0 && (
          <div className="hidden lg:flex w-full">
            <History transactions={validTxs} />
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-darker h-96 rounded-t-2xl p-6 flex items-start justify-between">
        <div>
          <Link
            href="https://shadow.so/"
            target="_blank"
            className="flex items-center gap-x-2"
          >
            <ShadowLogo className="size-6" />
            <span className="text-2xl">SHADOW</span>
          </Link>
          <div className="text-base mt-2 text-dark">
            Sonic-native concentrated liquidity layer
          </div>
        </div>
        <SonicLogo className="h-8 w-auto" />
      </div>
    </div>
  );
}

export default App;
