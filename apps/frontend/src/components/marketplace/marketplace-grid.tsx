"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingCard } from "./listing-card";
import { staggerContainer } from "@/lib/animations";
import type { MockListing } from "@/lib/mock-data";

interface MarketplaceGridProps {
  listings: MockListing[];
  loading: boolean;
  currentWallet: string | undefined;
  onBuy: (listing: MockListing) => void;
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        title="No Listings Found"
        description="There are no items matching your filters. Try adjusting your search or filters."
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
    >
      <AnimatePresence mode="popLayout">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isOwn={!!currentWallet && listing.seller === currentWallet}
            onBuy={onBuy}
            onCancel={onCancel}
            actionLoading={actionLoading}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
