export interface User {
  id: string;
  walletAddress: string;
  role: "USER" | "ADMIN";
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Cub {
  id: string;
  tokenId: number;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  metadataUri: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  traits?: Trait[];
}

export interface Trait {
  id: string;
  cubId: string;
  traitType: string;
  traitValue: string;
  displayOrder: number;
}

export type AssetType = "CUB" | "TRAIT" | "CRATE";

export interface MarketplaceListing {
  id: string;
  assetType: AssetType;
  cubId: string | null;
  traitDefinitionId: string | null;
  crateDefinitionId: string | null;
  quantity: number;
  sellerId: string;
  buyerId: string | null;
  priceWei: string;
  status: "ACTIVE" | "SOLD" | "CANCELLED";
  txHash: string | null;
  listedAt: string;
  soldAt: string | null;
  cancelledAt: string | null;
  cub?: Cub;
  traitDefinition?: TraitDefinition;
  crateDefinition?: CrateDefinition;
  seller?: Pick<User, "walletAddress" | "displayName">;
}

export interface MarketplaceSale {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  priceWei: string;
  platformFeeWei: string;
  royaltyFeeWei: string;
  txHash: string | null;
  completedAt: string;
}

export interface MarketplaceFilters {
  assetType?: AssetType;
  rarity?: TraitRarity;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest";
  page?: number;
  limit?: number;
}

export interface StakingPosition {
  id: string;
  cubId: string;
  userId: string;
  stakedAt: string;
  unstakedAt: string | null;
  rewardsClaimed: string;
  txHash: string | null;
  isActive: boolean;
}

export interface AuthSession {
  address: string;
  chainId: number;
}

// Phase 2: Trait System & Editor

export type TraitCategory =
  | "BACKGROUND"
  | "BODY"
  | "OUTFIT"
  | "SHOES"
  | "ACCESSORIES"
  | "HAT"
  | "EYES"
  | "MOUTH"
  | "SPECIAL";

export type TraitRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type TraitAcquisition = "MINT" | "MARKETPLACE" | "CRATE" | "REWARD";

export interface TraitDefinition {
  id: string;
  name: string;
  category: TraitCategory;
  rarity: TraitRarity;
  maxSupply: number;
  currentSupply: number;
  imageUrl: string;
  createdAt: string;
}

export interface UserTrait {
  id: string;
  walletAddress: string;
  traitDefinitionId: string;
  quantity: number;
  acquiredFrom: TraitAcquisition;
  acquiredAt: string;
  traitDefinition?: TraitDefinition;
}

export interface EditorLayerConfig {
  category: TraitCategory;
  traitDefinitionId: string | null;
  imageUrl: string | null;
  name: string | null;
}

export interface EditorCubState {
  cubId: string;
  tokenId: number;
  name: string | null;
  layers: EditorLayerConfig[];
}

export interface EditorSaveResult {
  cubId: string;
  imageUrl: string;
  metadataUri: string;
}

// Phase 3: Crate System & Loot Engine

export interface CrateDefinition {
  id: string;
  name: string;
  rarity: TraitRarity;
  description: string | null;
  imageUrl: string;
  createdAt: string;
}

export interface UserCrate {
  id: string;
  walletAddress: string;
  crateDefinitionId: string;
  quantity: number;
  acquiredAt: string;
  crateDefinition?: CrateDefinition;
}

export interface LootTableEntry {
  id: string;
  crateDefinitionId: string;
  traitRarity: TraitRarity;
  probability: number;
}

export interface CrateOpenResult {
  success: boolean;
  reward: {
    traitDefinition: TraitDefinition;
    rarity: TraitRarity;
  };
  remainingCrates: number;
}
