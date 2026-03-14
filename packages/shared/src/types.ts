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

export interface MarketplaceListing {
  id: string;
  cubId: string;
  sellerId: string;
  buyerId: string | null;
  priceWei: string;
  status: "ACTIVE" | "SOLD" | "CANCELLED";
  txHash: string | null;
  listedAt: string;
  soldAt: string | null;
  cancelledAt: string | null;
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
