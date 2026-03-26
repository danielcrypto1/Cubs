"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X as XIcon } from "lucide-react";
import { staggerItem, springBouncy } from "@/lib/animations";
import type { MockListing } from "@/lib/mock-data";

const RARITY_VARIANTS: Record<string, "common" | "uncommon" | "rare" | "epic" | "legendary"> = {
  COMMON: "common",
  UNCOMMON: "uncommon",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
};

const TYPE_LABELS: Record<string, string> = {
  CUB: "Cub",
  TRAIT: "Trait",
  CRATE: "Crate",
};

interface ListingCardProps {
  listing: MockListing;
  isOwn: boolean;
  onBuy: (listing: MockListing) => void;
  onCancel: (listingId: string) => void;
  actionLoading: boolean;
}

export function ListingCard({ listing, isOwn, onBuy, onCancel, actionLoading }: ListingCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, transition: springBouncy }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <Card className="overflow-hidden cubs-card-hover">
        <div className="relative aspect-square overflow-hidden bg-muted cubs-image-zoom">
          <Image
            src={listing.imageUrl}
            alt={listing.name}
            fill
            unoptimized
            className="object-cover"
          />
          <Badge variant="outline" className="absolute left-2 top-2 bg-background/80 text-[10px] backdrop-blur-sm">
            {TYPE_LABELS[listing.type] || listing.type}
          </Badge>
          {listing.quantity > 1 && (
            <Badge variant="secondary" className="absolute right-2 top-2 text-[10px]">
              x{listing.quantity}
            </Badge>
          )}
        </div>

        <CardHeader className="p-3 pb-1">
          <div className="flex items-start justify-between gap-1">
            <h3 className="truncate text-sm font-semibold">{listing.name}</h3>
            <Badge
              variant={RARITY_VARIANTS[listing.rarity] ?? "common"}
              className="shrink-0 text-[9px]"
            >
              {listing.rarity}
            </Badge>
          </div>
          {listing.category && (
            <span className="text-[10px] text-muted-foreground">{listing.category}</span>
          )}
        </CardHeader>

        <CardContent className="space-y-2 p-3 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-base font-bold">{listing.price}</span>
              <span className="ml-1 text-xs text-muted-foreground">ETH</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="truncate text-[10px] text-muted-foreground">
              {listing.seller}
            </span>
          </div>

          {isOwn ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={actionLoading}
              onClick={() => onCancel(listing.id)}
            >
              <XIcon className="mr-1.5 h-3.5 w-3.5" />
              Cancel Listing
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full"
              disabled={actionLoading}
              onClick={() => onBuy(listing)}
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              Buy Now
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
