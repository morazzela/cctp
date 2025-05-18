import { Address, Chain as ViemChain } from "viem";
import { Chain } from "./types";
import { CHAINS } from "./constants";

export function findChainByDomainId(domain: number): Chain {
  const res = CHAINS.find((c) => c.domain === domain);

  if (res === undefined) {
    throw new Error("Could not find chain by domain id: " + domain);
  }

  return res;
}

export function formatNumber(val: number | bigint) {
  return new Intl.NumberFormat("en-US").format(val);
}

type CreateChainFromViemChainProps = {
  domain: number;
  usdcAddress: Address;
  tokenMessengerAddress: Address;
  messageTransmitterAddress: Address;
  tokenMinterAddress: Address;
  standardETA: number;
  fastETA?: number;
  icon: string;
};

export function createChainFromViemChain(
  viemChain: ViemChain,
  props: CreateChainFromViemChainProps,
): Chain {
  return {
    isEVM: true,
    id: viemChain.id,
    name: viemChain.name,
    getTxUri: (hash) => `${viemChain.blockExplorers?.default.url}/tx/${hash}`,
    ...props,
  };
}
