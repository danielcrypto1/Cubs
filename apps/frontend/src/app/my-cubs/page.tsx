"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { staggerContainer, staggerItem, hoverBounce } from "@/lib/animations";
import { MOCK_CUBS } from "@/lib/mock-data";
import { Paintbrush, ShoppingBag, Coins } from "lucide-react";

const RARITY_VARIANTS: Record<string, "common" | "uncommon" | "rare" | "epic" | "legendary"> = {
  COMMON: "common", UNCOMMON: "uncommon", RARE: "rare", EPIC: "epic", LEGENDARY: "legendary",
};

export default function MyCubsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <PageHeader title="My Cubs" description="View and manage your Cubs collection" />

      {/* Stats bar */}
      <div className="mb-8 flex flex-wrap gap-4">
        <div className="rounded-xl bg-muted px-4 py-2 text-sm">
          <span className="text-muted-foreground">Cubs: </span>
          <span className="font-bold">{MOCK_CUBS.length}</span>
        </div>
        <div className="rounded-xl bg-muted px-4 py-2 text-sm">
          <span className="text-muted-foreground">Staked: </span>
          <span className="font-bold text-cubs-green">2</span>
        </div>
        <div className="rounded-xl bg-muted px-4 py-2 text-sm">
          <span className="text-muted-foreground">Listed: </span>
          <span className="font-bold text-cubs-sky">1</span>
        </div>
      </div>

      {/* Grid */}
      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {MOCK_CUBS.map((cub) => (
          <motion.div key={cub.id} variants={staggerItem} {...hoverBounce}>
            <Card className="overflow-hidden cubs-card-hover">
              <div className="relative aspect-square">
                <Image src={cub.imageUrl} alt={cub.name} fill className="object-cover" />
              </div>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{cub.name}</CardTitle>
                  <Badge variant="outline">#{cub.tokenId}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 pt-0">
                {/* Traits */}
                <div className="flex flex-wrap gap-1">
                  {cub.traits.map((t) => (
                    <Badge key={t.value} variant={RARITY_VARIANTS[t.rarity] ?? "common"} className="text-xs">
                      {t.value}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href="/editor">
                      <Paintbrush className="mr-1 h-3.5 w-3.5" /> Edit
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <ShoppingBag className="mr-1 h-3.5 w-3.5" /> Sell
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Coins className="mr-1 h-3.5 w-3.5" /> Stake
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
