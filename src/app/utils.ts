import { Chain } from "./types";
import { CHAINS } from "./constants";
import { AppKitNetwork } from "@reown/appkit/networks";
import { Address, getAddress, isAddress, toHex } from "viem";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@solana/web3.js";

export function findChainByDomainId(domain: number): Chain {
  const res = CHAINS.find((c) => c.domain === domain);

  if (res === undefined) {
    throw new Error("Could not find chain by domain id: " + domain);
  }

  return res;
}

export function findChainById(id: number | string): Chain {
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

type CreateChainFromNetworkProps = {
  domain: number;
  usdc: string;
  tokenMessengerV1?: string;
  messageTransmitterV1?: string;
  tokenMinterV1?: string;
  tokenMessengerV2?: string;
  messageTransmitterV2?: string;
  tokenMinterV2?: string;
  standardETA: number;
  fastETA?: number;
  icon: string;
  hasV1: boolean;
  hasV2: boolean;
};

export function createChainFromNetwork(
  network: AppKitNetwork,
  props: CreateChainFromNetworkProps,
): Chain {
  const namespace = "chainNamespace" in network && network.chainNamespace ? network.chainNamespace : "eip155"
  
  return {
    network,
    namespace,
    isEVM: namespace === "eip155",
    isSolana: namespace === "solana",
    id: network.id,
    name: network.name,
    getTxUri: (hash) => `${network.blockExplorers?.default.url}/tx/${hash}`,
    ...props,
  };
}

export function solanaAddressToHex(address: string): Address {
  return toHex(bs58.decode(address));
}

export function getChecksumedAddress(address: string | undefined, chain: Chain): null | string {
  if (address === undefined) {
    return null
  }

  if (chain.isEVM) {
    if (!isAddress(address)) {
      return null
    }

    return getAddress(address)
  }

  if (chain.isSolana) {
    try {
      const pk = new PublicKey(address)

      if ( ! PublicKey.isOnCurve(pk)) {
        return null
      }

      return pk.toString()
    } catch (err) {
      console.error(err)
      return null
    }
  }

  return null
}