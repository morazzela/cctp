import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { http, createConfig, createStorage } from "wagmi";
import { arbitrum, avalanche, base, linea, mainnet, optimism, polygon, sonic, unichain } from "wagmi/chains";

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
  chains: [mainnet, sonic, avalanche, linea, base, arbitrum, optimism, polygon, unichain],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sonic.id]: http(),
    [avalanche.id]: http(),
    [linea.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [unichain.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof createConfig>;
  }
}
