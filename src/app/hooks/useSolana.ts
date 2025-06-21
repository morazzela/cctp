import * as anchor from "@coral-xyz/anchor";
import MESSAGE_TRANSMITTER_V2_IDL from "@/app/idls/message_transmitter_v2.json";
import TOKEN_MESSENGER_MINTER_V2_IDL from "@/app/idls/TokenMinterV2.json";
import { MessageTransmitterV2 } from "../idls/MessageTransmitterV2";
import { useAppKitProvider } from "@reown/appkit/react";
import { Provider } from "@reown/appkit-adapter-solana";
import { AnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { TokenMessengerMinterV2 } from "../idls/TokenMinterV2";

export function useAnchorProvider() {
  const { connection } = useConnection();
  const { walletProvider } = useAppKitProvider<Provider>("solana");

  return useMemo(() => {
    if (!connection) {
      return;
    }

    return new anchor.AnchorProvider(
      connection,
      walletProvider as AnchorWallet,
      {},
    );
  }, [connection, walletProvider]);
}

export function useMessageTransmitterV2() {
  const provider = useAnchorProvider();

  if (!provider) {
    return;
  }

  return new anchor.Program<MessageTransmitterV2>(
    MESSAGE_TRANSMITTER_V2_IDL as MessageTransmitterV2,
    provider,
  );
}

export function useTokenMessengerMinterV2() {
  const provider = useAnchorProvider();

  if (!provider) {
    return;
  }

  return new anchor.Program<TokenMessengerMinterV2>(
    TOKEN_MESSENGER_MINTER_V2_IDL as TokenMessengerMinterV2,
    provider,
  );
}
