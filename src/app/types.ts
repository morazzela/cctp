import { AppKitNetwork } from "@reown/appkit/networks";
import { Address, Hex } from "viem";
import { ChainNamespace } from "@reown/appkit-common";

export interface Chain {
  isEVM: boolean;
  isSolana: boolean;

  network: AppKitNetwork;
  namespace: ChainNamespace | undefined;

  id: number | string;
  domain: number;
  name: string;
  usdc: string;
  tokenMessengerV1?: string;
  messageTransmitterV1?: string;
  tokenMinterV1?: string;
  tokenMessengerV2?: string;
  messageTransmitterV2?: string;
  tokenMinterV2?: string;
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
