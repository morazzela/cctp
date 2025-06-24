import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { UseBurnTxDetailsType } from "../hooks/useBurnTxDetails";
import {
  useMessageTransmitterV1,
  useMessageTransmitterV2,
  useTokenMessengerMinterV1,
  useTokenMessengerMinterV2,
} from "../hooks/useSolana";
import {
  Provider,
  useAppKitConnection,
} from "@reown/appkit-adapter-solana/react";
import { useCallback } from "react";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  decodeEventNonceFromMessage,
  decodeEventNonceFromMessageV2,
  evmAddressToBase58PublicKey,
  getReceiveV1PDAS,
  getReceiveV2PDAS,
} from "../utils";
import * as spl from "@solana/spl-token";

export function useSolanaReceive(data?: UseBurnTxDetailsType) {
  const { connection } = useAppKitConnection();
  const { address } = useAppKitAccount();
  const messageTransmitterV2 = useMessageTransmitterV2();
  const tokenMessengerMinterV2 = useTokenMessengerMinterV2();
  const messageTransmitterV1 = useMessageTransmitterV1();
  const tokenMessengerMinterV1 = useTokenMessengerMinterV1();
  const { walletProvider } = useAppKitProvider<Provider>("solana");

  const v2 = useCallback(async () => {
    if (
      !data ||
      !data.dstChain ||
      !connection ||
      !address ||
      !messageTransmitterV2 ||
      !tokenMessengerMinterV2 ||
      !data.isV2
    ) {
      return;
    }

    const txs: Transaction[] = [];

    const pk = new PublicKey(address);
    const usdc = new PublicKey(data.dstChain.usdc);
    const recipient = evmAddressToBase58PublicKey(data.recipient);
    const accountInfo = await connection.getAccountInfo(recipient);

    if (!accountInfo) {
      const instruction = spl.createAssociatedTokenAccountInstruction(
        pk,
        recipient,
        pk,
        usdc,
      );
      const tx = new Transaction();
      tx.instructions = [instruction];
      txs.push(tx);
    }

    const pdas = await getReceiveV2PDAS(
      messageTransmitterV2,
      tokenMessengerMinterV2,
      usdc,
      data.srcChain.usdc,
      data.srcChain.domain,
      decodeEventNonceFromMessageV2(data.message),
    );

    const accountMetas: {
      isSigner: boolean;
      isWritable: boolean;
      pubkey: PublicKey;
    }[] = [];

    accountMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: pdas.tokenMessengerAccount,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: pdas.remoteTokenMessengerKey,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: true,
      pubkey: pdas.tokenMinterAccount,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: true,
      pubkey: pdas.localToken,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: pdas.tokenPair,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: true,
      pubkey: pdas.feeRecipientTokenAccount,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: true,
      pubkey: recipient,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: true,
      pubkey: pdas.custodyTokenAccount,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: spl.TOKEN_PROGRAM_ID,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: pdas.tokenMessengerEventAuthority,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: tokenMessengerMinterV2.programId,
    });

    const tx = await messageTransmitterV2.methods
      .receiveMessage({
        message: Buffer.from(data.message.replace("0x", ""), "hex"),
        attestation: Buffer.from(data.attestation.replace("0x", ""), "hex"),
      })
      .accounts({
        payer: pk,
        caller: pk,
        messageTransmitter: pdas.messageTransmitterAccount,
        usedNonce: pdas.usedNonces,
        receiver: tokenMessengerMinterV2.programId,
        program: messageTransmitterV2.programId,
      })
      .remainingAccounts(accountMetas)
      .transaction();

    txs.push(tx);

    return txs;
  }, [data, messageTransmitterV2, tokenMessengerMinterV2, connection, address]);

  const v1 = useCallback(async () => {
    if (
      !data ||
      !data.dstChain ||
      !connection ||
      !address ||
      !messageTransmitterV1 ||
      !tokenMessengerMinterV1 ||
      !data.isV1
    ) {
      return;
    }

    const instructions: TransactionInstruction[] = [];

    const pk = new PublicKey(address);
    const usdc = new PublicKey(data.dstChain.usdc);
    const recipient = evmAddressToBase58PublicKey(data.recipient);
    const recipientTokenAccount = recipient;
    const accountInfo = await connection.getAccountInfo(recipientTokenAccount);

    const txs: Transaction[] = [];

    if (!accountInfo) {
      const instruction = spl.createAssociatedTokenAccountInstruction(
        pk,
        recipient,
        pk,
        usdc,
      );
      const tx = new Transaction();
      tx.instructions = [instruction];
      txs.push(tx);
    }

    if (!accountInfo) {
      instructions.push(
        spl.createAssociatedTokenAccountInstruction(
          pk,
          recipientTokenAccount,
          pk,
          usdc,
        ),
      );
    }

    const pdas = await getReceiveV1PDAS(
      messageTransmitterV1,
      tokenMessengerMinterV1,
      usdc,
      data.srcChain.usdc,
      data.srcChain.domain,
      decodeEventNonceFromMessage(data.message),
    );

    const accountMetas: {
      isSigner: boolean;
      isWritable: boolean;
      pubkey: PublicKey;
    }[] = [];

    accountMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: pdas.tokenMessengerAccount,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: pdas.remoteTokenMessengerKey,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: true,
      pubkey: pdas.tokenMinterAccount,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: true,
      pubkey: pdas.localToken,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: pdas.tokenPair,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: true,
      pubkey: recipientTokenAccount,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: true,
      pubkey: pdas.custodyTokenAccount,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: spl.TOKEN_PROGRAM_ID,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: pdas.tokenMessengerEventAuthority,
    });
    accountMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: tokenMessengerMinterV1.programId,
    });

    const tx = await messageTransmitterV1.methods
      .receiveMessage({
        message: Buffer.from(data.message.replace("0x", ""), "hex"),
        attestation: Buffer.from(data.attestation.replace("0x", ""), "hex"),
      })
      .accounts({
        payer: pk,
        caller: pk,
        authorityPda: pdas.authorityPda,
        messageTransmitter: pdas.messageTransmitterAccount,
        usedNonces: pdas.usedNonces,
        receiver: tokenMessengerMinterV1.programId,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(accountMetas)
      .preInstructions(instructions)
      .transaction();

    txs.push(tx);

    return txs;
  }, [data, connection, address, messageTransmitterV1, tokenMessengerMinterV1]);

  return useCallback(async () => {
    const txs = await (data?.isV1 ? v1 : v2)();

    if (!txs || txs.length === 0 || !connection || !address) {
      return;
    }

    const pk = new PublicKey(address);

    let signature: string = "";

    for (const tx of txs) {
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.feePayer = pk;
      signature = await walletProvider.signAndSendTransaction(tx);
    }

    return signature;
  }, [data?.isV1, v2, v1, address, connection, walletProvider]);
}
