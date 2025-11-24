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
  plumeMainnet,
  ink,
  monad,
} from "@reown/appkit/networks";
import { hyperevm, xdc } from "./app/chains";

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
  hyperevm,
  xdc,
  plumeMainnet,
  ink,
  monad,
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
    [`eip155:${sei.id}`]: [
      {
        url: "https://sei.drpc.org",
      },
    ],
    [`eip155:${base.id}`]: [
      {
        url: "https://base.drpc.org",
      },
    ],
    [`eip155:${mainnet.id}`]: [
      {
        url: "https://eth.drpc.org",
      },
    ],
    [`eip155:${avalanche.id}`]: [
      {
        url: "https://avalanche.drpc.org",
      },
    ],
    [`eip155:${linea.id}`]: [
      {
        url: "https://linea.drpc.org",
      },
    ],
    [`eip155:${optimism.id}`]: [
      {
        url: "https://optimism.drpc.org",
      },
    ],
    [`eip155:${sonic.id}`]: [
      {
        url: "https://sonic.drpc.org",
      },
    ],
    [`eip155:${unichain.id}`]: [
      {
        url: "https://unichain.drpc.org",
      },
    ],
    [`eip155:${polygon.id}`]: [
      {
        url: "https://polygon.drpc.org",
      },
    ],
    [`eip155:${hyperevm.id}`]: [
      {
        url: "https://hyperliquid.drpc.org",
      },
    ],
    [`eip155:${xdc.id}`]: [
      {
        url: "https://rpc.xdcrpc.com",
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
