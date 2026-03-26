"use client";

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

export default function HomePage() {
  return (
    <div className="-mt-24">
      <FloatingBackground count={12} />
      <WorldMap locations={MAP_LOCATIONS} />
    </div>
  );
}
