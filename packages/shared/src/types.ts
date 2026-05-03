// ─── Core Enums ─────────────────────────────────────────

export type Role = "USER" | "ADMIN";

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

export type CubRarity = TraitRarity;

export type TraitAcquisition = "MINT" | "MARKETPLACE" | "CRATE" | "REWARD";

export type AssetType = "CUB" | "TRAIT" | "CRATE";

export type ListingStatus = "ACTIVE" | "SOLD" | "CANCELLED";

export type BoostType = "NONE" | "PAWS_MULTIPLIER" | "PAWS_FLAT" | "LUCK";

export type CrateType = "STANDARD" | "PREMIUM" | "GENESIS" | "EVENT";

export type PriceType = "PAWS" | "ETH" | "USDT";

export type PawsReason =
  | "DAILY_CLAIM"
  | "STAKING_REWARD"
  | "CRATE_PURCHASE"
  | "CRATE_REFUND"
  | "MARKETPLACE_BUY"
  | "MARKETPLACE_SELL"
  | "MARKETPLACE_FEE"
  | "TRAIT_BURN"
  | "TRAIT_BURN_FEE"
  | "ACHIEVEMENT"
  | "EVENT_REWARD"
  | "GAME_REWARD"
  | "ADMIN_GRANT"
  | "ADMIN_DEDUCT"
  | "CRATE_REWARD";

export type RewardType = "TRAIT" | "PAWS" | "CUB" | "NFT";

export type QueueJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

// ─── Transaction Intents ───────────────────────────────

export type IntentType = "CRATE_OPEN" | "CRATE_PURCHASE" | "STAKING_CLAIM" | "MARKETPLACE_BUY" | "MARKETPLACE_OFFER_ACCEPT" | "MARKETPLACE_TRADE_ACCEPT" | "FORGE_SAVE";

export type OfferStatus = "ACTIVE" | "ACCEPTED" | "CANCELLED" | "EXPIRED";

export type TradeStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";

export type IntentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface TransactionIntent {
  id: string;
  userId: string;
  type: IntentType;
  status: IntentStatus;
  referenceId: string | null;
  result: Record<string, unknown> | null;
  error: string | null;
  expiresAt: string;
  createdAt: string;
  completedAt: string | null;
}

// ─── Crate Open Stats (pity tracking) ──────────────────

export interface CrateOpenStats {
  id: string;
  userId: string;
  crateDefinitionId: string;
  totalOpens: number;
  opensSinceLastHighRarity: number;
}

export type BadgeCategory = "COLLECTOR" | "TRADER" | "SOCIAL" | "EVENT" | "MILESTONE";

// ─── User ───────────────────────────────────────────────

export interface User {
  id: string;
  walletAddress: string;
  discordId: string | null;
  discordUsername: string | null;
  role: Role;
  displayName: string | null;
  avatarUrl: string | null;
  linkedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Cubs ───────────────────────────────────────────────

export interface Cub {
  id: string;
  tokenId: number;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  metadataUri: string | null;
  rarity: CubRarity;
  rarityScore: number;
  version: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  /** @deprecated Use equippedTraits instead */
  traits?: Trait[];
  equippedTraits?: CubEquippedTrait[];
  versions?: CubVersion[];
}

// Legacy trait — traitType/traitValue string pairs on cubs.
// New code should use CubEquippedTrait instead.
export interface Trait {
  id: string;
  cubId: string;
  traitType: string;
  traitValue: string;
  displayOrder: number;
}

// ─── Cub Composition System ────────────────────────────

export interface CubEquippedTrait {
  id: string;
  cubId: string;
  slotCategory: TraitCategory;
  traitDefinitionId: string;
  equippedAt: string;
  traitDefinition?: TraitDefinition;
}

export interface CubVersion {
  id: string;
  cubId: string;
  version: number;
  imageUrl: string;
  metadataUri: string;
  traitSnapshot: CubVersionTraitEntry[];
  rarityScore: number;
  createdAt: string;
}

export interface CubVersionTraitEntry {
  slotCategory: TraitCategory;
  traitDefinitionId: string;
  name: string;
  imageUrl: string;
}

// ─── Trait Definitions ──────────────────────────────────

export interface TraitDefinition {
  id: string;
  name: string;
  category: TraitCategory;
  layer: number;
  rarity: TraitRarity;
  rarityWeight: number;
  maxSupply: number;
  currentSupply: number;
  imageUrl: string;
  boostType: BoostType;
  boostValue: number;
  isFullBody: boolean;
  isActive: boolean;
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

// ─── Crate Definitions ──────────────────────────────────

export interface CrateDefinition {
  id: string;
  name: string;
  type: CrateType;
  rarity: TraitRarity;
  description: string | null;
  imageUrl: string;
  priceType: PriceType;
  priceAmount: string;
  maxSupply: number | null;
  currentSupply: number;
  activeFrom: string | null;
  activeUntil: string | null;
  isBase: boolean;
  dropId: string | null;
  isActive: boolean;
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
  traitDefinitionId: string | null;
  traitRarity: TraitRarity | null;
  probability: number;
  traitDefinition?: TraitDefinition;
}

export interface CrateOpenResult {
  success: boolean;
  reward: CrateRewardResult;
  remainingCrates: number;
}

export interface CrateRewardResult {
  rewardType: RewardType;
  // TRAIT reward
  traitDefinitionId?: string;
  traitDefinition?: TraitDefinition;
  rarity?: TraitRarity;
  // PAWS reward
  pawsAmount?: number;
  // CUB reward
  cubId?: string;
  cubRarity?: CubRarity;
  // NFT reward (future)
  contractAddress?: string;
  tokenId?: string;
}

// ─── Crate Rewards (polymorphic) ────────────────────────

export interface CrateReward {
  id: string;
  crateDefinitionId: string;
  rewardType: RewardType;
  weight: number;
  // TRAIT
  traitDefinitionId: string | null;
  traitRarity: TraitRarity | null;
  // PAWS
  pawsAmount: number | null;
  pawsMin: number | null;
  pawsMax: number | null;
  // CUB
  cubId: string | null;
  cubRarity: CubRarity | null;
  // NFT
  contractAddress: string | null;
  tokenId: string | null;
  nftMetadata: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  traitDefinition?: TraitDefinition;
}

// ─── Marketplace ────────────────────────────────────────

export interface MarketplaceListing {
  id: string;
  assetType: AssetType;
  cubId: string | null;
  traitDefinitionId: string | null;
  crateDefinitionId: string | null;
  quantity: number;
  sellerId: string;
  buyerId: string | null;
  priceType: PriceType;
  priceAmount: string;
  status: ListingStatus;
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
  priceType: PriceType;
  priceAmount: string;
  platformFee: string;
  royaltyFee: string;
  pawsBurned: string;
  txHash: string | null;
  completedAt: string;
}

export interface MarketplaceFilters {
  assetType?: AssetType;
  rarity?: TraitRarity;
  priceType?: PriceType;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest";
  page?: number;
  limit?: number;
}

// ─── Marketplace Offers ─────────────────────────────────

export interface MarketplaceOffer {
  id: string;
  listingId: string | null;
  assetType: AssetType;
  cubId: string | null;
  traitDefinitionId: string | null;
  crateDefinitionId: string | null;
  quantity: number;
  buyerId: string;
  priceType: PriceType;
  priceAmount: string;
  status: OfferStatus;
  expiresAt: string | null;
  createdAt: string;
  acceptedAt: string | null;
  cancelledAt: string | null;
  buyer?: Pick<User, "walletAddress" | "displayName">;
}

// ─── Marketplace Trades ─────────────────────────────────

export interface TradeAssetEntry {
  type: AssetType;
  id: string;
  quantity: number;
  name?: string;
  imageUrl?: string;
  rarity?: TraitRarity;
}

export interface MarketplaceTrade {
  id: string;
  proposerId: string;
  receiverId: string;
  offeredAssets: TradeAssetEntry[];
  requestedAssets: TradeAssetEntry[];
  status: TradeStatus;
  createdAt: string;
  respondedAt: string | null;
  proposer?: Pick<User, "walletAddress" | "displayName">;
  receiver?: Pick<User, "walletAddress" | "displayName">;
}

// ─── Staking (passive PAWS generation) ──────────────────

export interface StakingPosition {
  id: string;
  cubId: string;
  userId: string;
  lastClaimedAt: string;
  isActive: boolean;
  rateSnapshot: number;
  flatBonusSnapshot: number;
  snapshotAt: string;
  createdAt: string;
}

export interface StakingAccrual {
  cubId: string;
  tokenId: number;
  cubName: string | null;
  rarity: CubRarity;
  baseRate: number;
  rarityMultiplier: number;
  traitMultiplier: number;
  traitFlat: number;
  pawsPerDay: number;
  hoursAccrued: number;
  accruedPaws: number;
}

export interface StakingClaimResult {
  totalClaimed: number;
  newBalance: number;
  perCub: StakingAccrual[];
}

// ─── PAWS Economy (ledger-based) ────────────────────────

export interface PawsTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: PawsReason;
  referenceId: string | null;
  note: string | null;
  createdAt: string;
}

export interface PawsBalanceResult {
  balance: number;
}

export interface PawsOperationResult {
  transactionId: string;
  newBalance: number;
  amount: number;
  reason: PawsReason;
}

// ─── Badges / Achievements ──────────────────────────────

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: BadgeCategory;
  requirementType: string;
  requirementValue: number;
  pawsReward: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: string;
  badge?: Badge;
}

// ─── Economy Config (versioned) ─────────────────────────

export interface RarityMultipliers {
  COMMON: number;
  UNCOMMON: number;
  RARE: number;
  EPIC: number;
  LEGENDARY: number;
}

export interface EconomyConfig {
  id: number;
  version: number;
  basePawsRate: number;
  rarityMultipliers: RarityMultipliers;
  marketplaceFeeBps: number;
  marketplaceRoyaltyBps: number;
  pawsTradeBurnPct: number;
  traitBurnReturnMin: number;
  traitBurnReturnMax: number;
  dailyClaimAmount: number;
  dailyClaimCooldownHrs: number;
  updatedAt: string;
  updatedBy: string | null;
}

// ─── Audit Log ──────────────────────────────────────────

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  changes: { before?: Record<string, unknown>; after?: Record<string, unknown> };
  ipAddress: string | null;
  createdAt: string;
}

// ─── Auth ───────────────────────────────────────────────

export interface AuthSession {
  address: string;
  chainId: number;
}

export type AuthSource = "website" | "discord";

export interface ResolvedUser {
  userId: string;
  walletAddress: string;
  source: AuthSource;
}

export interface LinkRequest {
  discordId: string;
  discordUsername: string;
  linkCode: string;
  expiresAt: string;
  linkUrl: string;
}

// ─── Editor ─────────────────────────────────────────────

export type EditorMode = "pfp" | "banner";

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
  version: number;
  imageUrl: string;
  metadataUri: string;
}

// ─── Media Kit Editor ───────────────────────────────────

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

// ─── Dashboard: Breed, Burn, Bridge ─────────────────────

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

// ─── Queue Jobs ─────────────────────────────────────────

export interface RenderJobData {
  cubId: string;
  version: number;
  layers: Array<{ slotCategory: TraitCategory; traitDefinitionId: string; imageUrl: string }>;
  requestedBy: string;
}

export interface RenderJobResult {
  cubId: string;
  version: number;
  imageUrl: string;
  metadataUri: string;
}

export interface CrateJobData {
  userId: string;
  walletAddress: string;
  crateDefinitionId: string;
  crateOpenId: string;
}

export interface CrateJobResult {
  crateOpenId: string;
  reward: CrateRewardResult;
  remainingCrates: number;
}

// ─── Economy Events ────────────────────────────────────

export type EconomyEventType =
  | "crate_opened"
  | "crate_purchased"
  | "paws_spent"
  | "paws_earned"
  | "staking_claimed"
  | "marketplace_sold"
  | "listing_created"
  | "offer_created"
  | "offer_accepted"
  | "trade_created"
  | "trade_completed"
  | "pity_triggered"
  | "cub_forged"
  | "trait_burned"
  | "rarity_updated"
  | "render_requested"
  | "render_completed"
  | "drop_created"
  | "drop_activated"
  | "crate_created"
  | "trait_created"
  | "economy_updated";

export interface EconomyEvent {
  type: EconomyEventType;
  userId: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// ─── Forge System ──────────────────────────────────────

export interface ForgeChange {
  slot: TraitCategory;
  traitDefinitionId: string | null; // null = unequip slot
}

export interface ForgePreviewResult {
  cubId: string;
  composedTraits: CubVersionTraitEntry[];
  rarityScore: number;
  rankEstimate: number;
  onsieConflicts: TraitCategory[]; // slots that will be auto-cleared by onsie rule
}

export interface ForgeApplyResult {
  cubId: string;
  version: number;
  imageUrl: string;
  metadataUri: string;
  rarityScore: number;
  traitsBurned: Array<{ traitDefinitionId: string; name: string; slot: TraitCategory }>;
}

export interface RarityScoreResult {
  score: number;
  rank: number;
  totalCubs: number;
}

// ─── Drop System ──────────────────────────────────────

export type DropStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "ENDED";

export interface Drop {
  id: string;
  name: string;
  description: string | null;
  bannerImage: string | null;
  themeColor: string | null;
  status: DropStatus;
  startTime: string | null;
  endTime: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  crates?: CrateDefinition[];
}

export interface DropDetail extends Drop {
  crates: CrateDefinition[];
  traitDefinitions: TraitDefinition[];
}

// ─── Admin Types ──────────────────────────────────────

export interface AdminStats {
  totalPawsEarned: number;
  totalPawsSpent: number;
  cratesOpened: number;
  traitsMinted: number;
  activeUsers: number;
  totalCubs: number;
}

export interface AdminDailyStats {
  date: string;
  totalPawsEarned: number;
  totalPawsSpent: number;
  cratesOpened: number;
  traitsMinted: number;
}

// ─── API Response Envelope ──────────────────────────────

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
  message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Loot Table Validation ──────────────────────────────

export interface LootTableValidation {
  valid: boolean;
  totalWeight: number;
  entryCount: number;
  errors: string[];
  warnings: string[];
}
