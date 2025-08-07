import { cookieStorage, createConfig, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import {
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
  sei,
} from "@reown/appkit/networks";

export const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "";

// eslint-disable-next-line
const evmNetworks: [any, ...any[]] = [
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
  sei,
];

// eslint-disable-next-line
export const networks: [any, ...any[]] = [...evmNetworks, solana];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks: evmNetworks,
  customRpcUrls: {
    [`eip155:${arbitrum.id}`]: [
      {
        url: "https://arbitrum.drpc.org",
      },
    ],
  },
});

export const solanaAdapter = new SolanaAdapter();

export const config = wagmiAdapter.wagmiConfig;

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof createConfig>;
  }
}
