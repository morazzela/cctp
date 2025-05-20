import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { http, createConfig, createStorage } from "wagmi";
import {
  arbitrum,
  avalanche,
  base,
  linea,
  mainnet,
  optimism,
  polygon,
  sonic,
  unichain,
} from "wagmi/chains";

import {
  binanceWallet,
  bitgetWallet,
  bybitWallet,
  coinbaseWallet,
  frameWallet,
  metaMaskWallet,
  okxWallet,
  rabbyWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        binanceWallet,
        metaMaskWallet,
        rabbyWallet,
        bybitWallet,
        coinbaseWallet,
        bitgetWallet,
        okxWallet,
        walletConnectWallet,
        safeWallet,
        frameWallet,
      ],
    },
  ],
  {
    appName: "CCTP",
    projectId:
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  },
);

export const config = createConfig({
  connectors,
  storage: createStorage({
    storage: window.localStorage,
  }),
  chains: [
    mainnet,
    sonic,
    avalanche,
    linea,
    base,
    arbitrum,
    optimism,
    polygon,
    unichain,
  ],
  ssr: true,
  transports: {
    [mainnet.id]: http("https://ethereum-rpc.publicnode.com"),
    [sonic.id]: http(),
    [avalanche.id]: http("https://avalanche-c-chain-rpc.publicnode.com"),
    [linea.id]: http("https://linea-rpc.publicnode.com"),
    [base.id]: http("https://base-rpc.publicnode.com"),
    [arbitrum.id]: http("https://arbitrum-one-rpc.publicnode.com"),
    [optimism.id]: http("https://optimism-rpc.publicnode.com"),
    [polygon.id]: http("https://polygon-bor-rpc.publicnode.com"),
    [unichain.id]: http("https://unichain-rpc.publicnode.com"),
  },
});

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof createConfig>;
  }
}
