import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  getChecksumedAddress,
  getSolanaUSDCAccount,
  waitForSolanaTx,
} from "../utils";
import { SOLANA } from "../constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Provider,
  useAppKitConnection,
} from "@reown/appkit-adapter-solana/react";
import * as spl from "@solana/spl-token";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";

export function useCreateSolanaUSDCAccount(
  recipient: string | undefined,
  enabled: boolean,
) {
  const [accountAddress, setAccountAddress] = useState<PublicKey | null>(null);
  const [isInit, setIsInit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { connection } = useAppKitConnection();
  const { address } = useAppKitAccount({ namespace: "solana" });
  const { walletProvider } = useAppKitProvider<Provider>("solana");

  const checksumedRecipient = useMemo(
    () => getChecksumedAddress(recipient, SOLANA),
    [recipient],
  );

  useEffect(() => {
    async function main() {
      setIsLoading(true);

      if (enabled === false || checksumedRecipient === null || !connection) {
        setAccountAddress(null);
        setIsInit(false);
        setIsLoading(false);
        return;
      }

      const accountAddress = await getSolanaUSDCAccount(checksumedRecipient);
      const accountInfos = await connection.getAccountInfo(accountAddress);

      setAccountAddress(accountAddress);
      setIsInit(accountInfos !== null);
      setIsLoading(false);
    }

    main();
  }, [checksumedRecipient, enabled, connection]);

  const create = useCallback(async () => {
    if (
      !connection ||
      !address ||
      !recipient ||
      accountAddress === null ||
      isLoading
    ) {
      return;
    }

    const pk = new PublicKey(address);
    const recipientPk = new PublicKey(recipient);
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const usdcPk = new PublicKey(SOLANA.usdc);

    const instruction = spl.createAssociatedTokenAccountInstruction(
      pk,
      accountAddress,
      recipientPk,
      usdcPk,
    );

    const tx = new VersionedTransaction(
      new TransactionMessage({
        payerKey: pk,
        instructions: [instruction],
        recentBlockhash,
      }).compileToV0Message(),
    );

    setIsCreating(true);

    try {
      const sign = await walletProvider.signAndSendTransaction(tx);
      await waitForSolanaTx(sign, connection);
    } catch (err) {
      console.error(err);
      setIsCreating(false);
      return;
    }

    setIsCreating(false);
    setIsInit(true);
  }, [
    accountAddress,
    address,
    connection,
    isLoading,
    recipient,
    walletProvider,
  ]);

  return {
    accountAddress,
    isInit,
    create,
    isLoading,
    isCreating,
  };
}
