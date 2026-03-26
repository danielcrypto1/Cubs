"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { mapLocationPulse, springBouncy } from "@/lib/animations";
import { MapTooltip } from "./map-tooltip";

interface MapLocationProps {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  colour: string;
  position: { left: string; top: string };
  onZoomNavigate: (href: string, origin: { left: string; top: string }) => void;
}

export function MapLocation({
  name,
  description,
  href,
  icon: Icon,
  colour,
  position,
  onZoomNavigate,
}: MapLocationProps) {
  const [hovered, setHovered] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: position.left, top: position.top }}
    >
      <div className="relative flex flex-col items-center">
        <AnimatePresence>
          {hovered && <MapTooltip name={name} description={description} />}
        </AnimatePresence>

        <motion.button
          className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/30 bg-card/90 shadow-lg backdrop-blur-sm"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => onZoomNavigate(href, position)}
          animate={prefersReduced ? undefined : mapLocationPulse.animate}
          transition={prefersReduced ? undefined : mapLocationPulse.transition}
          whileHover={{ scale: 1.15, transition: springBouncy }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className={`h-7 w-7 ${colour}`} />
        </motion.button>

        {/* Location label */}
        <span className="mt-1.5 whitespace-nowrap text-xs font-semibold text-foreground/80">
          {name}
        </span>
      </div>
    </div>
  );
}
