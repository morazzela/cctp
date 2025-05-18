import { CHAINS_CONFIG } from "./constants";

export function getChainIdFromDomainId(domainId: number) {
  for (const chainId in CHAINS_CONFIG) {
    if (CHAINS_CONFIG[chainId].domain === domainId) {
      return Number(chainId);
    }
  }

  return 1;
}

export function formatNumber(val: number | bigint) {
  return new Intl.NumberFormat("en-US").format(val);
}
