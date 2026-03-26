"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, staggerItem, hoverBounce } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { MockCub, MockBudBear } from "@/lib/mock-data";

interface NftGridProps {
  cubs: MockCub[];
  budBears: MockBudBear[];
  filter: "all" | "cubs" | "budbears";
  onFilterChange: (f: "all" | "cubs" | "budbears") => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string, type: "cub" | "budbear") => void;
}

const FILTER_OPTIONS = [
  { value: "all" as const, label: "All" },
  { value: "cubs" as const, label: "Cubs" },
  { value: "budbears" as const, label: "Bud Bears" },
];

export function NftGrid({ cubs, budBears, filter, onFilterChange, selectable, selectedIds = [], onSelect }: NftGridProps) {
  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilterChange(opt.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {cubs.map((cub) => (
          <motion.div key={cub.id} variants={staggerItem} {...hoverBounce}>
            <NftCard
              id={cub.id}
              type="cub"
              name={cub.name}
              tokenId={cub.tokenId}
              imageUrl={cub.imageUrl}
              badge="CUB"
              badgeColor="text-cubs-gold"
              selectable={selectable}
              selected={selectedIds.includes(cub.id)}
              onSelect={onSelect}
            />
          </motion.div>
        ))}
        {budBears.map((bear) => (
          <motion.div key={bear.id} variants={staggerItem} {...hoverBounce}>
            <NftCard
              id={bear.id}
              type="budbear"
              name={bear.name}
              tokenId={bear.tokenId}
              imageUrl={bear.imageUrl}
              badge="BUD BEAR"
              badgeColor="text-cubs-green"
              subtitle={bear.breedCount > 0 ? `Bred ${bear.breedCount}x` : "Never bred"}
              selectable={selectable}
              selected={selectedIds.includes(bear.id)}
              onSelect={onSelect}
            />
          </motion.div>
        ))}
      </motion.div>

      {cubs.length === 0 && budBears.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-lg font-medium">No NFTs found</p>
          <p className="mt-1 text-sm">Connect your wallet to see your NFTs</p>
        </div>
      )}
    </div>
  );
}

interface NftCardProps {
  id: string;
  type: "cub" | "budbear";
  name: string;
  tokenId: number;
  imageUrl: string;
  badge: string;
  badgeColor: string;
  subtitle?: string;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, type: "cub" | "budbear") => void;
}

function NftCard({ id, type, name, tokenId, imageUrl, badge, badgeColor, subtitle, selectable, selected, onSelect }: NftCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden cubs-card-hover cursor-pointer",
        selected && "ring-2 ring-primary",
      )}
      onClick={() => selectable && onSelect?.(id, type)}
    >
      <div className="relative aspect-square cubs-image-zoom bg-muted">
        <Image src={imageUrl} alt={name} fill unoptimized className="object-cover" />
        <Badge variant="outline" className={cn("absolute right-2 top-2 bg-background/80 text-[10px] backdrop-blur-sm", badgeColor)}>
          {badge}
        </Badge>
        {selectable && selected && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Check className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{name}</CardTitle>
          <Badge variant="outline" className="text-[10px]">#{tokenId}</Badge>
        </div>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </CardHeader>
    </Card>
  );
}
