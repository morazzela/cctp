import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { UseBurnTxDetailsType } from "../hooks/useBurnTxDetails";
import {
  useMessageTransmitterV2,
  useTokenMessengerMinterV2,
} from "../hooks/useSolana";
import {
  Provider,
  useAppKitConnection,
} from "@reown/appkit-adapter-solana/react";
import { useCallback } from "react";
import {
  AddressLookupTableProgram,
  ComputeBudgetProgram,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  decodeEventNonceFromMessageV2,
  evmAddressToBase58PublicKey,
  getReceiveV2PDAS,
  sleep,
} from "../utils";
import * as spl from "@solana/spl-token";

export function useSolanaReceive(data?: UseBurnTxDetailsType) {
  const { connection } = useAppKitConnection();
  const { address } = useAppKitAccount();
  const messageTransmitterV2 = useMessageTransmitterV2();
  const tokenMessengerMinterV2 = useTokenMessengerMinterV2();
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

    const txs: VersionedTransaction[] = [];

    const pk = new PublicKey(address);
    const usdc = new PublicKey(data.dstChain.usdc);
    const recipient = evmAddressToBase58PublicKey(data.recipient);
    const accountInfo = await connection.getAccountInfo(recipient);
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    if (!accountInfo) {
      let instruction;

      if (
        recipient.toBase58() === "AxdC1m7xHYevjgETSWf9XiEW5XCYnyFRFoPbTvbaWR6B"
      ) {
        instruction = spl.createAssociatedTokenAccountInstruction(
          pk,
          recipient,
          new PublicKey("7nfzR3ktFqQzFKadjopKCcaBi8HyAMagYRvB97naPNdT"),
          usdc,
        );
      } else {
        instruction = spl.createAssociatedTokenAccountInstruction(
          pk,
          recipient,
          pk,
          usdc,
        );
      }

      const tx = new VersionedTransaction(
        new TransactionMessage({
          payerKey: pk,
          instructions: [instruction],
          recentBlockhash,
        }).compileToV0Message(),
      );
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

    const ix = await messageTransmitterV2.methods
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
      .instruction();

    let tx = new VersionedTransaction(
      new TransactionMessage({
        instructions: [ix],
        payerKey: pk,
        recentBlockhash,
      }).compileToV0Message(),
    );

    const txSize = tx.serialize().length;
    const simulation = await connection.simulateTransaction(tx);

    if (
      txSize > 1232 ||
      (simulation.value.unitsConsumed !== undefined &&
        simulation.value.unitsConsumed > 200_000) ||
      (simulation.value.err !== null && !!accountInfo)
    ) {
      const slot = await connection.getSlot();

      const [createIx, lookupTableAddress] =
        AddressLookupTableProgram.createLookupTable({
          authority: pk,
          payer: pk,
          recentSlot: slot,
        });

      const extendIx = AddressLookupTableProgram.extendLookupTable({
        payer: pk,
        authority: pk,
        lookupTable: lookupTableAddress,
        addresses: accountMetas.map((meta) => meta.pubkey),
      });

      const tableTx = new VersionedTransaction(
        new TransactionMessage({
          payerKey: pk,
          recentBlockhash,
          instructions: [createIx, extendIx],
        }).compileToV0Message(),
      );

      const sign = await walletProvider.signAndSendTransaction(tableTx);

      let success = false;
      do {
        const tx = await connection?.getTransaction(sign, {
          commitment: "finalized",
          maxSupportedTransactionVersion: 0,
        });

        success = !!tx;

        await sleep(3_000);
      } while (success === false);

      const { value: lookupTableAccount } =
        await connection.getAddressLookupTable(lookupTableAddress);

      if (!lookupTableAccount) {
        txs.push(tx);
        return txs;
      }

      tx = new VersionedTransaction(
        new TransactionMessage({
          instructions: [
            ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1n }),
            ix,
          ],
          payerKey: pk,
          recentBlockhash,
        }).compileToV0Message([lookupTableAccount]),
      );
    }

    txs.push(tx);

    return txs;
  }, [
    data,
    messageTransmitterV2,
    tokenMessengerMinterV2,
    connection,
    address,
    walletProvider,
  ]);

  return useCallback(async () => {
    if (data?.isV1) {
      throw new Error("CCTP v1 not supported");
    }

    const txs = await v2();

    if (!txs || txs.length === 0 || !connection || !address) {
      return;
    }

    let signature: string = "";

    for (const tx of txs) {
      signature = await walletProvider.signAndSendTransaction(tx);
    }

    return signature;
  }, [data?.isV1, v2, address, connection, walletProvider]);
}
