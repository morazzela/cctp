import { Chain } from "./types";
import { CHAINS, SOLANA } from "./constants";
import { Address, getAddress, isAddress, toBytes, toHex } from "viem";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey, VersionedTransactionResponse } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { MessageTransmitter } from "./idls/MessageTransmitter";
import { TokenMessengerMinter } from "./idls/TokenMessengerMinter";
import { MessageTransmitterV2 } from "./idls/MessageTransmitterV2";
import { TokenMessengerMinterV2 } from "./idls/TokenMessengerMinterV2";
import { Connection } from "@reown/appkit-adapter-solana";

export async function waitForSolanaTx(
  signature: string,
  connection: Connection,
): Promise<VersionedTransactionResponse> {
  let success = false;
  let tx: VersionedTransactionResponse | null;

  do {
    tx = await connection.getTransaction(signature, {
      commitment: "finalized",
      maxSupportedTransactionVersion: 0,
    });

    success = tx !== null;

    await sleep(3_000);
  } while (success === false);

  return tx as VersionedTransactionResponse;
}

export function findChainByDomainId(domain: number): Chain {
  const res = CHAINS.find((c) => c.domain === domain);

  if (res === undefined) {
    throw new Error("Could not find chain by domain id: " + domain);
  }

  return res;
}

export function findChainById(id: number | string): Chain {
  const res = CHAINS.find((c) => c.id === id);

  if (res === undefined) {
    throw new Error("Could not find chain by id: " + id);
  }

  return res;
}

export function shouldUseV1(srcChain: Chain, dstChain: Chain): boolean {
  return srcChain.hasV2 !== dstChain.hasV2 || !srcChain.hasV2;
}

export function formatNumber(val: number | bigint) {
  return new Intl.NumberFormat("en-US").format(val);
}

type CreateChainFromNetworkProps = {
  domain: number;
  usdc: string;
  tokenMessengerV1?: string;
  messageTransmitterV1?: string;
  tokenMinterV1?: string;
  tokenMessengerV2?: string;
  messageTransmitterV2?: string;
  tokenMinterV2?: string;
  standardETA: number;
  fastETA?: number;
  icon: string;
  hasV1: boolean;
  hasV2: boolean;
};

export function createChainFromNetwork(
  // eslint-disable-next-line
  network: any,
  props: CreateChainFromNetworkProps,
): Chain {
  const namespace =
    "chainNamespace" in network && network.chainNamespace
      ? network.chainNamespace
      : "eip155";

  return {
    network,
    namespace,
    isEVM: namespace === "eip155",
    isSolana: namespace === "solana",
    id: network.id,
    name: network.name,
    getTxUri: (hash) => `${network.blockExplorers?.default?.url}/tx/${hash}`,
    ...props,
  };
}

export function solanaAddressToHex(address: string): Address {
  return toHex(bs58.decode(address));
}

export function evmAddressToBytes32(address: string): string {
  return `0x000000000000000000000000${address.replace("0x", "")}`;
}

export function evmAddressToBase58PublicKey(address: string): PublicKey {
  return new PublicKey(toBytes(evmAddressToBytes32(address)));
}

export function getChecksumedAddress(
  address: string | undefined,
  chain: Chain,
): null | string {
  if (address === undefined) {
    return null;
  }

  if (chain.isEVM) {
    if (!isAddress(address, { strict: false })) {
      return null;
    }

    return getAddress(address);
  }

  if (chain.isSolana) {
    try {
      const pk = new PublicKey(address);
      return pk.toString();
      // eslint-disable-next-line
    } catch (err) {
      return null;
    }
  }

  return null;
}

export const findProgramAddress = (
  label: string,
  programId: PublicKey,
  extraSeeds?: (string | number[] | Buffer | PublicKey)[],
): PublicKey => {
  const seeds: Buffer[] = [Buffer.from(anchor.utils.bytes.utf8.encode(label))];
  if (extraSeeds) {
    for (const extraSeed of extraSeeds) {
      if (typeof extraSeed === "string") {
        seeds.push(Buffer.from(anchor.utils.bytes.utf8.encode(extraSeed)));
      } else if (Array.isArray(extraSeed)) {
        seeds.push(Buffer.from(extraSeed as number[]));
      } else if (Buffer.isBuffer(extraSeed)) {
        seeds.push(extraSeed);
      } else {
        seeds.push(extraSeed.toBuffer());
      }
    }
  }
  const res = PublicKey.findProgramAddressSync(seeds, programId);
  return res[0];
};

export const decodeEventNonceFromMessage = (messageHex: string): string => {
  const nonceIndex = 12;
  const nonceBytesLength = 8;
  const message = toBytes(messageHex);
  const eventNonceBytes = message.subarray(
    nonceIndex,
    nonceIndex + nonceBytesLength,
  );
  const eventNonceHex = toHex(eventNonceBytes);
  return BigInt(eventNonceHex).toString();
};

export const decodeEventNonceFromMessageV2 = (messageHex: string) => {
  const nonceIndex = 12;
  const nonceBytesLength = 32;
  const message = Buffer.from(messageHex.replace("0x", ""), "hex");
  const eventNonceBytes = message.subarray(
    nonceIndex,
    nonceIndex + nonceBytesLength,
  );
  return Buffer.from(eventNonceBytes);
};

export async function getSolanaUSDCAccount(solanaAddress: string) {
  return await getAssociatedTokenAddress(
    new PublicKey(SOLANA.usdc),
    new PublicKey(solanaAddress),
    true,
  );
}

export async function getReceiveV2PDAS(
  messageTransmitterProgram: anchor.Program<MessageTransmitterV2>,
  tokenMessengerMinterProgram: anchor.Program<TokenMessengerMinterV2>,
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
    "used_nonce",
    messageTransmitterProgram.programId,
    [nonce],
  );

  const tokenMessengerAccounts =
    await tokenMessengerMinterProgram.account.tokenMessenger.fetch(
      tokenMessengerAccount,
    );
  const feeRecipientTokenAccount = await getAssociatedTokenAddress(
    solUsdcAddress,
    tokenMessengerAccounts.feeRecipient,
  );

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
    feeRecipientTokenAccount,
  };
}

export async function getReceiveV1PDAS(
  messageTransmitterProgram: anchor.Program<MessageTransmitter>,
  tokenMessengerMinterProgram: anchor.Program<TokenMessengerMinter>,
  solUsdcAddress: PublicKey,
  remoteUsdcAddressHex: string,
  remoteDomain: number,
  nonce: string,
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

  const usedNonces = await messageTransmitterProgram.methods
    .getNoncePda({
      nonce: new anchor.BN(nonce),
      sourceDomain: Number(remoteDomain),
    })
    .accounts({
      messageTransmitter: messageTransmitterAccount,
    })
    .view();

  return {
    messageTransmitterAccount,
    tokenMessengerAccount,
    tokenMinterAccount,
    localToken,
    remoteTokenMessengerKey,
    tokenPair,
    custodyTokenAccount,
    authorityPda,
    tokenMessengerEventAuthority,
    usedNonces,
  };
}

export async function getDepositPDAS(
  messageTransmitterProgram:
    | anchor.Program<MessageTransmitter>
    | anchor.Program<MessageTransmitterV2>,
  tokenMessengerMinterProgram:
    | anchor.Program<TokenMessengerMinter>
    | anchor.Program<TokenMessengerMinterV2>,
  solUsdcAddress: PublicKey,
  remoteDomain: number,
) {
  const messageTransmitterAccount = findProgramAddress(
    "message_transmitter",
    messageTransmitterProgram.programId,
  );
  const tokenMessengerAccount = findProgramAddress(
    "token_messenger",
    tokenMessengerMinterProgram.programId,
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
    [remoteDomain.toString()],
  );
  const authorityPda = findProgramAddress(
    "sender_authority",
    tokenMessengerMinterProgram.programId,
  );

  const tokenMessengerEventAuthority = findProgramAddress(
    "__event_authority",
    tokenMessengerMinterProgram.programId,
  );

  return {
    messageTransmitterAccount,
    tokenMessengerAccount,
    tokenMinterAccount,
    localToken,
    remoteTokenMessengerKey,
    authorityPda,
    tokenMessengerEventAuthority,
  };
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
