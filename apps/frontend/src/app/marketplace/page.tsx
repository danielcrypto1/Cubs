"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { PageHeader } from "@/components/shared/page-header";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { MarketplaceGrid } from "@/components/marketplace/marketplace-grid";
import { SellModal } from "@/components/marketplace/sell-modal";
import { Button } from "@/components/ui/button";
import { useMarketplace } from "@/hooks/use-marketplace";
import { useListingActions } from "@/hooks/use-listing-actions";
import type { AssetType, TraitRarity } from "@/types";

export default function MarketplacePage() {
  const { address } = useAccount();
  const [assetType, setAssetType] = useState<AssetType | undefined>(undefined);
  const [rarity, setRarity] = useState<TraitRarity | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "newest" | "oldest">("newest");
  const [page, setPage] = useState(1);

  const { data, loading, refetch } = useMarketplace({
    assetType,
    rarity,
    sortBy,
    page,
    limit: 20,
  });

  const { buyItem, cancelListing, loading: actionLoading } = useListingActions();

  const handleBuy = useCallback(
    async (listingId: string) => {
      try {
        await buyItem(listingId);
        refetch();
      } catch {
        // error handled by hook
      }
    },
    [buyItem, refetch],
  );

  const handleCancel = useCallback(
    async (listingId: string) => {
      try {
        await cancelListing(listingId);
        refetch();
      } catch {
        // error handled by hook
      }
    },
    [cancelListing, refetch],
  );

  const listings = data?.listings ?? [];
  const totalPages = data?.pages ?? 1;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <PageHeader
          title="Marketplace"
          description="Buy and sell Cubs, Traits, and Crates"
        />
        <SellModal walletAddress={address} onSuccess={refetch} />
      </div>

      <MarketplaceFilters
        assetType={assetType}
        rarity={rarity}
        sortBy={sortBy}
        onAssetTypeChange={(v) => { setAssetType(v); setPage(1); }}
        onRarityChange={(v) => { setRarity(v); setPage(1); }}
        onSortByChange={(v) => { setSortBy(v as typeof sortBy); setPage(1); }}
      />

      <MarketplaceGrid
        listings={listings}
        loading={loading}
        currentWallet={address}
        onBuy={handleBuy}
        onCancel={handleCancel}
        actionLoading={actionLoading}
      />

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
