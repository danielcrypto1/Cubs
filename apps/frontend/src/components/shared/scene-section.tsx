"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { sectionReveal } from "@/lib/animations";
import { SCENE_BACKGROUNDS, SCENE_TINTS } from "@/lib/assets";

interface SceneSectionProps {
  sceneId: string;
  children: React.ReactNode;
  className?: string;
}

export function SceneSection({ sceneId, children, className = "" }: SceneSectionProps) {
  const bgUrl = SCENE_BACKGROUNDS[sceneId];
  const tint = SCENE_TINTS[sceneId];

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Scene background image at very low opacity */}
      {bgUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={bgUrl}
            alt=""
            fill
            unoptimized
            className="object-cover opacity-[0.07]"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Coloured tint overlay */}
      {tint && (
        <div
          className="absolute inset-0 z-[1]"
          style={{ backgroundColor: tint }}
          aria-hidden="true"
        />
      )}

      {/* Gradient blending overlays (top + bottom fade to background) */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-b from-background via-transparent to-background"
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto max-w-7xl px-4 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionReveal}
      >
        {children}
      </motion.div>
    </section>
  );
}
