import { cookieStorage, createConfig, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import {
  AppKitNetwork,
  arbitrum,
  avalanche,
  base,
  linea,
  mainnet,
  optimism,
  polygon,
  solana,
  sonic,
  unichain,
  worldchain,
} from "@reown/appkit/networks";

export const projectId = "60dfde649ba314d4c8d1d5e7b83a8200";

const evmNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  arbitrum,
  avalanche,
  base,
  linea,
  optimism,
  polygon,
  sonic,
  unichain,
  worldchain,
];

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  ...evmNetworks,
  solana,
];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks: evmNetworks,
});

export const solanaAdapter = new SolanaAdapter();

export const config = wagmiAdapter.wagmiConfig;

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof createConfig>;
  }
}
