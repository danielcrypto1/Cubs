"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { MarketplaceGrid } from "@/components/marketplace/marketplace-grid";
import { MarketplaceSearch } from "@/components/marketplace/marketplace-search";
import { BuyModal } from "@/components/marketplace/buy-modal";
import { SellModal } from "@/components/marketplace/sell-modal";
import { useMarketplace, type ExtendedFilters } from "@/hooks/use-marketplace";
import { MOCK_COLLECTION_STATS, MOCK_LISTINGS } from "@/lib/mock-data";
import type { MockListing } from "@/lib/mock-data";

const FEATURED_IDS = ["l2", "l21", "l17"];

export default function MarketplacePage() {
  const [filters, setFilters] = useState<ExtendedFilters>({ sortBy: "newest", page: 1, limit: 18 });
  const [search, setSearch] = useState("");
  const [buyTarget, setBuyTarget] = useState<MockListing | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { data, loading, removeListing, addListing } = useMarketplace({ ...filters, search });
  const featured = MOCK_LISTINGS.filter((l) => FEATURED_IDS.includes(l.id));

  const handleBuy = useCallback((listing: MockListing) => { setBuyTarget(listing); setBuyOpen(true); }, []);
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
  const handleSellSuccess = useCallback((listing: MockListing) => { addListing(listing); }, [addListing]);

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative -mt-8 mb-12 overflow-hidden border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">The marketplace</p>
            <h1 className="font-display uppercase leading-[0.9] tracking-[-0.03em] text-[clamp(3rem,8vw,6rem)]">
              <span className="block text-foreground">Explore</span>
              <span className="block text-primary">the den.</span>
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground">
              Buy, sell, and bid on Cubs, traits, and crates. Floor, volume,
              activity — all on chain.
            </p>
          </div>
          <SellModal onSuccess={handleSellSuccess} />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {/* Stats row */}
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Floor", value: `${MOCK_COLLECTION_STATS.floorPrice} ETH` },
            { label: "Volume", value: `${MOCK_COLLECTION_STATS.totalVolume} ETH` },
            { label: "Listed", value: MOCK_COLLECTION_STATS.totalListed.toString() },
            { label: "Owners", value: MOCK_COLLECTION_STATS.uniqueOwners.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-display text-2xl text-primary">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Featured row */}
        <div className="mb-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-3xl uppercase">Featured</h2>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Hot picks</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ y: -4 }}
                onClick={() => handleBuy(item)}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card text-left"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={item.imageUrl} alt={item.name} fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-display text-lg uppercase">{item.name}</p>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.rarity}</p>
                  </div>
                  <p className="font-display text-xl text-primary">{item.price} ETH</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Search + filters */}
        <MarketplaceSearch value={search} onChange={setSearch} />
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

        {/* Grid (rows of 3) */}
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
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
              disabled={data.page <= 1}
              className="rounded-full border border-border px-5 py-2 text-xs uppercase tracking-widest transition hover:border-primary disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Page {data.page} / {data.pages}
            </span>
            <button
              onClick={() => setFilters((f) => ({ ...f, page: Math.min(data.pages, (f.page ?? 1) + 1) }))}
              disabled={data.page >= data.pages}
              className="rounded-full border border-border px-5 py-2 text-xs uppercase tracking-widest transition hover:border-primary disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <BuyModal listing={buyTarget} open={buyOpen} onOpenChange={setBuyOpen} onConfirm={handleConfirmBuy} loading={actionLoading} />
    </div>
  );
}
