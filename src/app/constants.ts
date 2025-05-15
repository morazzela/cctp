import { Address } from "viem";
import { arbitrum, avalanche, base, linea, mainnet, sonic } from "viem/chains";

type ChainsConfigType = {
  domain: number;
  tokenMessenger: Address;
  messageTransmitter: Address;
  tokenMinter: Address;
  usdc: Address;
  iconUri: string;
};

export const CHAINS_CONFIG: { [key: number]: ChainsConfigType } = {
  [mainnet.id]: {
    domain: 0,
    tokenMessenger: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitter: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinter: "0xfd78EE919681417d192449715b2594ab58f5D002",
    usdc: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    iconUri: "",
  },
  [sonic.id]: {
    domain: 13,
    tokenMessenger: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitter: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinter: "0xfd78EE919681417d192449715b2594ab58f5D002",
    usdc: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    iconUri: "",
  },
  [avalanche.id]: {
    domain: 1,
    tokenMessenger: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitter: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinter: "0xfd78EE919681417d192449715b2594ab58f5D002",
    usdc: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    iconUri: "",
  },
  [base.id]: {
    domain: 6,
    tokenMessenger: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitter: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinter: "0xfd78EE919681417d192449715b2594ab58f5D002",
    usdc: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    iconUri: "",
  },
  [linea.id]: {
    domain: 11,
    tokenMessenger: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitter: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinter: "0xfd78EE919681417d192449715b2594ab58f5D002",
    usdc: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    iconUri: "",
  },
  [arbitrum.id]: {
    domain: 3,
    tokenMessenger: "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d",
    messageTransmitter: "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    tokenMinter: "0xfd78EE919681417d192449715b2594ab58f5D002",
    usdc: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    iconUri: "",
  },
};
