import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";
import { UseBurnTxDetailsType } from "../hooks/useBurnTxDetails";
import { useMessageTransmitterV2, useTokenMessengerMinterV2 } from "../hooks/useSolana";
import { Provider, useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { useCallback } from "react";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { decodeEventNonceFromMessageV2, evmAddressToBase58PublicKey, findProgramAddress } from "../utils";
import {
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor"
import { toBytes } from "viem";
import { MessageTransmitterV2 } from "../idls/MessageTransmitterV2";
import { TokenMessengerMinterV2 } from "../idls/TokenMinterV2";
import * as spl from "@solana/spl-token";

export function useSolanaReceive(data?: UseBurnTxDetailsType) {
    const { switchNetwork, chainId } = useAppKitNetwork();
    const { connection } = useAppKitConnection();
    const { address } = useAppKitAccount();
    const messageTransmitterV2 = useMessageTransmitterV2();
    const tokenMessengerMinterV2 = useTokenMessengerMinterV2();
    const { walletProvider } = useAppKitProvider<Provider>("solana")

    return useCallback(async () => {
        if (
            !data ||
            !data.dstChain ||
            !connection ||
            !address ||
            !messageTransmitterV2 ||
            !tokenMessengerMinterV2
        ) {
            return;
        }

        if (chainId !== data.dstChain.id) {
            switchNetwork(data.dstChain.network);
            return;
        }

        const instructions: TransactionInstruction[] = [];

        const pk = new PublicKey(address);
        const usdc = new PublicKey(data.dstChain.usdc);
        const recipient = evmAddressToBase58PublicKey(data.recipient);
        const recipientTokenAccount = await getAssociatedTokenAddress(
            usdc,
            recipient,
        );
        const accountInfo = await connection.getAccountInfo(recipientTokenAccount);

        if (!accountInfo) {
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    pk,
                    recipientTokenAccount,
                    recipient,
                    usdc,
                ),
            );
        }

        const pdas = await getPDAS(
            messageTransmitterV2,
            tokenMessengerMinterV2,
            usdc,
            data.srcChain.usdc,
            data.srcChain.domain,
            decodeEventNonceFromMessageV2(data.message),
        )

        const accountMetas: any[] = [];
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
            .preInstructions(instructions)
            .transaction()

        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
        tx.feePayer = pk

        walletProvider.signAndSendTransaction(tx)
    }, [data, messageTransmitterV2, tokenMessengerMinterV2, connection, address, chainId]);
}

async function getPDAS(
    messageTransmitterProgram: Program<MessageTransmitterV2>,
    tokenMessengerMinterProgram: Program<TokenMessengerMinterV2>,
    solUsdcAddress: PublicKey,
    remoteUsdcAddressHex: string,
    remoteDomain: number,
    nonce: Buffer,
) {
    const tokenMessengerAccount = findProgramAddress(
        "token_messenger",
        tokenMessengerMinterProgram.programId,
    );

    const messageTransmitterAccount = findProgramAddress(
        "message_transmitter",
        messageTransmitterProgram.programId,
    );

    const tokenMinterAccount = findProgramAddress(
        "token_minter",
        tokenMessengerMinterProgram.programId,
    );

    const localToken = findProgramAddress(
        "local_token",
        tokenMessengerMinterProgram.programId,
        [solUsdcAddress],
    );

    const remoteTokenMessengerKey = findProgramAddress(
        "remote_token_messenger",
        tokenMessengerMinterProgram.programId,
        [remoteDomain.toFixed()],
    );

    const remoteTokenKey = new PublicKey(toBytes(remoteUsdcAddressHex));

    const tokenPair = findProgramAddress(
        "token_pair",
        tokenMessengerMinterProgram.programId,
        [remoteDomain.toFixed(), remoteTokenKey],
    );

    const custodyTokenAccount = findProgramAddress(
        "custody",
        tokenMessengerMinterProgram.programId,
        [solUsdcAddress],
    );

    const authorityPda = findProgramAddress(
        "message_transmitter_authority",
        messageTransmitterProgram.programId,
        [tokenMessengerMinterProgram.programId],
    );

    const tokenMessengerEventAuthority = findProgramAddress(
        "__event_authority",
        tokenMessengerMinterProgram.programId,
    );

    const usedNonces = findProgramAddress(
        "used_nonces",
        messageTransmitterProgram.programId,
        [remoteDomain.toFixed(), nonce]
    )

    return {
        messageTransmitterAccount,
        tokenMessengerAccount,
        tokenMinterAccount,
        localToken,
        remoteTokenMessengerKey,
        remoteTokenKey,
        tokenPair,
        custodyTokenAccount,
        authorityPda,
        tokenMessengerEventAuthority,
        usedNonces,
    };
}
