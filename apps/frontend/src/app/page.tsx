"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Paintbrush,
  ShoppingBag,
  FlaskConical,
  Vault,
  Hammer,
} from "lucide-react";
import { WorldMap, type MapLocationData } from "@/components/map/world-map";
import { FloatingBackground } from "@/components/shared/floating-background";
import { api } from "@/lib/api-client";
import type { Drop } from "@/types";

const MAP_LOCATIONS: MapLocationData[] = [
  {
    id: "city",
    name: "Cub City",
    description: "Mint new Cubs into existence",
    href: "/mint",
    icon: Building2,
    colour: "text-cubs-gold",
    position: { left: "20%", top: "45%" },
  },
  {
    id: "forge",
    name: "Cub Forge",
    description: "Customize traits and forge new Cubs",
    href: "/forge",
    icon: Hammer,
    colour: "text-cubs-orange",
    position: { left: "45%", top: "30%" },
  },
  {
    id: "market",
    name: "Cub Market",
    description: "Buy and sell on the marketplace",
    href: "/marketplace",
    icon: ShoppingBag,
    colour: "text-cubs-sky",
    position: { left: "75%", top: "40%" },
  },
  {
    id: "labs",
    name: "Cub Labs",
    description: "Open crates for rare rewards",
    href: "/crates",
    icon: FlaskConical,
    colour: "text-cubs-purple",
    position: { left: "60%", top: "65%" },
  },
  {
    id: "vault",
    name: "Cub Vault",
    description: "Stake Cubs and earn points",
    href: "/staking",
    icon: Vault,
    colour: "text-cubs-green",
    position: { left: "30%", top: "70%" },
  },
];

function FeaturedDropsBanner() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    api.get<{ data: Drop[] }>("/api/drops/featured")
      .then((res) => setDrops(res.data))
      .catch(() => {});
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((i) => (i + 1) % drops.length);
  }, [drops.length]);

  useEffect(() => {
    if (drops.length <= 1) return;
    const id = setInterval(nextSlide, 7000);
    return () => clearInterval(id);
  }, [drops.length, nextSlide]);

  if (drops.length === 0) return null;

  const drop = drops[activeIndex];

  return (
    <div className="relative mx-auto mb-8 max-w-6xl px-4">
      <Link href={`/drops/${drop.id}`}>
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
          <div className="relative h-40 sm:h-52">
            {drop.bannerImage ? (
              <img src={drop.bannerImage} alt={drop.name} className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
            ) : (
              <div className="h-full" style={{ background: drop.themeColor ? `linear-gradient(135deg, ${drop.themeColor}, transparent)` : "linear-gradient(135deg, oklch(0.5 0.15 280), oklch(0.3 0.1 300))" }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  {drop.status}
                </span>
                {drop.isFeatured && (
                  <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-xs font-bold text-black">FEATURED</span>
                )}
              </div>
              <h3 className="mt-2 font-display text-2xl tracking-tight text-white">{drop.name}</h3>
              {drop.description && (
                <p className="mt-1 max-w-md text-sm text-white/70">{drop.description}</p>
              )}
            </div>
          </div>

          {/* Dots indicator */}
          {drops.length > 1 && (
            <div className="absolute bottom-3 right-4 flex gap-1.5">
              {drops.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setActiveIndex(i); }}
                  className={`h-2 rounded-full transition-all ${i === activeIndex ? "w-6 bg-white" : "w-2 bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="-mt-24">
      <FloatingBackground count={12} />
      <div className="relative z-10 pt-28">
        <FeaturedDropsBanner />
      </div>
      <WorldMap locations={MAP_LOCATIONS} />
    </div>
  );
}
