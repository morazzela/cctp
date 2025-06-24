import { useCallback, useEffect, useMemo, useState } from "react";
import { MESSAGE_TRANSMITTER_ABI } from "../abis/MessageTransmitter";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import { UseBurnTxDetailsType } from "./useBurnTxDetails";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  useMessageTransmitterV1,
  useMessageTransmitterV2,
  useTokenMessengerMinterV1,
  useTokenMessengerMinterV2,
} from "./useSolana";
import {
  decodeEventNonceFromMessage,
  decodeEventNonceFromMessageV2,
  getReceiveV1PDAS,
  getReceiveV2PDAS,
} from "../utils";
import { BN } from "@coral-xyz/anchor";
import { SOLANA } from "../constants";
import { PublicKey } from "@solana/web3.js";

export function useNonceUsed(props?: UseBurnTxDetailsType) {
  const evm = useEvmNonceUsed(props);
  const solana = useSolanaNonceUsed(props);

  return useMemo(() => {
    return props?.dstChain?.isEVM ? evm : solana;
  }, [evm, solana, props?.dstChain]);
}

export function useSolanaNonceUsed(props?: UseBurnTxDetailsType) {
  const { connection } = useConnection();
  const [state, setState] = useState(false);
  const [refetchCounter, setRefetchCounter] = useState(0);
  const messageTransmitterV2 = useMessageTransmitterV2();
  const messageTransmitterV1 = useMessageTransmitterV1();
  const tokenMessengerMinterV2 = useTokenMessengerMinterV2();
  const tokenMessengerMinterV1 = useTokenMessengerMinterV1();

  useEffect(() => {
    async function main() {
      if (
        !props ||
        !messageTransmitterV1 ||
        !messageTransmitterV2 ||
        !tokenMessengerMinterV1 ||
        !tokenMessengerMinterV2 ||
        props.message === "0x" ||
        !props.dstChain?.isSolana
      ) {
        return;
      }

      if (props.isV2) {
        const pdas = await getReceiveV2PDAS(
          messageTransmitterV2,
          tokenMessengerMinterV2,
          new PublicKey(SOLANA.usdc),
          props.srcChain.usdc,
          props.srcChain.domain,
          decodeEventNonceFromMessageV2(props.message),
        );

        const isUsed = await messageTransmitterV2.methods
          .isNonceUsed()
          .accounts({
            usedNonce: pdas.usedNonces,
          })
          .view();

        setState(isUsed);
        return;
      }

      if (props.isV1) {
        const nonce = decodeEventNonceFromMessage(props.message);

        const { usedNonces } = await getReceiveV1PDAS(
          messageTransmitterV1,
          tokenMessengerMinterV1,
          new PublicKey(SOLANA.usdc),
          props.srcChain.usdc,
          props.srcChain.domain,
          nonce,
        );

        const isUsed = await messageTransmitterV1.methods
          .isNonceUsed({
            nonce: new BN(nonce),
          })
          .accounts({
            usedNonces,
          })
          .view();

        setState(isUsed);
        return;
      }
    }

    main();
  }, [
    tokenMessengerMinterV1,
    tokenMessengerMinterV2,
    connection,
    props,
    refetchCounter,
    messageTransmitterV1,
    messageTransmitterV2,
  ]);

  const refetch = useCallback(() => {
    setRefetchCounter((val) => val + 1);
  }, []);

  return {
    data: state,
    refetch,
  };
}

export function useEvmNonceUsed(props?: UseBurnTxDetailsType) {
  const { data: evmNonceUsed, refetch } = useReadContract({
    address: (props?.isV1
      ? props?.dstChain?.messageTransmitterV1
      : props?.dstChain?.messageTransmitterV2) as Address,
    abi: MESSAGE_TRANSMITTER_ABI,
    functionName: "usedNonces",
    args: [props?.nonce ?? "0x"],
    chainId: props?.dstChain?.id as number,
    query: {
      enabled:
        props?.dstChain !== undefined &&
        props?.dstChain.isEVM &&
        props?.nonce !== "0x",
    },
  });

  return {
    data: useMemo(() => evmNonceUsed === 1n, [evmNonceUsed]),
    refetch,
  };
}
