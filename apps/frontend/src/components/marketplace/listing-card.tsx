"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "./price-display";
import { BuyButton } from "./buy-button";
import type { MarketplaceListing } from "@/types";

const RARITY_COLORS: Record<string, string> = {
  COMMON: "bg-zinc-600",
  UNCOMMON: "bg-green-600",
  RARE: "bg-blue-600",
  EPIC: "bg-purple-600",
  LEGENDARY: "bg-amber-500",
};

interface ListingCardProps {
  listing: MarketplaceListing;
  isOwn: boolean;
  onBuy: (listingId: string) => void;
  onCancel: (listingId: string) => void;
  buyLoading: boolean;
}

function getAssetInfo(listing: MarketplaceListing) {
  switch (listing.assetType) {
    case "CUB":
      return {
        name: listing.cub?.name || `Cub #${listing.cub?.tokenId}`,
        imageUrl: listing.cub?.imageUrl,
        rarity: null,
        badge: "Cub",
      };
    case "TRAIT":
      return {
        name: listing.traitDefinition?.name || "Trait",
        imageUrl: listing.traitDefinition?.imageUrl,
        rarity: listing.traitDefinition?.rarity,
        badge: listing.traitDefinition?.category || "Trait",
      };
    case "CRATE":
      return {
        name: listing.crateDefinition?.name || "Crate",
        imageUrl: listing.crateDefinition?.imageUrl,
        rarity: listing.crateDefinition?.rarity,
        badge: "Crate",
      };
  }
}

export function ListingCard({ listing, isOwn, onBuy, onCancel, buyLoading }: ListingCardProps) {
  const asset = getAssetInfo(listing);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden transition-colors hover:border-primary/50">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {asset.imageUrl ? (
            <Image
              src={asset.imageUrl}
              alt={asset.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {listing.quantity > 1 && (
            <Badge variant="secondary" className="absolute right-2 top-2">
              x{listing.quantity}
            </Badge>
          )}
        </div>
        <CardHeader className="p-3 pb-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-medium">{asset.name}</h3>
            <Badge variant="outline" className="shrink-0 text-xs">
              {asset.badge}
            </Badge>
          </div>
          {asset.rarity && (
            <Badge className={`${RARITY_COLORS[asset.rarity]} w-fit text-xs text-white`}>
              {asset.rarity}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="flex items-center justify-between p-3 pt-1">
          <PriceDisplay priceWei={listing.priceWei} className="text-sm" />
          {isOwn ? (
            <BuyButton
              label="Cancel"
              variant="outline"
              onConfirm={() => onCancel(listing.id)}
              confirmMessage="Cancel this listing?"
              loading={buyLoading}
            />
          ) : (
            <BuyButton
              label="Buy"
              variant="default"
              onConfirm={() => onBuy(listing.id)}
              confirmMessage={`Buy for ${listing.priceWei} Wei?`}
              loading={buyLoading}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
