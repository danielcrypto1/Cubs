"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MAP_BACKGROUND } from "@/lib/assets";
import { mapZoomIn, springBouncy } from "@/lib/animations";
import { MapLocation } from "./map-location";
import { MapDecorations } from "./map-decorations";

export interface MapLocationData {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  colour: string;
  position: { left: string; top: string };
}

interface WorldMapProps {
  locations: MapLocationData[];
}

export function WorldMap({ locations }: WorldMapProps) {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const [zoomTarget, setZoomTarget] = useState<{
    href: string;
    origin: string;
  } | null>(null);

  const handleZoomNavigate = useCallback(
    (href: string, origin: { left: string; top: string }) => {
      if (prefersReduced) {
        router.push(href);
        return;
      }
      setZoomTarget({ href, origin: `${origin.left} ${origin.top}` });
    },
    [prefersReduced, router],
  );

  const handleZoomComplete = useCallback(() => {
    if (zoomTarget) {
      router.push(zoomTarget.href);
    }
  }, [zoomTarget, router]);

  return (
    <div>
      {/* Page title */}
      <h1 className="mb-6 text-center font-display text-4xl sm:text-5xl">
        Explore the <span className="cubs-gradient-text">Cub World</span>
      </h1>
      <p className="mx-auto mb-8 max-w-md text-center text-muted-foreground">
        Click a location to navigate. Each zone holds a different part of the CUBS ecosystem.
      </p>

      {/* ── Desktop: Interactive map ─────────────────────────────────── */}
      <div className="hidden md:block">
        <AnimatePresence>
          <motion.div
            className="relative mx-auto aspect-[16/9] max-w-6xl overflow-hidden rounded-2xl border border-border/30 bg-card/50 shadow-xl"
            variants={mapZoomIn}
            animate={zoomTarget ? "zooming" : "idle"}
            style={zoomTarget ? { transformOrigin: zoomTarget.origin } : undefined}
            onAnimationComplete={() => {
              if (zoomTarget) handleZoomComplete();
            }}
          >
            {/* Background */}
            <Image
              src={MAP_BACKGROUND}
              alt="Cub World Map"
              fill
              unoptimized
              className="object-cover opacity-30"
              priority
            />

            {/* Gradient overlays for depth */}
            <div
              className="absolute inset-0 z-[1] bg-gradient-to-b from-background/40 via-transparent to-background/60"
              aria-hidden="true"
            />

            {/* Decorative floating elements */}
            <MapDecorations />

            {/* Location markers */}
            {locations.map((loc) => (
              <MapLocation
                key={loc.id}
                {...loc}
                onZoomNavigate={handleZoomNavigate}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Mobile: Vertical card list ───────────────────────────────── */}
      <div className="flex flex-col gap-4 px-4 md:hidden">
        {locations.map((loc) => (
          <motion.div
            key={loc.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={springBouncy}
          >
            <Link href={loc.href}>
              <Card className="flex items-center gap-4 p-4 cubs-card-hover">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-card">
                  <loc.icon className={`h-6 w-6 ${loc.colour}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg">{loc.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {loc.description}
                  </p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
