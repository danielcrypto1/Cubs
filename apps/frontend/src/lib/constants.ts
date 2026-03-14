export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "11155111");

export const TRAIT_LAYER_ORDER = [
  "BACKGROUND",
  "BODY",
  "OUTFIT",
  "SHOES",
  "ACCESSORIES",
  "HAT",
  "EYES",
  "MOUTH",
  "SPECIAL",
] as const;
