"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssetType, TraitRarity } from "@/types";

interface MarketplaceFiltersProps {
  assetType: AssetType | undefined;
  rarity: TraitRarity | undefined;
  sortBy: string;
  minPrice: string;
  maxPrice: string;
  category: string;
  onAssetTypeChange: (value: AssetType | undefined) => void;
  onRarityChange: (value: TraitRarity | undefined) => void;
  onSortByChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const TRAIT_CATEGORIES = [
  "BACKGROUND", "BODY", "OUTFIT", "SHOES", "ACCESSORIES", "HAT", "EYES", "MOUTH", "SPECIAL",
];

export function MarketplaceFilters({
  assetType,
  rarity,
  sortBy,
  minPrice,
  maxPrice,
  category,
  onAssetTypeChange,
  onRarityChange,
  onSortByChange,
  onMinPriceChange,
  onMaxPriceChange,
  onCategoryChange,
}: MarketplaceFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Asset Type Tabs + Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={assetType ?? "ALL"}
          onValueChange={(v) => onAssetTypeChange(v === "ALL" ? undefined : (v as AssetType))}
        >
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="CUB">Cubs</TabsTrigger>
            <TabsTrigger value="TRAIT">Traits</TabsTrigger>
            <TabsTrigger value="CRATE">Crates</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          <Select
            value={rarity ?? "ALL"}
            onValueChange={(v) => onRarityChange(v === "ALL" ? undefined : (v as TraitRarity))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Rarities</SelectItem>
              <SelectItem value="COMMON">Common</SelectItem>
              <SelectItem value="UNCOMMON">Uncommon</SelectItem>
              <SelectItem value="RARE">Rare</SelectItem>
              <SelectItem value="EPIC">Epic</SelectItem>
              <SelectItem value="LEGENDARY">Legendary</SelectItem>
            </SelectContent>
          </Select>

          {assetType === "TRAIT" && (
            <Select
              value={category || "ALL"}
              onValueChange={(v) => onCategoryChange(v === "ALL" ? "" : v)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {TRAIT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price_asc">Price: Low</SelectItem>
              <SelectItem value="price_desc">Price: High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price Range */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Price:</span>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Min ETH"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          className="w-24 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary"
        />
        <span className="text-xs text-muted-foreground">—</span>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Max ETH"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          className="w-24 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary"
        />
      </div>
    </div>
  );
}
