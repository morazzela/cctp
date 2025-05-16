import { Address } from "viem";
import { arbitrum, avalanche, base, linea, mainnet, sonic } from "viem/chains";
import sonicLogo from "@/images/sonic.svg";

export const LOCAL_STORAGE_TRANSACTIONS_KEY = "transactions";
export const USDC_ICON =
  "https://raw.githubusercontent.com/Shadow-Exchange/shadow-assets/main/blockchains/sonic/assets/0x29219dd400f2Bf60E5a23d13Be72B486D4038894/logo.png";

type ChainsConfigType = {
  domain: number;
  tokenMessenger: Address;
  messageTransmitter: Address;
  tokenMinter: Address;
  usdc: Address;
  iconUri?: string;
  eta: number;
  fastEta: number;
  fastAvailable: boolean;
};

export const CHAINS_CONFIG: { [key: number]: ChainsConfigType } = {
  [mainnet.id]: {
    domain: 0,
    tokenMessenger: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitter: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinter: "0xfd78EE919681417d192449715b2594ab58f5D002",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    iconUri:
      "https://tokens.debridge.finance/Logo/1/0x0000000000000000000000000000000000000000/small/token-logo.svg",
    fastAvailable: true,
    eta: 20 * 60,
    fastEta: 20,
  },
  [sonic.id]: {
    domain: 13,
    tokenMessenger: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitter: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinter: "0xfd78EE919681417d192449715b2594ab58f5D002",
    usdc: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    iconUri: sonicLogo,
    fastAvailable: false,
    eta: 8,
    fastEta: 8,
  },
  [avalanche.id]: {
    domain: 1,
    tokenMessenger: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitter: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinter: "0xfd78EE919681417d192449715b2594ab58f5D002",
    usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    iconUri:
      "https://tokens.debridge.finance/Logo/43114/0x0000000000000000000000000000000000000000/small/token-logo.svg",
    fastAvailable: false,
    eta: 8,
    fastEta: 8,
  },
  [base.id]: {
    domain: 6,
    tokenMessenger: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitter: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinter: "0xfd78EE919681417d192449715b2594ab58f5D002",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    iconUri:
      "https://tokens.debridge.finance/Logo/8453/0x0000000000000000000000000000000000000000/small/token-logo.svg",
    fastAvailable: true,
    eta: 20 * 60,
    fastEta: 8,
  },
  [linea.id]: {
    domain: 11,
    tokenMessenger: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitter: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinter: "0xfd78EE919681417d192449715b2594ab58f5D002",
    usdc: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
    iconUri:
      "https://tokens.debridge.finance/Logo/59144/0x0000000000000000000000000000000000000000/small/token-logo.svg",
    fastAvailable: true,
    eta: 24 * 60 * 60,
    fastEta: 8,
  },
  [arbitrum.id]: {
    domain: 3,
    tokenMessenger: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitter: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinter: "0xfd78EE919681417d192449715b2594ab58f5D002",
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    iconUri:
      "https://tokens.debridge.finance/Logo/42161/0x0000000000000000000000000000000000000000/small/token-logo.svg",
    fastAvailable: true,
    eta: 20 * 60,
    fastEta: 8,
  },
};
