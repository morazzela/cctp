import { useMemo } from "react";
import { Chain } from "../types";
import { useEVMBurn } from "./useBurnEVM";
import { useSolanaBurn } from "./useBurnSolana";

type UseBurnProps = {
  srcChain: Chain;
  dstChain: Chain;
  amount: bigint;
  fee: bigint;
  recipient?: string;
  minFinalityThreshold: number;
};

export function useBurn(props: UseBurnProps) {
  const evmBurn = useEVMBurn(props);
  const solanaBurn = useSolanaBurn(props);

  return useMemo(() => {
    if (props.srcChain.isEVM) {
      return evmBurn;
    }

    return solanaBurn;
  }, [props, evmBurn, solanaBurn]);
}
