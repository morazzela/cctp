"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider } from "wagmi";
import {
  config,
  networks,
  projectId,
  solanaAdapter,
  wagmiAdapter,
} from "../wagmi";
import { createAppKit } from "@reown/appkit/react";

const queryClient = new QueryClient();

const metadata = {
  name: "CCTP V2 Bridge",
  description: "Move your USDC instantly with zero added fees.",
  url: "https://cctp.to/", // origin must match your domain & subdomain
  icons: ["https://cctp.to/images/icon.ico"],
};

createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  projectId,
  networks: networks,
  defaultNetwork: networks[0],
  metadata,
  features: {
    socials: false,
    email: false,
    swaps: false,
    onramp: false,
  },
});

export default function Providers(props: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(config, props.cookies);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
