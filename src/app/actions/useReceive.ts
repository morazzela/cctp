import { useMemo } from "react";
import { UseBurnTxDetailsType } from "../hooks/useBurnTxDetails";
import { useEVMReceive } from "./useReceiveEVM";
import { useSolanaReceive } from "./useReceiveSolana";

export function useReceive(data?: UseBurnTxDetailsType) {
  const evmReceive = useEVMReceive(data);
  const solanaReceive = useSolanaReceive(data);

  return useMemo(() => {
    if (data?.dstChain?.isSolana) {
      return solanaReceive;
    }

    return evmReceive;
  }, [data, evmReceive, solanaReceive]);
}
