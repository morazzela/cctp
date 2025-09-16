import { defineChain } from "@reown/appkit/networks";

export const hyperevm = defineChain({
  id: 999,
  caipNetworkId: "eip155:999",
  chainNamespace: "eip155",
  name: "HyperEVM",
  nativeCurrency: {
    name: "HYPE",
    symbol: "HYPE",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hyperliquid.xyz/evm"],
    },
  },
});
