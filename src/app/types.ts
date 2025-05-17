import { Address, Hex } from "viem";

export interface Chain {
  id: number;
  domain: number;
  name: string;
  usdcAddress: Address;
  tokenMessengerAddress: Address;
  messageTransmitterAddress: Address;
}

export interface BurnTx {
  srcDomain: number;
  hash: Hex;
  time: number;
  fromAddress: Address;
}
