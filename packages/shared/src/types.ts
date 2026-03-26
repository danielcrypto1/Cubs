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

// Phase 5: Media Kit Editor

export type EditorMode = "pfp" | "banner";

export type MediaKitLayerType =
  | "background"
  | "nft"
  | "overlay"
  | "text"
  | "image";

export interface GradientStop {
  color: string;
  position: number;
}

export interface GradientConfig {
  type: "linear" | "radial";
  angle: number;
  stops: GradientStop[];
}

export interface MediaKitLayer {
  id: string;
  type: MediaKitLayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  imageUrl?: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  gradient?: GradientConfig;
  pattern?: string;
  zIndex: number;
  visible: boolean;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  type: "solid" | "gradient" | "pattern";
  value: string;
  gradient?: GradientConfig;
  thumbnailUrl?: string;
}

export interface OverlayAsset {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  defaultWidth: number;
  defaultHeight: number;
}

export interface FontOption {
  family: string;
  label: string;
}

// Phase 9: NFT Dashboard — Breed, Burn, Bridge

export interface BudBear {
  id: string;
  tokenId: number;
  name: string;
  imageUrl: string;
  breedCount: number;
  lastBreedAt: string | null;
  ownerId: string;
}

export type BreedingStatus = "idle" | "selecting" | "confirming" | "breeding" | "complete";

export interface BreedingPair {
  id: string;
  parent1Id: string;
  parent2Id: string;
  status: BreedingStatus;
  startedAt: string;
  completesAt: string;
  resultCubId: string | null;
}

export interface BurnResult {
  cubId: string;
  rewardsEarned: {
    tokenAmount: number;
    traitDrops: TraitDefinition[];
  };
}

export type BridgeStatus = "idle" | "configured" | "confirming" | "bridging" | "complete" | "failed";

export interface BridgeChain {
  id: string;
  name: string;
  icon: string;
  chainId: number;
  status: "active" | "coming_soon";
  estimatedTime: string;
  estimatedGas: string;
}

export interface BridgeRequest {
  id: string;
  cubId: string;
  sourceChain: string;
  destChain: string;
  status: BridgeStatus;
  txHash: string | null;
  initiatedAt: string;
  completedAt: string | null;
}

export type DashboardTab = "collection" | "forge" | "breed" | "modify" | "mint-burn" | "bridge";
