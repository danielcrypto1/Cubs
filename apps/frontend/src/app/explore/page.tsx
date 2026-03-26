"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FloatingBackground } from "@/components/shared/floating-background";
import {
  staggerContainer,
  staggerItem,
  hoverLiftGlow,
} from "@/lib/animations";
import { MOCK_CUBS, MOCK_LISTINGS } from "@/lib/mock-data";
import {
  Paintbrush,
  ShoppingBag,
  Package,
  Coins,
  Trophy,
  Wallet,
  ArrowRight,
} from "lucide-react";

const features = [
  { title: "Mint Cubs", description: "Mint unique Cubs NFTs with randomized traits", href: "/mint", icon: Wallet, colour: "text-cubs-gold" },
  { title: "Cub Editor", description: "Customize and edit your Cubs with new traits", href: "/editor", icon: Paintbrush, colour: "text-cubs-pink" },
  { title: "Marketplace", description: "Buy and sell Cubs on the open marketplace", href: "/marketplace", icon: ShoppingBag, colour: "text-cubs-sky" },
  { title: "Crates", description: "Open crates to discover rare traits and items", href: "/crates", icon: Package, colour: "text-cubs-purple" },
  { title: "Staking", description: "Stake your Cubs to earn CUBS tokens", href: "/staking", icon: Coins, colour: "text-cubs-green" },
  { title: "Achievements", description: "Unlock achievements and earn rewards", href: "/achievements", icon: Trophy, colour: "text-cubs-orange" },
];

const RARITY_VARIANTS: Record<string, "common" | "uncommon" | "rare" | "epic" | "legendary"> = {
  COMMON: "common", UNCOMMON: "uncommon", RARE: "rare", EPIC: "epic", LEGENDARY: "legendary",
};

export default function HomePage() {
  return (
    <div className="-mt-24 space-y-0">
      <FloatingBackground />

      {/* ── Hero + Features ─────────────────────── */}
      <section className="relative overflow-hidden pt-24">
        {/* Sky background */}
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
          {/* No bottom fade — section 2 overlaps to handle transition */}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center gap-8 py-4 text-center lg:flex-row lg:gap-16 lg:py-12 lg:text-left">
          {/* Hero image with floating animation */}
          <motion.div
            className="relative aspect-square w-64 shrink-0 overflow-hidden rounded-3xl bg-white/20 backdrop-blur-sm border border-white/20 lg:w-80"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="https://placehold.co/400x400/1a1a2e/f59e0b?text=CUBS"
              alt="CUBS Hero"
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          <div className="max-w-xl rounded-3xl bg-black/30 p-8 backdrop-blur-sm">
            <motion.h1
              className="text-hero sm:text-7xl text-white drop-shadow-lg"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
            >
              {["Collect.", "Customize."].map((word) => (
                <motion.span
                  key={word}
                  className="mr-[0.3em] inline-block"
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
                >
                  {word}
                </motion.span>
              ))}
              <motion.span
                className="cubs-gradient-text inline-block"
                variants={{ hidden: { opacity: 0, y: 20, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } } }}
              >
                Trade.
              </motion.span>
            </motion.h1>
            <p className="mt-4 text-lg text-white/90">
              CUBS is the ultimate NFT ecosystem on Ethereum. Mint unique cartoon bears,
              customize them with rare traits, and trade on the marketplace.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <motion.div
                animate={{ boxShadow: ["0 0 8px oklch(0.82 0.17 80 / 0.15)", "0 0 24px oklch(0.82 0.17 80 / 0.25)", "0 0 8px oklch(0.82 0.17 80 / 0.15)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-lg"
              >
                <Button size="lg" asChild>
                  <Link href="/mint">Mint a Cub</Link>
                </Button>
              </motion.div>
              <Button size="lg" variant="outline" asChild>
                <Link href="/marketplace">
                  Explore Marketplace <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features grid within the playground scene */}
        <motion.div
          className="mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <h2 className="text-section mb-8 text-center">Platform Features</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <motion.div key={f.href} variants={staggerItem} {...hoverLiftGlow}>
                <Link href={f.href}>
                  <Card className="h-full cursor-pointer cubs-card-hover bg-white/10 backdrop-blur-md border-white/20">
                    <CardHeader>
                      <f.icon className={`mb-2 h-8 w-8 ${f.colour}`} />
                      <CardTitle>{f.title}</CardTitle>
                      <CardDescription>{f.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm font-semibold text-primary">Explore &rarr;</span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
        </div>
      </section>

      {/* ── Cub Showcase + Marketplace Preview ──────── */}
      <section className="relative -mt-24 overflow-hidden pt-24">
        {/* Background 2 transition */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/scenes/homepage-transition.png"
            alt=""
            fill
            unoptimized
            className="object-cover"
            aria-hidden="true"
          />
          {/* Top blend from sky into bg2, bottom fade to dark */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-80% to-background" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16">
        {/* Cub Showcase */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-section">Cub Showcase</h2>
            <Button variant="ghost" asChild>
              <Link href="/my-cubs">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_CUBS.slice(0, 3).map((cub) => (
              <motion.div key={cub.id} variants={staggerItem} {...hoverLiftGlow}>
                <Card className="overflow-hidden cubs-card-hover bg-white/10 backdrop-blur-md border-white/20">
                  <div className="relative aspect-square cubs-image-zoom">
                    <Image src={cub.imageUrl} alt={cub.name} fill className="object-cover" />
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{cub.name}</CardTitle>
                      <Badge variant="outline">#{cub.tokenId}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1 px-4 pb-4 pt-0">
                    {cub.traits.slice(0, 3).map((t) => (
                      <Badge key={t.value} variant={RARITY_VARIANTS[t.rarity] ?? "common"} className="text-xs">
                        {t.value}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Marketplace Preview */}
        <motion.div
          className="mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-section">Marketplace</h2>
            <Button variant="ghost" asChild>
              <Link href="/marketplace">Browse All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MOCK_LISTINGS.map((listing) => (
              <motion.div key={listing.id} variants={staggerItem} {...hoverLiftGlow}>
                <Card className="overflow-hidden cubs-card-hover bg-white/10 backdrop-blur-md border-white/20">
                  <div className="relative aspect-square bg-white/5 cubs-image-zoom">
                    <Image src={listing.imageUrl} alt={listing.name} fill className="object-cover" />
                    <Badge variant="outline" className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm">
                      {listing.type}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{listing.name}</p>
                      <Badge variant={RARITY_VARIANTS[listing.rarity] ?? "common"} className="text-xs">
                        {listing.rarity}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-bold text-primary">{listing.price} ETH</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-section">Ready to Start?</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Mint your first Cub, customize traits in the Forge, or explore the world map.
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
