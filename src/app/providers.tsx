"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";

import { config } from "../wagmi";
import { darkTheme, RainbowKitProvider, Theme } from "@rainbow-me/rainbowkit";

const queryClient = new QueryClient();

export default function Providers(props: { children: ReactNode }) {
  const defaultTheme = darkTheme();
  const rainbowTheme: Theme = {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      accentColor: "rgb(var(--color-primary))",
      modalBackground: "rgb(var(--color-dark))",
    },
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowTheme}>
          {props.children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
