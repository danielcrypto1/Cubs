/* ── Mock data for CUBS platform UI ─────────────────────────────────
   Used across all pages for placeholder content during Phase 2.
   Will be replaced with real API calls in Phase 6.
───────────────────────────────────────────────────────────────────── */

// ── Cubs ────────────────────────────────────────────────────────────

export interface MockCub {
  id: string;
  tokenId: number;
  name: string;
  imageUrl: string;
  traits: { category: string; value: string; rarity: string }[];
}

export const MOCK_CUBS: MockCub[] = [
  {
    id: "1",
    tokenId: 1,
    name: "Blaze",
    imageUrl: "https://placehold.co/400x400/1a1a2e/f59e0b?text=Cub+%231",
    traits: [
      { category: "Background", value: "Sunset", rarity: "RARE" },
      { category: "Body", value: "Golden", rarity: "EPIC" },
      { category: "Hat", value: "Crown", rarity: "LEGENDARY" },
      { category: "Eyes", value: "Sparkle", rarity: "UNCOMMON" },
    ],
  },
  {
    id: "2",
    tokenId: 2,
    name: "Frost",
    imageUrl: "https://placehold.co/400x400/1a1a2e/60a5fa?text=Cub+%232",
    traits: [
      { category: "Background", value: "Arctic", rarity: "UNCOMMON" },
      { category: "Body", value: "Ice Blue", rarity: "RARE" },
      { category: "Outfit", value: "Scarf", rarity: "COMMON" },
      { category: "Eyes", value: "Frosty", rarity: "RARE" },
    ],
  },
  {
    id: "3",
    tokenId: 3,
    name: "Blossom",
    imageUrl: "https://placehold.co/400x400/1a1a2e/f472b6?text=Cub+%233",
    traits: [
      { category: "Background", value: "Garden", rarity: "COMMON" },
      { category: "Body", value: "Pink", rarity: "UNCOMMON" },
      { category: "Hat", value: "Flower Crown", rarity: "RARE" },
      { category: "Mouth", value: "Smile", rarity: "COMMON" },
    ],
  },
  {
    id: "4",
    tokenId: 4,
    name: "Shadow",
    imageUrl: "https://placehold.co/400x400/1a1a2e/a78bfa?text=Cub+%234",
    traits: [
      { category: "Background", value: "Midnight", rarity: "EPIC" },
      { category: "Body", value: "Obsidian", rarity: "LEGENDARY" },
      { category: "Eyes", value: "Glowing", rarity: "EPIC" },
      { category: "Special", value: "Shadow Aura", rarity: "LEGENDARY" },
    ],
  },
  {
    id: "5",
    tokenId: 5,
    name: "Clover",
    imageUrl: "https://placehold.co/400x400/1a1a2e/34d399?text=Cub+%235",
    traits: [
      { category: "Background", value: "Meadow", rarity: "COMMON" },
      { category: "Body", value: "Forest Green", rarity: "UNCOMMON" },
      { category: "Hat", value: "Shamrock", rarity: "RARE" },
      { category: "Accessories", value: "Lucky Coin", rarity: "EPIC" },
    ],
  },
  {
    id: "6",
    tokenId: 6,
    name: "Ember",
    imageUrl: "https://placehold.co/400x400/1a1a2e/fb923c?text=Cub+%236",
    traits: [
      { category: "Background", value: "Volcano", rarity: "RARE" },
      { category: "Body", value: "Lava", rarity: "EPIC" },
      { category: "Eyes", value: "Fire", rarity: "LEGENDARY" },
      { category: "Outfit", value: "Armor", rarity: "RARE" },
    ],
  },
];

// ── Marketplace Listings ────────────────────────────────────────────

export interface MockListing {
  id: string;
  type: "CUB" | "TRAIT" | "CRATE";
  name: string;
  imageUrl: string;
  rarity: string;
  price: string;
  seller: string;
  category?: string;
  listedAt: string;
  quantity: number;
}

export const MOCK_LISTINGS: MockListing[] = [
  // Cubs
  { id: "l1",  type: "CUB",   name: "Blaze",          imageUrl: "https://placehold.co/400x400/1a1a2e/f59e0b?text=Blaze",        rarity: "EPIC",      price: "0.12", seller: "0xAb5d...3f1E", listedAt: "2026-03-14T10:00:00Z", quantity: 1 },
  { id: "l2",  type: "CUB",   name: "Shadow",         imageUrl: "https://placehold.co/400x400/1a1a2e/a78bfa?text=Shadow",       rarity: "LEGENDARY", price: "0.45", seller: "0x7f2C...8aD4", listedAt: "2026-03-13T14:30:00Z", quantity: 1 },
  { id: "l3",  type: "CUB",   name: "Frost",          imageUrl: "https://placehold.co/400x400/1a1a2e/60a5fa?text=Frost",        rarity: "RARE",      price: "0.08", seller: "0xCd91...7a3B", listedAt: "2026-03-15T08:15:00Z", quantity: 1 },
  { id: "l4",  type: "CUB",   name: "Ember",          imageUrl: "https://placehold.co/400x400/1a1a2e/fb923c?text=Ember",        rarity: "EPIC",      price: "0.18", seller: "0xEf42...2bC9", listedAt: "2026-03-12T22:00:00Z", quantity: 1 },
  // Traits
  { id: "l5",  type: "TRAIT",  name: "Crown",          imageUrl: "https://placehold.co/400x400/1a1a2e/f59e0b?text=Crown",       rarity: "LEGENDARY", price: "0.08", seller: "0xCd91...7a3B", category: "HAT",         listedAt: "2026-03-14T16:00:00Z", quantity: 1 },
  { id: "l6",  type: "TRAIT",  name: "Sparkle Eyes",   imageUrl: "https://placehold.co/400x400/1a1a2e/60a5fa?text=Eyes",         rarity: "UNCOMMON",  price: "0.02", seller: "0x12aF...9cE1", category: "EYES",        listedAt: "2026-03-15T06:00:00Z", quantity: 2 },
  { id: "l7",  type: "TRAIT",  name: "Shadow Aura",    imageUrl: "https://placehold.co/400x400/1a1a2e/6c3483?text=Aura",         rarity: "LEGENDARY", price: "0.25", seller: "0x7f2C...8aD4", category: "SPECIAL",     listedAt: "2026-03-13T12:00:00Z", quantity: 1 },
  { id: "l8",  type: "TRAIT",  name: "Armor",          imageUrl: "https://placehold.co/400x400/1a1a2e/7f8c8d?text=Armor",       rarity: "RARE",      price: "0.04", seller: "0xAb5d...3f1E", category: "OUTFIT",      listedAt: "2026-03-14T20:00:00Z", quantity: 1 },
  { id: "l9",  type: "TRAIT",  name: "Scarf",          imageUrl: "https://placehold.co/400x400/1a1a2e/c0392b?text=Scarf",       rarity: "COMMON",    price: "0.01", seller: "0xEf42...2bC9", category: "OUTFIT",      listedAt: "2026-03-15T02:00:00Z", quantity: 3 },
  { id: "l10", type: "TRAIT",  name: "Fire Eyes",      imageUrl: "https://placehold.co/400x400/1a1a2e/e74c3c?text=Fire",         rarity: "LEGENDARY", price: "0.15", seller: "0x34Bc...5dF2", category: "EYES",        listedAt: "2026-03-11T18:00:00Z", quantity: 1 },
  { id: "l11", type: "TRAIT",  name: "Flower Crown",   imageUrl: "https://placehold.co/400x400/1a1a2e/ec407a?text=Flower",      rarity: "RARE",      price: "0.035", seller: "0x12aF...9cE1", category: "HAT",        listedAt: "2026-03-14T08:00:00Z", quantity: 1 },
  { id: "l12", type: "TRAIT",  name: "Golden Body",    imageUrl: "https://placehold.co/400x400/1a1a2e/d4a017?text=Golden",      rarity: "EPIC",      price: "0.06", seller: "0x34Bc...5dF2", category: "BODY",        listedAt: "2026-03-13T10:00:00Z", quantity: 1 },
  // Crates
  { id: "l13", type: "CRATE",  name: "Epic Crate",     imageUrl: "https://placehold.co/400x400/1a1a2e/c084fc?text=Epic+Crate",  rarity: "EPIC",      price: "0.05", seller: "0xEf42...2bC9", listedAt: "2026-03-14T12:00:00Z", quantity: 2 },
  { id: "l14", type: "CRATE",  name: "Legendary Crate",imageUrl: "https://placehold.co/400x400/1a1a2e/f59e0b?text=Leg+Crate",   rarity: "LEGENDARY", price: "0.20", seller: "0x7f2C...8aD4", listedAt: "2026-03-13T06:00:00Z", quantity: 1 },
  { id: "l15", type: "CRATE",  name: "Rare Crate",     imageUrl: "https://placehold.co/400x400/1a1a2e/60a5fa?text=Rare+Crate",  rarity: "RARE",      price: "0.03", seller: "0xAb5d...3f1E", listedAt: "2026-03-15T04:00:00Z", quantity: 3 },
  { id: "l16", type: "CRATE",  name: "Common Crate",   imageUrl: "https://placehold.co/400x400/1a1a2e/71717a?text=Com+Crate",   rarity: "COMMON",    price: "0.01", seller: "0x12aF...9cE1", listedAt: "2026-03-14T18:00:00Z", quantity: 5 },
];

// ── Crates ──────────────────────────────────────────────────────────

export interface MockCrate {
  id: string;
  name: string;
  rarity: string;
  imageUrl: string;
  description: string;
  dropRates: { rarity: string; chance: number }[];
  quantity: number;
}

export const MOCK_CRATES: MockCrate[] = [
  {
    id: "c1",
    name: "Common Crate",
    rarity: "COMMON",
    imageUrl: "https://placehold.co/400x400/1a1a2e/71717a?text=Common",
    description: "A basic crate with common drops.",
    dropRates: [
      { rarity: "Common", chance: 70 },
      { rarity: "Uncommon", chance: 25 },
      { rarity: "Rare", chance: 5 },
    ],
    quantity: 3,
  },
  {
    id: "c2",
    name: "Rare Crate",
    rarity: "RARE",
    imageUrl: "https://placehold.co/400x400/1a1a2e/60a5fa?text=Rare",
    description: "Higher chance for rare and epic traits.",
    dropRates: [
      { rarity: "Uncommon", chance: 40 },
      { rarity: "Rare", chance: 40 },
      { rarity: "Epic", chance: 18 },
      { rarity: "Legendary", chance: 2 },
    ],
    quantity: 1,
  },
  {
    id: "c3",
    name: "Epic Crate",
    rarity: "EPIC",
    imageUrl: "https://placehold.co/400x400/1a1a2e/c084fc?text=Epic",
    description: "Guaranteed rare or better traits.",
    dropRates: [
      { rarity: "Rare", chance: 50 },
      { rarity: "Epic", chance: 40 },
      { rarity: "Legendary", chance: 10 },
    ],
    quantity: 2,
  },
  {
    id: "c4",
    name: "Legendary Crate",
    rarity: "LEGENDARY",
    imageUrl: "https://placehold.co/400x400/1a1a2e/f59e0b?text=Legendary",
    description: "The rarest crate. High legendary chance.",
    dropRates: [
      { rarity: "Epic", chance: 60 },
      { rarity: "Legendary", chance: 40 },
    ],
    quantity: 0,
  },
];

// ── Achievements ────────────────────────────────────────────────────

export interface MockAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
}

export const MOCK_ACHIEVEMENTS: MockAchievement[] = [
  { id: "a1", title: "First Mint", description: "Mint your first Cub", icon: "sparkles", reward: "100 CUBS", progress: 1, maxProgress: 1, unlocked: true },
  { id: "a2", title: "Collector", description: "Own 5 Cubs", icon: "trophy", reward: "250 CUBS", progress: 3, maxProgress: 5, unlocked: false },
  { id: "a3", title: "Trait Master", description: "Collect 20 unique traits", icon: "palette", reward: "500 CUBS", progress: 12, maxProgress: 20, unlocked: false },
  { id: "a4", title: "Market Maker", description: "Complete 10 marketplace trades", icon: "shopping-bag", reward: "300 CUBS", progress: 4, maxProgress: 10, unlocked: false },
  { id: "a5", title: "Crate Opener", description: "Open 25 crates", icon: "package", reward: "400 CUBS", progress: 8, maxProgress: 25, unlocked: false },
  { id: "a6", title: "Staking Legend", description: "Stake for 30 consecutive days", icon: "clock", reward: "1,000 CUBS", progress: 0, maxProgress: 30, unlocked: false },
  { id: "a7", title: "Legendary Find", description: "Obtain a Legendary trait", icon: "star", reward: "750 CUBS", progress: 1, maxProgress: 1, unlocked: true },
  { id: "a8", title: "Social Bear", description: "Share a Cub on social media", icon: "share", reward: "50 CUBS", progress: 0, maxProgress: 1, unlocked: false },
  { id: "a9", title: "Season Veteran", description: "Complete 3 seasonal events", icon: "calendar", reward: "2,000 CUBS", progress: 1, maxProgress: 3, unlocked: false },
];

// ── Seasons ─────────────────────────────────────────────────────────

export interface MockSeason {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
  progress: number;
  rewards: { name: string; description: string; rarity: string }[];
  upcomingTraits: { name: string; category: string; rarity: string }[];
}

export const MOCK_CURRENT_SEASON: MockSeason = {
  id: "s1",
  name: "Season 1: Arctic Expedition",
  description: "Explore frozen lands and collect exclusive ice-themed traits for your Cubs.",
  startDate: "2026-03-01",
  endDate: "2026-05-31",
  active: true,
  progress: 42,
  rewards: [
    { name: "Ice Crown", description: "An exclusive frozen crown trait", rarity: "LEGENDARY" },
    { name: "Snowflake Eyes", description: "Sparkling snowflake eye trait", rarity: "EPIC" },
    { name: "Frost Outfit", description: "A chilly winter outfit", rarity: "RARE" },
    { name: "Arctic Background", description: "A snowy arctic scene", rarity: "UNCOMMON" },
  ],
  upcomingTraits: [
    { name: "Blizzard Aura", category: "Special", rarity: "LEGENDARY" },
    { name: "Polar Bear Body", category: "Body", rarity: "EPIC" },
    { name: "Icicle Hat", category: "Hat", rarity: "RARE" },
    { name: "Snow Boots", category: "Shoes", rarity: "UNCOMMON" },
  ],
};

// ── Token Stats ─────────────────────────────────────────────────────

export const MOCK_TOKEN_STATS = {
  price: "$0.42",
  priceChange: "+5.2%",
  marketCap: "$4.2M",
  totalSupply: "10,000,000",
  burnedTokens: "125,000",
  totalStaked: "3,200,000",
  circulatingSupply: "6,675,000",
  holders: "2,847",
};

// ── Staking Stats ───────────────────────────────────────────────────

export const MOCK_STAKING_STATS = {
  nftApr: "45%",
  tokenApr: "22%",
  totalNftsStaked: 847,
  totalTokensStaked: "3.2M CUBS",
  userNftsStaked: 2,
  userTokensStaked: "12,500 CUBS",
  pendingRewards: "342 CUBS",
  claimedRewards: "1,200 CUBS",
};

// ── Editor: Trait Definitions ───────────────────────────────────────

import type {
  TraitDefinition,
  TraitCategory,
  TraitRarity,
  UserTrait,
  EditorCubState,
  EditorLayerConfig,
} from "@/types";

const td = (
  id: string, name: string, category: TraitCategory, rarity: TraitRarity, color: string,
): TraitDefinition => ({
  id, name, category, rarity,
  maxSupply: 1000, currentSupply: 200,
  imageUrl: `https://placehold.co/1024x1024/${color}/ffffff?text=${encodeURIComponent(name)}`,
  createdAt: "2026-01-01T00:00:00Z",
});

export const MOCK_TRAIT_DEFINITIONS: TraitDefinition[] = [
  // BACKGROUND
  td("bg-1", "Sunset",    "BACKGROUND", "RARE",      "e2725b"),
  td("bg-2", "Arctic",    "BACKGROUND", "UNCOMMON",   "a8d8ea"),
  td("bg-3", "Meadow",    "BACKGROUND", "COMMON",     "77b255"),
  // BODY
  td("bd-1", "Golden",    "BODY",       "EPIC",       "d4a017"),
  td("bd-2", "Ice Blue",  "BODY",       "RARE",       "5dade2"),
  td("bd-3", "Pink",      "BODY",       "UNCOMMON",   "f48fb1"),
  // OUTFIT
  td("of-1", "Scarf",     "OUTFIT",     "COMMON",     "c0392b"),
  td("of-2", "Armor",     "OUTFIT",     "RARE",       "7f8c8d"),
  td("of-3", "Hoodie",    "OUTFIT",     "UNCOMMON",   "2980b9"),
  // SHOES
  td("sh-1", "Sneakers",  "SHOES",      "COMMON",     "e67e22"),
  td("sh-2", "Boots",     "SHOES",      "UNCOMMON",   "6c3483"),
  td("sh-3", "Sandals",   "SHOES",      "COMMON",     "d4ac0d"),
  // ACCESSORIES
  td("ac-1", "Lucky Coin","ACCESSORIES","EPIC",        "f1c40f"),
  td("ac-2", "Necklace",  "ACCESSORIES","RARE",        "1abc9c"),
  td("ac-3", "Watch",     "ACCESSORIES","UNCOMMON",    "95a5a6"),
  // HAT
  td("ht-1", "Crown",     "HAT",        "LEGENDARY",  "f59e0b"),
  td("ht-2", "Flower Crown","HAT",      "RARE",        "ec407a"),
  td("ht-3", "Shamrock",  "HAT",        "RARE",        "27ae60"),
  // EYES
  td("ey-1", "Sparkle",   "EYES",       "UNCOMMON",   "f39c12"),
  td("ey-2", "Frosty",    "EYES",       "RARE",        "85c1e9"),
  td("ey-3", "Fire",      "EYES",       "LEGENDARY",   "e74c3c"),
  // MOUTH
  td("mo-1", "Smile",     "MOUTH",      "COMMON",     "f5b041"),
  td("mo-2", "Grin",      "MOUTH",      "UNCOMMON",   "eb984e"),
  td("mo-3", "Tongue Out","MOUTH",      "RARE",        "e74c3c"),
  // SPECIAL
  td("sp-1", "Shadow Aura","SPECIAL",   "LEGENDARY",   "6c3483"),
  td("sp-2", "Sparkle FX", "SPECIAL",   "EPIC",        "d4ac0d"),
  td("sp-3", "Flame Ring", "SPECIAL",   "EPIC",        "cb4335"),
];

// ── Editor: User-owned Traits ───────────────────────────────────────

const ut = (
  id: string, traitDefinitionId: string, quantity: number,
): UserTrait => ({
  id, traitDefinitionId, quantity,
  walletAddress: "0xMOCK",
  acquiredFrom: "MINT",
  acquiredAt: "2026-01-15T00:00:00Z",
  traitDefinition: MOCK_TRAIT_DEFINITIONS.find((t) => t.id === traitDefinitionId),
});

export const MOCK_USER_TRAITS: UserTrait[] = [
  ut("ut-1",  "bg-1", 1), ut("ut-2",  "bg-2", 2), ut("ut-3",  "bg-3", 1),
  ut("ut-4",  "bd-1", 1), ut("ut-5",  "bd-2", 1), ut("ut-6",  "bd-3", 2),
  ut("ut-7",  "of-1", 3), ut("ut-8",  "of-2", 1), ut("ut-9",  "of-3", 1),
  ut("ut-10", "sh-1", 2), ut("ut-11", "sh-2", 1), ut("ut-12", "sh-3", 1),
  ut("ut-13", "ac-1", 1), ut("ut-14", "ac-2", 1), ut("ut-15", "ac-3", 2),
  ut("ut-16", "ht-1", 1), ut("ut-17", "ht-2", 1), ut("ut-18", "ht-3", 1),
  ut("ut-19", "ey-1", 2), ut("ut-20", "ey-2", 1), ut("ut-21", "ey-3", 1),
  ut("ut-22", "mo-1", 2), ut("ut-23", "mo-2", 1), ut("ut-24", "mo-3", 1),
  ut("ut-25", "sp-1", 1), ut("ut-26", "sp-2", 1), ut("ut-27", "sp-3", 1),
];

// ── Editor: Initial Cub States ──────────────────────────────────────

function buildLayers(traitMap: Partial<Record<TraitCategory, string>>): EditorLayerConfig[] {
  const categories: TraitCategory[] = [
    "BACKGROUND", "BODY", "OUTFIT", "SHOES", "ACCESSORIES", "HAT", "EYES", "MOUTH", "SPECIAL",
  ];
  return categories.map((category) => {
    const traitId = traitMap[category] ?? null;
    const def = traitId ? MOCK_TRAIT_DEFINITIONS.find((t) => t.id === traitId) : null;
    return {
      category,
      traitDefinitionId: traitId,
      imageUrl: def?.imageUrl ?? null,
      name: def?.name ?? null,
    };
  });
}

export const MOCK_EDITOR_CUB_STATES: Record<string, EditorCubState> = {
  "1": { cubId: "1", tokenId: 1, name: "Blaze",   layers: buildLayers({ BACKGROUND: "bg-1", BODY: "bd-1", HAT: "ht-1", EYES: "ey-1" }) },
  "2": { cubId: "2", tokenId: 2, name: "Frost",   layers: buildLayers({ BACKGROUND: "bg-2", BODY: "bd-2", OUTFIT: "of-1", EYES: "ey-2" }) },
  "3": { cubId: "3", tokenId: 3, name: "Blossom", layers: buildLayers({ BACKGROUND: "bg-3", BODY: "bd-3", HAT: "ht-2", MOUTH: "mo-1" }) },
  "4": { cubId: "4", tokenId: 4, name: "Shadow",  layers: buildLayers({ BACKGROUND: "bg-1", BODY: "bd-1", EYES: "ey-3", SPECIAL: "sp-1" }) },
  "5": { cubId: "5", tokenId: 5, name: "Clover",  layers: buildLayers({ BACKGROUND: "bg-3", BODY: "bd-3", HAT: "ht-3", ACCESSORIES: "ac-1" }) },
  "6": { cubId: "6", tokenId: 6, name: "Ember",   layers: buildLayers({ BACKGROUND: "bg-1", BODY: "bd-1", EYES: "ey-3", OUTFIT: "of-2" }) },
};

// ── Editor: Scenes ──────────────────────────────────────────────────

export interface MockScene {
  id: string;
  name: string;
  thumbnailUrl: string;
  imageUrl: string;
}

export const MOCK_SCENES: MockScene[] = [
  { id: "beach",  name: "Beach",  thumbnailUrl: "https://placehold.co/200x200/f0c27f/4b3621?text=Beach",  imageUrl: "https://placehold.co/1024x1024/f0c27f/4b3621?text=Beach" },
  { id: "city",   name: "City",   thumbnailUrl: "https://placehold.co/200x200/2c3e50/ecf0f1?text=City",   imageUrl: "https://placehold.co/1024x1024/2c3e50/ecf0f1?text=City" },
  { id: "forest", name: "Forest", thumbnailUrl: "https://placehold.co/200x200/1e5631/a3d977?text=Forest", imageUrl: "https://placehold.co/1024x1024/1e5631/a3d977?text=Forest" },
  { id: "space",  name: "Space",  thumbnailUrl: "https://placehold.co/200x200/0b0c2a/7f8fff?text=Space",  imageUrl: "https://placehold.co/1024x1024/0b0c2a/7f8fff?text=Space" },
];

// ── Phase 9: Dashboard — Bud Bears & Breeding ─────────────────────

export interface MockBudBear {
  id: string;
  tokenId: number;
  name: string;
  imageUrl: string;
  breedCount: number;
  lastBreedAt: string | null;
}

export const MOCK_BUD_BEARS: MockBudBear[] = [
  { id: "bb-1", tokenId: 101, name: "Papa Bear",    imageUrl: "https://placehold.co/400x400/2d5016/a3d977?text=BudBear+%23101", breedCount: 1, lastBreedAt: "2025-12-01T10:00:00Z" },
  { id: "bb-2", tokenId: 202, name: "Mama Bear",    imageUrl: "https://placehold.co/400x400/2d5016/a3d977?text=BudBear+%23202", breedCount: 1, lastBreedAt: "2025-12-01T10:00:00Z" },
  { id: "bb-3", tokenId: 303, name: "Grizzly OG",   imageUrl: "https://placehold.co/400x400/2d5016/a3d977?text=BudBear+%23303", breedCount: 0, lastBreedAt: null },
  { id: "bb-4", tokenId: 404, name: "Honey Paws",   imageUrl: "https://placehold.co/400x400/2d5016/a3d977?text=BudBear+%23404", breedCount: 0, lastBreedAt: null },
  { id: "bb-5", tokenId: 505, name: "Smokey",       imageUrl: "https://placehold.co/400x400/2d5016/a3d977?text=BudBear+%23505", breedCount: 2, lastBreedAt: "2026-01-15T14:30:00Z" },
  { id: "bb-6", tokenId: 606, name: "Kush King",    imageUrl: "https://placehold.co/400x400/2d5016/a3d977?text=BudBear+%23606", breedCount: 0, lastBreedAt: null },
];

export interface MockBreedingRecord {
  id: string;
  parent1: string;
  parent2: string;
  resultCubName: string;
  bredAt: string;
}

export const MOCK_BREEDING_HISTORY: MockBreedingRecord[] = [
  { id: "br-1", parent1: "Papa Bear (#101)", parent2: "Mama Bear (#202)", resultCubName: "Blaze", bredAt: "2025-12-01T10:00:00Z" },
  { id: "br-2", parent1: "Smokey (#505)", parent2: "Grizzly OG (#303)", resultCubName: "Frost", bredAt: "2026-01-15T14:30:00Z" },
];

// Burn reward estimates by rarity
export const MOCK_BURN_REWARDS: Record<string, { tokens: number; traitChance: number }> = {
  COMMON:    { tokens: 50,   traitChance: 0.1 },
  UNCOMMON:  { tokens: 100,  traitChance: 0.2 },
  RARE:      { tokens: 250,  traitChance: 0.4 },
  EPIC:      { tokens: 500,  traitChance: 0.6 },
  LEGENDARY: { tokens: 1000, traitChance: 0.9 },
};

// Dashboard stats
export const MOCK_DASHBOARD_STATS = {
  totalCubs: 6,
  totalBudBears: 6,
  stakedCubs: 2,
  listedCubs: 1,
  totalBred: 2,
};
