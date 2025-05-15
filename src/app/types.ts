import { Address, Hex } from "viem";

export interface Chain {
  id: number;
  domain: number;
  name: string;
  usdcAddress: Address;
  tokenMessengerAddress: Address;
  messageTransmitterAddress: Address;
  tokenMinterAddress: Address;
}

export interface BurnTx {
  srcDomain: number;
  hash: Hex;
}
