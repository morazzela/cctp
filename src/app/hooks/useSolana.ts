import * as anchor from "@coral-xyz/anchor";
import MESSAGE_TRANSMITTER_V2_IDL from "@/app/idls/message_transmitter_v2.json";
import TOKEN_MESSENGER_MINTER_V2_IDL from "@/app/idls/token_messenger_minter_v2.json";
import MESSAGE_TRANSMITTER_V1_IDL from "@/app/idls/message_transmitter_031.json";
import TOKEN_MESSENGER_MINTER_V1_IDL from "@/app/idls/token_messenger_minter_031.json";
import { MessageTransmitterV2 } from "../idls/MessageTransmitterV2";
import { useAppKitProvider } from "@reown/appkit/react";
import { Provider } from "@reown/appkit-adapter-solana";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { TokenMessengerMinterV2 } from "../idls/TokenMessengerMinterV2";
import { TokenMessengerMinter } from "../idls/TokenMessengerMinter";
import { MessageTransmitter } from "../idls/MessageTransmitter";
import { clusterApiUrl, Connection } from "@solana/web3.js";

export function useAnchorProvider() {
  const { walletProvider } = useAppKitProvider<Provider>("solana");

  return useMemo(() => {
    if (!walletProvider) {
      return;
    }

    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl("mainnet-beta"),
    );

    return new anchor.AnchorProvider(
      connection,
      walletProvider as AnchorWallet,
      {
        commitment: "confirmed",
      },
    );
  }, [walletProvider]);
}

export function useMessageTransmitterV1() {
  const provider = useAnchorProvider();

  return useMemo(() => {
    if (!provider) {
      return;
    }

    return new anchor.Program<MessageTransmitter>(
      MESSAGE_TRANSMITTER_V1_IDL as MessageTransmitter,
      provider,
    );
  }, [provider]);
}

export function useTokenMessengerMinterV1() {
  const provider = useAnchorProvider();

  return useMemo(() => {
    if (!provider) {
      return;
    }

    return new anchor.Program<TokenMessengerMinter>(
      TOKEN_MESSENGER_MINTER_V1_IDL as TokenMessengerMinter,
      provider,
    );
  }, [provider]);
}

export function useMessageTransmitterV2() {
  const provider = useAnchorProvider();

  return useMemo(() => {
    if (!provider) {
      return;
    }

    return new anchor.Program<MessageTransmitterV2>(
      MESSAGE_TRANSMITTER_V2_IDL as MessageTransmitterV2,
      provider,
    );
  }, [provider]);
}

export function useTokenMessengerMinterV2() {
  const provider = useAnchorProvider();

  return useMemo(() => {
    if (!provider) {
      return;
    }

    return new anchor.Program<TokenMessengerMinterV2>(
      TOKEN_MESSENGER_MINTER_V2_IDL as TokenMessengerMinterV2,
      provider,
    );
  }, [provider]);
}
