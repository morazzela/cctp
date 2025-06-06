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
} from "viem/chains";
import { createChainFromViemChain } from "./utils";

export const LOCAL_STORAGE_TRANSACTIONS_KEY = "transactions_v2";
export const USDC_ICON =
  "https://raw.githubusercontent.com/Shadow-Exchange/shadow-assets/main/blockchains/sonic/assets/0x29219dd400f2Bf60E5a23d13Be72B486D4038894/logo.png";

export const DEPOSIT_FOR_BURN_TOPIC_V1 =
  "0x2fa9ca894982930190727e75500a97d8dc500233a5065e0f3126c48fbe0343c0";
export const DEPOSIT_FOR_BURN_TOPIC_V2 =
  "0x0c8c1cbdc5190613ebd485511d4e2812cfa45eecb79d845893331fedad5130a5";
export const MESSAGE_SENT_TOPIC_V1 =
  "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036";
export const MESSAGE_SENT_TOPIC_V2 =
  "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036";

export const ETHEREUM = createChainFromViemChain(mainnet, {
  domain: 0,
  icon: "/images/chains/ethereum.svg",
  standardETA: 20 * 60,
  fastETA: 20,
  tokenMessengerV1: "0xBd3fa81B58Ba92a82136038B25aDec7066af3155",
  messageTransmitterV1: "0x0a992d191DEeC32aFe36203Ad87D7d289a738F81",
  tokenMinterV1: "0xc4922d64a24675E16e1586e3e3Aa56C06fABe907",
  tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  hasV1: true,
  hasV2: true,
});

export const AVALANCHE = createChainFromViemChain(avalanche, {
  domain: 1,
  icon: "/images/chains/avalanche.svg",
  standardETA: 8,
  tokenMessengerV1: "0x6B25532e1060CE10cc3B0A99e5683b91BFDe6982",
  messageTransmitterV1: "0x8186359aF5F57FbB40c6b14A588d2A59C0C29880",
  tokenMinterV1: "0x420F5035fd5dC62a167E7e7f08B604335aE272b8",
  tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  hasV1: true,
  hasV2: true,
});

export const LINEA = createChainFromViemChain(linea, {
  domain: 11,
  icon: "/images/chains/linea.svg",
  standardETA: 60 * 60 * 32,
  fastETA: 8,
  tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdc: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
  hasV1: false,
  hasV2: true,
});

export const BASE = createChainFromViemChain(base, {
  domain: 6,
  icon: "/images/chains/base.svg",
  standardETA: 20 * 60,
  fastETA: 8,
  tokenMessengerV1: "0x1682Ae6375C4E4A97e4B583BC394c861A46D8962",
  messageTransmitterV1: "0xAD09780d193884d503182aD4588450C416D6F9D4",
  tokenMinterV1: "0xe45B133ddc64bE80252b0e9c75A8E74EF280eEd6",
  tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  hasV1: true,
  hasV2: true,
});

export const ARBITRUM = createChainFromViemChain(arbitrum, {
  domain: 3,
  icon: "/images/chains/arbitrum.svg",
  standardETA: 20 * 60,
  fastETA: 8,
  tokenMessengerV1: "0x19330d10D9Cc8751218eaf51E8885D058642E08A",
  messageTransmitterV1: "0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca",
  tokenMinterV1: "0xE7Ed1fa7f45D05C508232aa32649D89b73b8bA48",
  tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  hasV1: true,
  hasV2: true,
});

export const SONIC = createChainFromViemChain(sonic, {
  domain: 13,
  icon: "/images/chains/sonic.svg",
  standardETA: 8,
  tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdc: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
  hasV1: false,
  hasV2: true,
});

export const OPTIMISM = createChainFromViemChain(optimism, {
  domain: 2,
  icon: "/images/chains/optimism.svg",
  standardETA: 60 * 20,
  tokenMessengerV1: "0x2B4069517957735bE00ceE0fadAE88a26365528f",
  messageTransmitterV1: "0x4D41f22c5a0e5c74090899E5a8Fb597a8842b3e8",
  tokenMinterV1: "0x33E76C5C31cb928dc6FE6487AB3b2C0769B1A1e3",
  usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  hasV1: true,
  hasV2: false,
});

export const POLYGON = createChainFromViemChain(polygon, {
  domain: 7,
  icon: "/images/chains/polygon.svg",
  standardETA: 60 * 8,
  tokenMessengerV1: "0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE",
  messageTransmitterV1: "0xF3be9355363857F3e001be68856A2f96b4C39Ba9",
  tokenMinterV1: "0x10f7835F827D6Cf035115E10c50A853d7FB2D2EC",
  usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  hasV1: true,
  hasV2: false,
});

export const UNICHAIN = createChainFromViemChain(unichain, {
  domain: 10,
  icon: "/images/chains/unichain.svg",
  standardETA: 60 * 20,
  tokenMessengerV1: "0x4e744b28E787c3aD0e810eD65A24461D4ac5a762",
  messageTransmitterV1: "0x353bE9E2E38AB1D19104534e4edC21c643Df86f4",
  tokenMinterV1: "0x726bFEF3cBb3f8AF7d8CB141E78F86Ae43C34163",
  usdc: "0x078D782b760474a361dDA0AF3839290b0EF57AD6",
  hasV1: true,
  hasV2: false,
});

export const WORLDCHAIN = createChainFromViemChain(worldchain, {
  domain: 14,
  icon: "/images/chains/worldchain.svg",
  standardETA: 60 * 20,
  fastETA: 8,
  tokenMessengerV2: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
  messageTransmitterV2: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
  tokenMinterV2: "0xfd78EE919681417d192449715b2594ab58f5D002",
  usdc: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
  hasV1: false,
  hasV2: true,
});

export const CHAINS = [
  ETHEREUM,
  AVALANCHE,
  SONIC,
  LINEA,
  ARBITRUM,
  BASE,
  OPTIMISM,
  POLYGON,
  UNICHAIN,
  WORLDCHAIN,
];
