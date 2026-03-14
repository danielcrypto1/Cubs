"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingCard } from "./listing-card";
import type { MarketplaceListing } from "@/types";

interface MarketplaceGridProps {
  listings: MarketplaceListing[];
  loading: boolean;
  currentWallet: string | undefined;
  onBuy: (listingId: string) => void;
  onCancel: (listingId: string) => void;
  actionLoading: boolean;
}

export function MarketplaceGrid({
  listings,
  loading,
  currentWallet,
  onBuy,
  onCancel,
  actionLoading,
}: MarketplaceGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        title="No Listings"
        description="There are no items listed for sale matching your filters."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isOwn={
            !!currentWallet &&
            listing.seller?.walletAddress?.toLowerCase() === currentWallet.toLowerCase()
          }
          onBuy={onBuy}
          onCancel={onCancel}
          buyLoading={actionLoading}
        />
      ))}
    </div>
  );
}
