import { cookieStorage, createConfig, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
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
  worldchain,
} from "@reown/appkit/networks";

export const networks = [
  mainnet,
  sonic,
  avalanche,
  linea,
  base,
  arbitrum,
  optimism,
  polygon,
  unichain,
  worldchain,
];

export const projectId = "60dfde649ba314d4c8d1d5e7b83a8200";

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof createConfig>;
  }
}
