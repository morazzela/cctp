import { Address, Hex } from "viem";

export interface Chain {
  isEVM: boolean;

  id: number;
  domain: number;
  name: string;
  usdc: Address;
  tokenMessengerV1?: Address;
  messageTransmitterV1?: Address;
  tokenMinterV1?: Address;
  tokenMessengerV2?: Address;
  messageTransmitterV2?: Address;
  tokenMinterV2?: Address;
  icon: string;
  standardETA: number;
  fastETA?: number;
  getTxUri(hash: string): string;

  hasV1: boolean;
  hasV2: boolean;
}

export interface BurnTx {
  srcDomain: number;
  hash: Hex;
  time: number;
  fromAddress: Address;
}
