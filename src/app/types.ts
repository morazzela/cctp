import { Address, Hex } from "viem";

export interface Chain {
  isEVM: boolean;

  id: number;
  domain: number;
  name: string;
  usdcAddress: Address;
  tokenMessengerAddress: Address;
  messageTransmitterAddress: Address;
  tokenMinterAddress: Address;
  icon: string;
  standardETA: number;
  fastETA?: number;
  getTxUri(hash: string): string;
}

export interface BurnTx {
  srcDomain: number;
  hash: Hex;
  time: number;
  fromAddress: Address;
}
