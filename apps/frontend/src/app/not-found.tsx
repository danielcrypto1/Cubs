"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative -mt-8 flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden bg-background px-4">
      {/* Massive 404 with negative-space cutouts (chunky display number) */}
      <motion.svg
        aria-hidden
        viewBox="0 0 900 380"
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <defs>
          {/* The "4" shape with a cutout */}
          <mask id="cut4">
            <rect width="100%" height="100%" fill="white" />
            <circle cx="100" cy="180" r="40" fill="black" />
          </mask>
          {/* The "0" shape with a cutout */}
          <mask id="cut0">
            <rect width="100%" height="100%" fill="white" />
            <rect x="430" y="100" width="40" height="100" rx="6" fill="black" />
          </mask>
        </defs>

        {/* 4 */}
        <g
          mask="url(#cut4)"
          fill="oklch(0.85 0.25 145)"
          style={{ filter: "drop-shadow(0 0 40px oklch(0.85 0.25 145 / 0.25))" }}
        >
          <polygon points="160,40 30,260 110,260 110,330 200,330 200,260 240,260 240,200 200,200 200,40" />
        </g>

        {/* 0 */}
        <g
          mask="url(#cut0)"
          fill="oklch(0.85 0.25 145)"
          style={{ filter: "drop-shadow(0 0 40px oklch(0.85 0.25 145 / 0.25))" }}
        >
          <ellipse cx="450" cy="190" rx="120" ry="150" />
          <ellipse cx="450" cy="190" rx="46" ry="68" fill="black" />
        </g>

        {/* 4 */}
        <g
          mask="url(#cut4)"
          fill="oklch(0.85 0.25 145)"
          style={{ filter: "drop-shadow(0 0 40px oklch(0.85 0.25 145 / 0.25))" }}
          transform="translate(620 0)"
        >
          <polygon points="160,40 30,260 110,260 110,330 200,330 200,260 240,260 240,200 200,200 200,40" />
        </g>
      </motion.svg>

      {/* Centered overlay panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 max-w-xl rounded-3xl border border-border bg-card/80 p-10 text-center backdrop-blur-md"
      >
        <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground">Off the trail</p>
        <h1 className="mt-3 font-display text-3xl uppercase tracking-tight md:text-5xl">
          This page is not found.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn&apos;t find the page you were looking for, or an
          unexpected error occurred. Head back to the den.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:brightness-110"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/30 px-7 py-3 text-xs font-bold uppercase tracking-widest transition hover:border-primary hover:text-primary"
          >
            Browse the den
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
