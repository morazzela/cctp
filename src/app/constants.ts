import { arbitrum, avalanche, base, linea, mainnet, sonic } from "viem/chains";
import { createChainFromViemChain } from "./utils";

export const LOCAL_STORAGE_TRANSACTIONS_KEY = "transactions_v2";
export const USDC_ICON =
  "https://raw.githubusercontent.com/Shadow-Exchange/shadow-assets/main/blockchains/sonic/assets/0x29219dd400f2Bf60E5a23d13Be72B486D4038894/logo.png";

export const ETHEREUM = createChainFromViemChain(mainnet, {
  domain: 0,
  icon: "/images/chains/ethereum.svg",
  standardETA: 20 * 60,
  fastETA: 20,
  tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdcAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
});

export const AVALANCHE = createChainFromViemChain(avalanche, {
  domain: 1,
  icon: "/images/chains/avalanche.svg",
  standardETA: 8,
  tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdcAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
});

export const LINEA = createChainFromViemChain(linea, {
  domain: 11,
  icon: "/images/chains/linea.svg",
  standardETA: 20 * 60,
  fastETA: 20,
  tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdcAddress: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
});

export const BASE = createChainFromViemChain(base, {
  domain: 6,
  icon: "/images/chains/base.svg",
  standardETA: 20 * 60,
  fastETA: 20,
  tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
});

export const ARBITRUM = createChainFromViemChain(arbitrum, {
  domain: 3,
  icon: "/images/chains/arbitrum.svg",
  standardETA: 20 * 60,
  fastETA: 20,
  tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
});

export const SONIC = createChainFromViemChain(sonic, {
  domain: 13,
  icon: "/images/chains/sonic.svg",
  standardETA: 20 * 60,
  fastETA: 20,
  tokenMessengerAddress: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterAddress: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterAddress: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdcAddress: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
});

export const CHAINS = [ETHEREUM, AVALANCHE, SONIC, LINEA, ARBITRUM, BASE];
