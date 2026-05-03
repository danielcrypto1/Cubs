"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X as XIcon, Heart, Share2 } from "lucide-react";
import { staggerItem, springBouncy } from "@/lib/animations";
import type { MockListing } from "@/lib/mock-data";
import { useState } from "react";

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
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, transition: springBouncy }}
      whileTap={{ scale: 0.99 }}
      layout
      className="group relative overflow-hidden rounded-3xl border border-border bg-card cubs-card-hover"
    >
      <Link href={`/marketplace/${listing.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={listing.imageUrl}
            alt={listing.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            {TYPE_LABELS[listing.type] || listing.type}
          </span>

          <div className="absolute right-3 top-3 flex gap-2">
            <button
              onClick={(e) => { e.preventDefault(); setLiked((l) => !l); }}
              aria-label="Like"
              className="rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md transition hover:border-primary hover:text-primary"
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-primary text-primary" : ""}`} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); }}
              aria-label="Share"
              className="rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md transition hover:border-primary hover:text-primary"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display truncate text-lg uppercase tracking-tight">{listing.name}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{listing.rarity}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Price</p>
            <p className="font-display text-lg text-primary">{listing.price} ETH</p>
          </div>
        </div>

        <div className="mt-4">
          {isOwn ? (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onCancel(listing.id)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition hover:border-destructive hover:text-destructive disabled:opacity-50"
            >
              <XIcon className="h-3.5 w-3.5" />
              Cancel
            </button>
          ) : (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onBuy(listing)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Buy now
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
