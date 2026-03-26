"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MAP_DECORATIONS } from "@/lib/assets";

interface DecorationElement {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  driftY: number;
  driftX: number;
  rotate: number;
  duration: number;
  delay: number;
  opacity: number;
  imageUrl: string;
}

const DECORATION_SOURCES = Object.values(MAP_DECORATIONS);

export function MapDecorations() {
  const prefersReduced = useReducedMotion();
  const [elements, setElements] = useState<DecorationElement[]>([]);

  useEffect(() => {
    const items: DecorationElement[] = Array.from({ length: 7 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 10,
      width: Math.random() * 40 + 40,
      height: Math.random() * 30 + 30,
      driftY: Math.random() * 20 + 10,
      driftX: Math.random() * 10 + 5,
      rotate: Math.random() * 6 - 3,
      duration: Math.random() * 8 + 12,
      delay: Math.random() * -6,
      opacity: Math.random() * 0.15 + 0.15,
      imageUrl: DECORATION_SOURCES[i % DECORATION_SOURCES.length],
    }));
    setElements(items);
  }, []);

  if (elements.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[3] hidden overflow-hidden md:block" aria-hidden="true">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute will-change-transform"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: el.width,
            height: el.height,
            opacity: el.opacity,
          }}
          animate={
            prefersReduced
              ? undefined
              : {
                  y: [0, -el.driftY, 0],
                  x: [0, el.driftX, 0],
                  rotate: [0, el.rotate, -el.rotate, 0],
                }
          }
          transition={{
            duration: el.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: el.delay,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={el.imageUrl}
            alt=""
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </motion.div>
      ))}
    </div>
  );
}
