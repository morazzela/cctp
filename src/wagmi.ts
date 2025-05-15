import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import {
  arbitrum,
  avalanche,
  base,
  linea,
  mainnet,
  sepolia,
  sonic,
} from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

export function getConfig() {
  return createConfig({
    chains: [mainnet, sonic, avalanche, linea, base, arbitrum],
    connectors: [
      injected(),
      coinbaseWallet(),
      walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "" }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [mainnet.id]: http(),
      [sonic.id]: http(),
      [avalanche.id]: http(),
      [linea.id]: http(),
      [base.id]: http(),
      [arbitrum.id]: http(),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
