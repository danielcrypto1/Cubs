"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Rocket, Wallet, Sparkles, Hammer, ShoppingBag, Package } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────
   Helpers
─────────────────────────────────────────────────────────────────── */

function MarqueeStrip({ items, direction = "left" }: { items: string[]; direction?: "left" | "right" }) {
  return (
    <div className="relative overflow-hidden border-y border-border bg-primary py-3 text-primary-foreground">
      <div className={`flex whitespace-nowrap ${direction === "left" ? "cubs-marquee" : "cubs-marquee-reverse"}`}>
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em]">
            ★ {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function FloatingDoodle({ children, x, y, rotate = 0, delay = 0 }: { children: React.ReactNode; x: string; y: string; rotate?: number; delay?: number }) {
  return (
    <motion.span
      className="pointer-events-none absolute"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0, rotate: rotate - 30 }}
      animate={{ opacity: 1, scale: 1, rotate, y: [0, -10, 0] }}
      transition={{
        opacity: { delay, duration: 0.6 },
        scale: { delay, duration: 0.6, type: "spring", stiffness: 200 },
        rotate: { delay, duration: 0.6 },
        y: { delay: delay + 0.6, duration: 4, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      {children}
    </motion.span>
  );
}

/* SVG squiggle that winds through the hero */
function SquigglePath() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 800"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="sq" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.85 0.25 145)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="oklch(0.85 0.25 145)" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <motion.path
        d="M-50 220 C 220 100, 360 360, 600 280 S 980 540, 1180 360 S 1500 200, 1480 520"
        fill="none"
        stroke="url(#sq)"
        strokeWidth="120"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <motion.path
        d="M-50 220 C 220 100, 360 360, 600 280 S 980 540, 1180 360 S 1500 200, 1480 520"
        fill="none"
        stroke="oklch(0.85 0.25 145)"
        strokeWidth="2"
        strokeDasharray="6 12"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Section data
─────────────────────────────────────────────────────────────────── */

const STATS = [
  { value: "8K+", label: "Cubs minted", color: "text-cubs-gold" },
  { value: "3.1K", label: "Holders", color: "text-primary" },
  { value: "200M+", label: "Trait combos", color: "text-cubs-pink" },
  { value: "0.42 ETH", label: "Floor price", color: "text-cubs-sky" },
];

const FEATURE_TILES = [
  "MINT A CUB",
  "FORGE TRAITS",
  "CRACK A CHEST",
  "BUY · SELL",
  "STAKE EARN",
  "JOIN THE DEN",
];

const TILE_COLORS = [
  "bg-primary text-primary-foreground",
  "bg-foreground text-background",
  "bg-cubs-orange text-background",
  "bg-cubs-pink text-foreground",
  "bg-cubs-sky text-background",
  "bg-cubs-gold text-background",
];

const HOVER_DROPS = [
  { name: "Genesis", subtitle: "10,000 cubs · The original den", color: "from-emerald-500 to-emerald-900" },
  { name: "Onsie Season", subtitle: "Cosy alts · Limited 1,000", color: "from-rose-500 to-rose-900" },
  { name: "Wild West", subtitle: "Frontier traits · Coming Q3", color: "from-amber-500 to-amber-900" },
  { name: "Aquatic Edition", subtitle: "Underwater drops · TBA", color: "from-sky-500 to-sky-900" },
];

/* ────────────────────────────────────────────────────────────────────
   Page
─────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="-mt-24">
      {/* Top marquee bar */}
      <div className="pt-24">
        <MarqueeStrip
          items={[
            "Genesis mint · live now",
            "0.05 ETH per cub",
            "Forge any trait",
            "On-chain rarity",
            "200M+ combos",
            "Join the den",
          ]}
        />
      </div>

      {/* Hero: squiggle path + floating doodles + headline */}
      <section className="relative h-[100svh] min-h-[680px] overflow-hidden">
        <SquigglePath />

        {/* Floating cartoon doodles, à la Solscan landing reference */}
        <FloatingDoodle x="8%" y="22%" rotate={-12} delay={0.3}>
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Rocket className="h-8 w-8" />
          </span>
        </FloatingDoodle>
        <FloatingDoodle x="78%" y="18%" rotate={14} delay={0.5}>
          <span className="grid h-16 w-16 place-items-center rounded-full bg-cubs-gold text-background shadow-lg">
            <Sparkles className="h-7 w-7" />
          </span>
        </FloatingDoodle>
        <FloatingDoodle x="86%" y="58%" rotate={-8} delay={0.7}>
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-cubs-pink text-foreground shadow-lg">
            <Wallet className="h-7 w-7" />
          </span>
        </FloatingDoodle>
        <FloatingDoodle x="6%" y="68%" rotate={18} delay={0.9}>
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-cubs-sky text-background shadow-lg">
            <Hammer className="h-7 w-7" />
          </span>
        </FloatingDoodle>

        {/* Black geometric shapes scattered behind */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <span className="absolute left-[12%] top-[40%] h-24 w-24 rounded-full bg-foreground/[0.04]" />
          <span className="absolute left-[64%] top-[30%] h-32 w-16 rounded-full bg-foreground/[0.04]" />
          <span className="absolute left-[40%] top-[72%] h-20 w-40 rounded-full bg-foreground/[0.04]" />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display uppercase leading-[0.85] tracking-[-0.04em] text-[clamp(3.5rem,11vw,9rem)]"
          >
            <span className="block">The wild</span>
            <span className="block text-primary">runs on cubs.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            Forge it, drop it, trade it. CUBS is a living NFT ecosystem
            with composable traits, real rarity and a marketplace built
            for the crew.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link
              href="/mint"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-bold uppercase tracking-wide text-background transition hover:brightness-110"
            >
              Launch web app
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/30 bg-card px-7 py-3 text-sm font-bold uppercase tracking-wide text-foreground transition hover:border-primary hover:text-primary"
            >
              Browse the den
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Big bold colored stats — Datashown reference */}
      <section className="border-y border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mb-10 text-xs uppercase tracking-widest text-muted-foreground">
            By the numbers
          </p>
          <div className="grid grid-cols-2 gap-y-12 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.08, type: "spring" }}
              >
                <p className={`font-display leading-[0.85] tracking-[-0.04em] text-[clamp(3rem,7vw,5rem)] uppercase ${s.color}`}>
                  {s.value}
                </p>
                <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Big text statement (Good text reference) */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display uppercase leading-[0.95] tracking-[-0.025em] text-[clamp(2rem,5vw,4.25rem)]">
            Big drops mean nothing without great execution. We&apos;ve got
            both. Merging fresh thinking with sharp creative instincts to
            make every cub <span className="cubs-strike">basic</span>{" "}
            <span className="text-primary">stand out</span>.
          </h2>
        </div>
      </section>

      {/* Slush-style auto-scrolling card strip — replaces scroll-bears.mp4 */}
      <section className="relative overflow-hidden py-12">
        <div className="cubs-marquee flex gap-3 whitespace-nowrap">
          {[...FEATURE_TILES, ...FEATURE_TILES, ...FEATURE_TILES].map((label, i) => (
            <span
              key={i}
              className={`inline-flex shrink-0 items-center gap-3 rounded-2xl px-8 py-5 font-display text-3xl uppercase tracking-tight md:text-5xl ${TILE_COLORS[i % TILE_COLORS.length]}`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-current">
                <Sparkles className="h-4 w-4" />
              </span>
              {label}
            </span>
          ))}
        </div>
        <div className="mt-3 cubs-marquee-reverse flex gap-3 whitespace-nowrap">
          {[...FEATURE_TILES, ...FEATURE_TILES, ...FEATURE_TILES].reverse().map((label, i) => (
            <span
              key={i}
              className={`inline-flex shrink-0 items-center gap-3 rounded-2xl px-8 py-5 font-display text-3xl uppercase tracking-tight md:text-5xl ${TILE_COLORS[(i + 2) % TILE_COLORS.length]}`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-current">
                <Sparkles className="h-4 w-4" />
              </span>
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Centered statement — Information reference */}
      <section className="relative isolate overflow-hidden py-32">
        <div aria-hidden className="absolute inset-0 -z-10 cubs-surface" />
        <div className="mx-auto max-w-3xl px-4 text-center">
          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-display uppercase leading-[0.95] tracking-[-0.025em] text-[clamp(2.5rem,6vw,4.5rem)]"
          >
            The community-first NFT platform.
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-muted-foreground"
          >
            Built by holders, for holders. No empty promises, no broken
            roadmaps — just shipping.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Link
              href="/mint"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:brightness-110"
            >
              Start now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/team"
              className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 text-sm font-bold uppercase tracking-wide transition hover:border-primary hover:text-primary"
            >
              Meet the team
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Hover-row drop banners — Collins case-study reference */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <h3 className="font-display text-3xl uppercase">Drops</h3>
            <Link href="/drops" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-border border-y border-border">
            {HOVER_DROPS.map((d) => (
              <li
                key={d.name}
                className={`group relative flex items-center justify-between gap-4 overflow-hidden bg-gradient-to-r ${d.color} bg-[length:0%_100%] bg-no-repeat px-4 py-6 transition-[background-size] duration-500 ease-out hover:bg-[length:100%_100%]`}
              >
                <span className="relative z-10 flex items-center gap-4 transition-transform duration-500 group-hover:translate-x-2">
                  <span className="font-display text-3xl uppercase tracking-tight md:text-5xl">{d.name}</span>
                  <span className="hidden text-xs uppercase tracking-widest text-foreground/60 md:inline">{d.subtitle}</span>
                </span>
                <ArrowRight className="relative z-10 h-6 w-6 -translate-x-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Three-room CTA */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl">
          <h3 className="font-display uppercase text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.025em] text-primary">
            Three rooms, one den.
          </h3>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { title: "Forge", body: "Mix traits, burn cubs, mint one-of-ones.", href: "/forge", icon: Hammer, color: "text-primary" },
              { title: "Drops", body: "Themed chests, real rarity, randomised.", href: "/drops", icon: Package, color: "text-cubs-gold" },
              { title: "Explore", body: "Bid, bag, browse the open marketplace.", href: "/marketplace", icon: ShoppingBag, color: "text-cubs-sky" },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={c.href}
                  className="cubs-card-hover cubs-shield group flex h-full flex-col items-center border border-border bg-card p-8 pb-12 text-center"
                >
                  <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-foreground/5 ${c.color}`}>
                    <c.icon className="h-7 w-7" />
                  </span>
                  <p className="mt-5 font-display text-3xl uppercase">{c.title}</p>
                  <p className="mt-2 max-w-[24ch] text-sm text-muted-foreground">{c.body}</p>
                  <span className="mt-auto inline-flex items-center gap-2 rounded-full border border-foreground/30 px-5 py-2 text-xs font-bold uppercase tracking-wide transition group-hover:border-primary group-hover:text-primary">
                    Enter
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
