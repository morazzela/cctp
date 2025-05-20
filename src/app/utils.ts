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

export function findChainById(id: number): Chain {
  const res = CHAINS.find((c) => c.id === id);

  if (res === undefined) {
    throw new Error("Could not find chain by id: " + id);
  }

  return res;
}

export function shouldUseV1(srcChain: Chain, dstChain: Chain): boolean {
  return srcChain.hasV2 !== dstChain.hasV2 || !srcChain.hasV2;
}

export function formatNumber(val: number | bigint) {
  return new Intl.NumberFormat("en-US").format(val);
}

type CreateChainFromViemChainProps = {
  domain: number;
  usdc: Address;
  tokenMessengerV1?: Address;
  messageTransmitterV1?: Address;
  tokenMinterV1?: Address;
  tokenMessengerV2?: Address;
  messageTransmitterV2?: Address;
  tokenMinterV2?: Address;
  standardETA: number;
  fastETA?: number;
  icon: string;
  hasV1: boolean;
  hasV2: boolean;
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
