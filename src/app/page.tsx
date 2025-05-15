"use client";

import Link from "next/link";
import BurnCard from "./components/BurnCard";
import History from "./components/History";
import { useIsClient } from "@uidotdev/usehooks";

function App() {
  const isClient = useIsClient();

  if (!isClient) {
    return;
  }

  return (
    <div className="container mx-auto py-32">
      <div className="flex items-center">
        <div className="w-1/2">
          <h1 className="font-bold text-5xl">
            Bridge USDC across all eligble chains, without fees.
          </h1>
          <h2 className="text-dark mt-4">
            Bridge your USDC using Circle's CCTP bridge directly without any
            fees.
          </h2>
          <Link href="#" className="btn btn-primary mt-8">
            Learn More
          </Link>
        </div>
        <div className="w-1/2">
          <BurnCard />
        </div>
      </div>
      <div className="flex mt-32">
        <History />
      </div>
    </div>
  );
}

export default App;
