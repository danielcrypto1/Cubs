import { createPublicClient, http } from "viem";
import { sepolia, mainnet } from "viem/chains";
import { config } from "./config.js";

const chain = process.env.NODE_ENV === "production" ? mainnet : sepolia;

export const publicClient = createPublicClient({
  chain,
  transport: http(
    `https://eth-${chain.id === 1 ? "mainnet" : "sepolia"}.g.alchemy.com/v2/${config.ALCHEMY_API_KEY}`
  ),
});

export async function verifySiweSignature(message: string, signature: `0x${string}`): Promise<boolean> {
  try {
    const valid = await publicClient.verifyMessage({
      address: extractAddress(message),
      message,
      signature,
    });
    return valid;
  } catch {
    return false;
  }
}

export function extractAddress(message: string): `0x${string}` {
  const match = message.match(/0x[a-fA-F0-9]{40}/);
  if (!match) throw new Error("No address found in SIWE message");
  return match[0] as `0x${string}`;
}

export function extractNonce(message: string): string {
  const match = message.match(/Nonce: (.+)/);
  if (!match) throw new Error("No nonce found in SIWE message");
  return match[1].trim();
}

export function extractChainId(message: string): number {
  const match = message.match(/Chain ID: (\d+)/);
  if (!match) throw new Error("No chain ID found in SIWE message");
  return parseInt(match[1], 10);
}
