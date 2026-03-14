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
  onAssetTypeChange: (value: AssetType | undefined) => void;
  onRarityChange: (value: TraitRarity | undefined) => void;
  onSortByChange: (value: string) => void;
}

export function MarketplaceFilters({
  assetType,
  rarity,
  sortBy,
  onAssetTypeChange,
  onRarityChange,
  onSortByChange,
}: MarketplaceFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="flex gap-2">
        <Select
          value={rarity ?? "ALL"}
          onValueChange={(v) => onRarityChange(v === "ALL" ? undefined : (v as TraitRarity))}
        >
          <SelectTrigger className="w-[140px]">
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

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[140px]">
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
  );
}
