"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { FloatingBackground } from "@/components/shared/floating-background";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { MarketplaceGrid } from "@/components/marketplace/marketplace-grid";
import { MarketplaceSearch } from "@/components/marketplace/marketplace-search";
import { BuyModal } from "@/components/marketplace/buy-modal";
import { SellModal } from "@/components/marketplace/sell-modal";
import { useMarketplace, type ExtendedFilters } from "@/hooks/use-marketplace";
import type { MockListing } from "@/lib/mock-data";
import type { AssetType, TraitRarity } from "@/types";

export default function MarketplacePage() {
  const [filters, setFilters] = useState<ExtendedFilters>({
    sortBy: "newest",
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState("");
  const [buyTarget, setBuyTarget] = useState<MockListing | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { data, loading, removeListing, addListing } = useMarketplace({
    ...filters,
    search,
  });

  const handleBuy = useCallback((listing: MockListing) => {
    setBuyTarget(listing);
    setBuyOpen(true);
  }, []);

  const handleConfirmBuy = useCallback(async (listingId: string) => {
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    removeListing(listingId);
    setActionLoading(false);
  }, [removeListing]);

  const handleCancel = useCallback(async (listingId: string) => {
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    removeListing(listingId);
    setActionLoading(false);
  }, [removeListing]);

  const handleSellSuccess = useCallback((listing: MockListing) => {
    addListing(listing);
  }, [addListing]);

  return (
    <div className="relative min-h-screen">
      <FloatingBackground count={8} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            title="Marketplace"
            description="Buy, sell, and trade Cubs, traits, and crates"
          />
          <div className="flex items-center gap-3">
            <SellModal onSuccess={handleSellSuccess} />
          </div>
        </div>

        {/* Search */}
        <MarketplaceSearch
          value={search}
          onChange={setSearch}
        />

        {/* Filters */}
        <MarketplaceFilters
          assetType={filters.assetType}
          rarity={filters.rarity}
          sortBy={filters.sortBy ?? "newest"}
          minPrice={filters.minPrice ?? ""}
          maxPrice={filters.maxPrice ?? ""}
          category={filters.category ?? ""}
          onAssetTypeChange={(v) => setFilters((f) => ({ ...f, assetType: v, page: 1 }))}
          onRarityChange={(v) => setFilters((f) => ({ ...f, rarity: v, page: 1 }))}
          onSortByChange={(v) => setFilters((f) => ({ ...f, sortBy: v as ExtendedFilters["sortBy"], page: 1 }))}
          onMinPriceChange={(v) => setFilters((f) => ({ ...f, minPrice: v || undefined, page: 1 }))}
          onMaxPriceChange={(v) => setFilters((f) => ({ ...f, maxPrice: v || undefined, page: 1 }))}
          onCategoryChange={(v) => setFilters((f) => ({ ...f, category: v || undefined, page: 1 }))}
        />

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap items-center gap-6 rounded-xl border border-border/50 bg-card/50 px-5 py-3 backdrop-blur-sm"
        >
          <Stat label="Total Listings" value={data.total.toString()} />
          <Stat label="Page" value={`${data.page} / ${data.pages}`} />
        </motion.div>

        {/* Grid */}
        <MarketplaceGrid
          listings={data.listings}
          loading={loading}
          currentWallet="0xYOU...rWallet"
          onBuy={handleBuy}
          onCancel={handleCancel}
          actionLoading={actionLoading}
        />

        {/* Pagination */}
        {data.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
              disabled={data.page <= 1}
              className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-card disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
              const start = Math.max(1, Math.min(data.page - 2, data.pages - 4));
              const pageNum = start + i;
              if (pageNum > data.pages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setFilters((f) => ({ ...f, page: pageNum }))}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === data.page
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-card"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setFilters((f) => ({ ...f, page: Math.min(data.pages, (f.page ?? 1) + 1) }))}
              disabled={data.page >= data.pages}
              className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-card disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Buy modal */}
      <BuyModal
        listing={buyTarget}
        open={buyOpen}
        onOpenChange={setBuyOpen}
        onConfirm={handleConfirmBuy}
        loading={actionLoading}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="ml-2 font-mono text-sm font-semibold">{value}</span>
    </div>
  );
}
