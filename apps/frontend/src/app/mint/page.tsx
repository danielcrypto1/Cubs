"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { FloatingBackground } from "@/components/shared/floating-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Info, Heart, Clock } from "lucide-react";

const TOTAL_SUPPLY = 10000;

export default function MintPage() {
  const [quantity, setQuantity] = useState(1);
  const price = 0.05;

  return (
    <div className="relative min-h-screen">
      <FloatingBackground count={6} />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <PageHeader
          title="Mint Cubs"
          description="Mint your unique Cubs NFT with randomized traits from 8 categories."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Mint Info + Phases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Mint Phases */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mint Phases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { phase: "GTD Spots", desc: "Guaranteed whitelist holders", status: "upcoming", spots: "500" },
                  { phase: "FCFS Spots", desc: "First come, first served", status: "upcoming", spots: "1,500" },
                  { phase: "Public Mint", desc: "Open to everyone", status: "upcoming", spots: "8,000" },
                ].map((p) => (
                  <div key={p.phase} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div>
                      <p className="font-semibold">{p.phase}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{p.spots} spots</span>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        Soon
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Supply */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground">Total Supply</span>
                  <span className="text-xl font-bold">{TOTAL_SUPPLY.toLocaleString()}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">0 / {TOTAL_SUPPLY.toLocaleString()} minted</p>
              </CardContent>
            </Card>

            {/* Breed CTA */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-center gap-4 p-6">
                <motion.div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500/10"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="h-6 w-6 text-pink-400" />
                </motion.div>
                <div className="flex-1">
                  <p className="font-semibold">Mint via Breeding</p>
                  <p className="text-xs text-muted-foreground">
                    Breed two Bud Bears to create a unique Cub with inherited traits.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">Breed</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Mint Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Mint a Cub</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Each Cub is uniquely generated with randomized traits from 8 categories
                  including Background, Body, Outfit, Hat, Eyes, Accessories, Mouth, and Shoes.
                  Rarer trait combinations make your Cub more valuable in the ecosystem.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price per Cub</span>
                  <span className="text-xl font-bold text-primary">{price} ETH</span>
                </div>

                {/* Quantity selector */}
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      -
                    </Button>
                    <span className="w-12 text-center text-xl font-bold">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(5, quantity + 1))}>
                      +
                    </Button>
                    <div className="flex gap-1">
                      {[1, 3, 5].map((q) => (
                        <Button key={q} variant={quantity === q ? "default" : "secondary"} size="sm" onClick={() => setQuantity(q)}>
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between rounded-xl bg-muted p-4">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold text-primary">{(price * quantity).toFixed(2)} ETH</span>
                </div>

                {/* Mint button */}
                <Button className="w-full" size="lg" disabled>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Mint {quantity} Cub{quantity > 1 ? "s" : ""} — Coming Soon
                </Button>
              </CardContent>
            </Card>

            {/* Info card */}
            <Card className="border-dashed">
              <CardContent className="flex items-start gap-3 p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-cubs-sky" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">How minting works</p>
                  <p className="mt-1">
                    Each Cub receives random traits from 8 categories. Rarer traits have lower drop rates.
                    After minting, visit the Cub Forge to swap traits, change your cub&apos;s look, and increase rarity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
