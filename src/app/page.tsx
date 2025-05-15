"use client";

import Link from "next/link";
import BurnCard from "./components/BurnCard";
import History from "./components/History";
import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import { BurnTx } from "./types";

function App() {
  const [txs] = useLocalStorage<BurnTx[]>("transactions", []);
  const isClient = useIsClient();

  if (!isClient) {
    return;
  }

  return (
    <div className="container mx-auto min-h-dvh flex flex-col justify-center py-12 xl:py-32 px-4">
      <div className="flex flex-wrap items-start">
        <div className="w-full xl:w-1/2 xl:pr-12 xl:pt-12">
          <h1 className="font-bold text-4xl xl:text-7xl">
            Bridge USDC across all eligible chains, without fees.
          </h1>
          <h2 className="text-dark mt-2 xl:mt-4 text-xl xl:text-2xl">
            Bridge your USDC using Circle's CCTP bridge directly without any
            fees.
          </h2>
          <Link
            href="https://www.circle.com/fr/cross-chain-transfer-protocol"
            target="_blank"
            className="btn btn-primary mt-8"
          >
            Learn More
          </Link>
        </div>
        <div className="w-full xl:w-1/2 max-xl:mt-12">
          <BurnCard />
        </div>
      </div>
      {txs.length > 0 && (
        <div className="flex mt-32">
          <History transactions={txs} />
        </div>
      )}
    </div>
  );
}

export default App;
