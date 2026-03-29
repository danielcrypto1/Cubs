"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FloatingBackground } from "@/components/shared/floating-background";
import { LiveStatsBar } from "@/components/shared/live-stats-bar";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { QuickActions } from "@/components/shared/quick-actions";
import {
  staggerContainer,
  staggerItem,
  hoverLiftGlow,
  sectionReveal,
} from "@/lib/animations";
import { MOCK_CUBS, MOCK_CRATES, MOCK_LISTINGS } from "@/lib/mock-data";
import { ArrowRight, Globe, Package, Sparkles, Zap } from "lucide-react";

const RARITY_VARIANTS: Record<string, "common" | "uncommon" | "rare" | "epic" | "legendary"> = {
  COMMON: "common", UNCOMMON: "uncommon", RARE: "rare", EPIC: "epic", LEGENDARY: "legendary",
};

const RARITY_GLOW: Record<string, string> = {
  COMMON: "shadow-zinc-400/20",
  UNCOMMON: "shadow-green-400/20",
  RARE: "shadow-blue-400/30",
  EPIC: "shadow-purple-400/30",
  LEGENDARY: "shadow-amber-400/40",
};

export default function HomePage() {
  return (
    <div className="-mt-24 space-y-0">
      <FloatingBackground />

      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-24">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/scenes/homepage-hero.png"
            alt=""
            fill
            unoptimized
            className="object-cover"
            aria-hidden="true"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col items-center gap-8 py-8 text-center lg:flex-row lg:gap-16 lg:text-left">
            {/* Animated Cub hero */}
            <motion.div
              className="relative aspect-square w-64 shrink-0 lg:w-80"
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-cubs-gold/20 to-cubs-purple/20 blur-2xl" />
              <div className="relative h-full overflow-hidden rounded-3xl border-2 border-white/20 bg-white/10 backdrop-blur-sm">
                <Image
                  src="https://placehold.co/400x400/1a1a2e/f59e0b?text=CUBS"
                  alt="CUBS Hero"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Floating particles around the cub */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full bg-cubs-gold"
                  style={{
                    top: `${20 + i * 20}%`,
                    left: i % 2 === 0 ? "-8px" : "calc(100% + 4px)",
                  }}
                  animate={{
                    y: [0, -12, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                />
              ))}
            </motion.div>

            {/* Hero text */}
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Badge variant="outline" className="mb-4 border-cubs-gold/30 bg-cubs-gold/10 text-cubs-gold">
                  <Sparkles className="mr-1 h-3 w-3" /> Season 1 Live
                </Badge>
              </motion.div>

              <motion.h1
                className="text-hero sm:text-7xl text-white drop-shadow-lg"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
              >
                {["Collect.", "Customize."].map((word) => (
                  <motion.span
                    key={word}
                    className="mr-[0.3em] inline-block"
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                  >
                    {word}
                  </motion.span>
                ))}
                <motion.span
                  className="cubs-gradient-text inline-block"
                  variants={{ hidden: { opacity: 0, y: 20, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } } }}
                >
                  Dominate.
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-lg text-white/80"
              >
                Build your pack. Forge legendary traits. Deploy Cub Agents to earn PAWS.
                The ultimate NFT ecosystem on Ethereum.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 8px oklch(0.82 0.17 80 / 0.15)",
                      "0 0 28px oklch(0.82 0.17 80 / 0.3)",
                      "0 0 8px oklch(0.82 0.17 80 / 0.15)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="rounded-lg"
                >
                  <Button size="lg" asChild>
                    <Link href="/mint">
                      <Zap className="mr-2 h-4 w-4" /> Mint a Cub
                    </Link>
                  </Button>
                </motion.div>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/marketplace">
                    Explore Marketplace <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Live stats bar */}
          <div className="mt-8">
            <LiveStatsBar />
          </div>
        </div>
      </section>

      {/* ═══ QUICK ACTIONS ══════════════════════════════════ */}
      <section className="relative z-10 -mt-8">
        <div className="mx-auto max-w-3xl px-4">
          <QuickActions />
        </div>
      </section>

      {/* ═══ FEATURED CRATES ════════════════════════════════ */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionReveal}
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-cubs-purple" />
                <h2 className="text-section">Featured Crates</h2>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/crates">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {MOCK_CRATES.map((crate) => (
                <motion.div key={crate.id} variants={staggerItem}>
                  <Link href="/crates">
                    <Card className="group overflow-hidden cubs-card-hover border-white/10 bg-white/5 backdrop-blur-sm">
                      <div className="relative aspect-square">
                        <Image src={crate.imageUrl} alt={crate.name} fill unoptimized className="object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <Badge
                          variant={RARITY_VARIANTS[crate.rarity] ?? "common"}
                          className="absolute right-2 top-2"
                        >
                          {crate.rarity}
                        </Badge>
                        <div className="absolute bottom-3 left-3">
                          <p className="text-sm font-bold text-white">{crate.name}</p>
                          <p className="text-xs text-white/70">{crate.quantity} available</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURED CUBS + ACTIVITY FEED ══════════════════ */}
      <section className="relative py-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/scenes/homepage-transition.png"
            alt=""
            fill
            unoptimized
            className="object-cover opacity-40"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Featured Cubs — 2/3 width */}
            <div className="lg:col-span-2">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionReveal}
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-cubs-gold" />
                    <h2 className="text-section">Featured Cubs</h2>
                  </div>
                  <Button variant="ghost" asChild>
                    <Link href="/my-cubs">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {MOCK_CUBS.slice(0, 6).map((cub) => (
                    <motion.div key={cub.id} variants={staggerItem} {...hoverLiftGlow}>
                      <Card className="group overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
                        <div className="relative aspect-square cubs-image-zoom">
                          <Image src={cub.imageUrl} alt={cub.name} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-bold">{cub.name}</p>
                            <Badge variant="outline" className="text-[10px]">#{cub.tokenId}</Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {cub.traits.slice(0, 2).map((t) => (
                              <Badge
                                key={t.value}
                                variant={RARITY_VARIANTS[t.rarity] ?? "common"}
                                className="text-[10px]"
                              >
                                {t.value}
                              </Badge>
                            ))}
                            {cub.traits.length > 2 && (
                              <Badge variant="secondary" className="text-[10px]">
                                +{cub.traits.length - 2}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* Activity Feed — 1/3 width */}
            <div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionReveal}
              >
                <div className="mb-8 flex items-center gap-3">
                  <div className="relative">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                    <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-green-400" />
                  </div>
                  <h2 className="text-section text-xl">Live Activity</h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <ActivityFeed maxItems={8} compact />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WORLD MAP PREVIEW ══════════════════════════════ */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionReveal}
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-cubs-sky" />
                <h2 className="text-section">World Map</h2>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/map">Explore Map <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>

            <Link href="/map">
              <Card className="group relative overflow-hidden cubs-card-hover border-white/10 bg-white/5">
                <div className="relative aspect-[21/9] w-full">
                  <Image
                    src="https://placehold.co/1920x823/1a1a2e/334155?text=CUBS+World+Map"
                    alt="CUBS World Map"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Location dots */}
                  {[
                    { x: "20%", y: "40%", name: "Cub Town", color: "bg-cubs-gold" },
                    { x: "45%", y: "30%", name: "Trait Bazaar", color: "bg-cubs-pink" },
                    { x: "70%", y: "50%", name: "Crate Cavern", color: "bg-cubs-purple" },
                    { x: "85%", y: "35%", name: "PAWS Bank", color: "bg-cubs-green" },
                  ].map((loc) => (
                    <motion.div
                      key={loc.name}
                      className="absolute"
                      style={{ left: loc.x, top: loc.y }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                    >
                      <div className={`h-3 w-3 rounded-full ${loc.color} shadow-lg`} />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {loc.name}
                      </span>
                    </motion.div>
                  ))}

                  <div className="absolute bottom-6 left-6">
                    <p className="text-xl font-display text-white">Explore the CUBS World</p>
                    <p className="text-sm text-white/70">4 locations with quests, rewards, and hidden treasures</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ════════════════════════════════════════════ */}
      <section className="py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-section">Ready to Start?</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Mint your first Cub, deploy Cub Agents, or dive into the world map.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/mint">Mint a Cub</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/forge">Open Cub Forge</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
