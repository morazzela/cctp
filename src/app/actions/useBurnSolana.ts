import { useCallback } from "react";
import { formatUnits, toBytes } from "viem";
import { Chain } from "../types";
import { track } from "@vercel/analytics";
import {
  evmAddressToBytes32,
  getChecksumedAddress,
  getSolanaUSDCAccount,
  shouldUseV1,
  getDepositPDAS,
} from "../utils";
import {
  useMessageTransmitterV1,
  useMessageTransmitterV2,
  useTokenMessengerMinterV1,
  useTokenMessengerMinterV2,
} from "../hooks/useSolana";
import { BN } from "@coral-xyz/anchor";
import { SOLANA } from "../constants";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { useAppKitAccount } from "@reown/appkit/react";
import * as spl from "@solana/spl-token";

type UseBurnProps = {
  srcChain: Chain;
  dstChain: Chain;
  amount: bigint;
  fee: bigint;
  recipient?: string;
  minFinalityThreshold: number;
};

export function useSolanaBurn({
  srcChain,
  dstChain,
  amount,
  fee,
  recipient,
  minFinalityThreshold,
}: UseBurnProps) {
  const { address } = useAppKitAccount({ namespace: "solana" });
  const { connection } = useAppKitConnection();
  const messageTransmitterV1 = useMessageTransmitterV1();
  const messageTransmitterV2 = useMessageTransmitterV2();
  const tokenMessengerMinterV1 = useTokenMessengerMinterV1();
  const tokenMessengerMinterV2 = useTokenMessengerMinterV2();

  return useCallback(async () => {
    if (
      !address ||
      !connection ||
      !recipient ||
      !srcChain.isSolana ||
      !messageTransmitterV1 ||
      !messageTransmitterV2 ||
      !tokenMessengerMinterV1 ||
      !tokenMessengerMinterV2
    ) {
      return;
    }

    const isV1 = shouldUseV1(srcChain, dstChain);

    const pk = new PublicKey(address);
    let validRecipient = getChecksumedAddress(recipient, SOLANA);

    if (dstChain.isEVM) {
      validRecipient = evmAddressToBytes32(recipient);
    }

    if (!validRecipient) {
      return;
    }

    const usdc = new PublicKey(SOLANA.usdc);
    const usdcAccount = await getSolanaUSDCAccount(address);
    const messageSentEventAccountKeypair = Keypair.generate();

    if (isV1) {
      throw new Error("CCTP V1 not supported");
    }

    const pdas = await getDepositPDAS(
      messageTransmitterV2,
      tokenMessengerMinterV2,
      usdc,
      dstChain.domain,
    );

    const signature = await tokenMessengerMinterV2.methods
      .depositForBurn({
        amount: new BN(amount),
        destinationDomain: dstChain.domain,
        mintRecipient: new PublicKey(toBytes(validRecipient)),
        destinationCaller: PublicKey.default,
        maxFee: new BN(fee),
        minFinalityThreshold: minFinalityThreshold,
      })
      .accountsPartial({
        owner: pk,
        eventRentPayer: pk,
        senderAuthorityPda: pdas.authorityPda,
        burnTokenAccount: usdcAccount,
        messageTransmitter: pdas.messageTransmitterAccount,
        tokenMessenger: pdas.tokenMessengerAccount,
        remoteTokenMessenger: pdas.remoteTokenMessengerKey,
        tokenMinter: pdas.tokenMinterAccount,
        localToken: pdas.localToken,
        burnTokenMint: usdc,
        messageSentEventData: messageSentEventAccountKeypair.publicKey,
        messageTransmitterProgram: messageTransmitterV2.programId,
        tokenMessengerMinterProgram: tokenMessengerMinterV2.programId,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([messageSentEventAccountKeypair])
      .rpc();

    // tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    // tx.feePayer = pk;

    const latestBlock = await await connection.getLatestBlockhash();

    // const signedTx = await walletProvider.signTransaction(tx)
    // const signature = await walletProvider.sendTransaction(signedTx, connection);

    track("Burn", {
      srcChain: srcChain.name,
      dstChain: dstChain.name,
      amount: formatUnits(amount, 6),
    });

    return { signature, ...latestBlock };
  }, [
    recipient,
    srcChain,
    dstChain,
    amount,
    fee,
    minFinalityThreshold,
    connection,
    address,
    messageTransmitterV1,
    messageTransmitterV2,
    tokenMessengerMinterV1,
    tokenMessengerMinterV2,
  ]);
}
