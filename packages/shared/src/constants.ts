export const CHAIN_IDS = {
  MAINNET: 1,
  SEPOLIA: 11155111,
} as const;

export const CONTRACT_ADDRESSES: Record<string, Record<string, `0x${string}`>> = {
  [CHAIN_IDS.SEPOLIA]: {
    CUBS_NFT: "0x0000000000000000000000000000000000000000",
    CUBS_TOKEN: "0x0000000000000000000000000000000000000000",
    CUBS_STAKING: "0x0000000000000000000000000000000000000000",
    CUBS_MARKETPLACE: "0x0000000000000000000000000000000000000000",
  },
  [CHAIN_IDS.MAINNET]: {
    CUBS_NFT: "0x0000000000000000000000000000000000000000",
    CUBS_TOKEN: "0x0000000000000000000000000000000000000000",
    CUBS_STAKING: "0x0000000000000000000000000000000000000000",
    CUBS_MARKETPLACE: "0x0000000000000000000000000000000000000000",
  },
};

export const IPFS_GATEWAYS = {
  PINATA: "https://gateway.pinata.cloud/ipfs/",
} as const;

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

export const MARKETPLACE_PLATFORM_FEE_BPS = 250; // 2.5%
export const MARKETPLACE_ROYALTY_BPS = 500; // 5%

// ─── Economy Defaults ───────────────────────────────────

export const DEFAULT_RARITY_MULTIPLIERS = {
  COMMON: 1.0,
  UNCOMMON: 1.25,
  RARE: 1.5,
  EPIC: 2.0,
  LEGENDARY: 3.0,
} as const;

export const DEFAULT_BASE_PAWS_RATE = 100; // per cub per day
export const DEFAULT_DAILY_CLAIM_AMOUNT = 50;
export const DEFAULT_DAILY_CLAIM_COOLDOWN_HRS = 24;
export const DEFAULT_PAWS_TRADE_BURN_PCT = 10;
export const DEFAULT_TRAIT_BURN_RETURN_MIN = 30; // %
export const DEFAULT_TRAIT_BURN_RETURN_MAX = 60; // %

// ─── Discord Link ───────────────────────────────────────

export const LINK_CODE_TTL_SECONDS = 600; // 10 minutes
export const LINK_CODE_PREFIX = "CUBS-";

// ─── Rate Limits (requests per window) ──────────────────

export const RATE_LIMITS = {
  AUTH_NONCE: { max: 10, window: 60 },
  AUTH_VERIFY: { max: 5, window: 60 },
  LINK_REQUEST: { max: 3, window: 60 },
  DAILY_CLAIM: { max: 2, window: 60 },
  STAKING_CLAIM: { max: 3, window: 60 },
  CRATE_OPEN: { max: 10, window: 60 },
  CRATE_PURCHASE: { max: 5, window: 60 },
  MARKETPLACE_WRITE: { max: 10, window: 60 },
  TRAIT_BURN: { max: 10, window: 60 },
  ADMIN: { max: 30, window: 60 },
  BOT_GLOBAL: { max: 100, window: 60 },
} as const;
