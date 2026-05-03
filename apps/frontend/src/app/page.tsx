"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const stats = [
  { label: "Cubs Minted", value: "8,421" },
  { label: "Holders", value: "3,107" },
  { label: "Floor", value: "0.42 ETH" },
  { label: "Volume", value: "1,284 ETH" },
];

const featureCards = [
  {
    title: "Forge",
    blurb: "Mix and match traits to forge a Cub that's exclusively yours.",
    href: "/forge",
    cta: "Open the forge",
  },
  {
    title: "Drops",
    blurb: "Limited-run chests and seasonal drops with on-chain rarity.",
    href: "/drops",
    cta: "See drops",
  },
  {
    title: "Explore",
    blurb: "Browse, bid, and bag Cubs across the open marketplace.",
    href: "/marketplace",
    cta: "Enter explore",
  },
];

export default function HomePage() {
  return (
    <div className="-mt-24">
      {/* Hero — landing video + headline */}
      <section className="relative h-[100svh] min-h-[680px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        >
          <source src="/ux/home/landing.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pt-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display uppercase leading-[0.85] tracking-[-0.04em] text-[clamp(3.5rem,11vw,9rem)]"
          >
            <span className="block text-foreground">The wild</span>
            <span className="block text-primary">runs on cubs.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            Forge it, drop it, trade it. CUBS is a living NFT ecosystem
            with composable traits, real rarity and a marketplace built
            for the crew.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link
              href="/mint"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:brightness-110"
            >
              Mint a cub
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/30 px-7 py-3 text-sm font-bold uppercase tracking-wide text-foreground transition hover:border-foreground/60"
            >
              Explore
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Big text statement — Good text reference */}
      <section className="relative px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display uppercase leading-[0.95] tracking-[-0.025em] text-[clamp(2rem,5vw,4.25rem)]">
            Big drops mean nothing without great execution. We&apos;ve got
            both. Merging fresh thinking with sharp creative instincts to
            make every cub <span className="cubs-strike">basic</span>{" "}
            <span className="text-primary">stand out</span>.
          </h2>
        </div>
      </section>

      {/* Stats — boxes for data */}
      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <p className="text-sm uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-3 font-display text-4xl text-primary">{s.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature shield cards */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <h3 className="font-display uppercase text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.025em] text-primary">
            The full ecosystem,
            <br />
            built for scale.
          </h3>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Three rooms. One world. Pick a door.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featureCards.map((c, i) => (
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
                  <p className="font-display text-3xl uppercase">{c.title}</p>
                  <p className="mt-4 max-w-[24ch] text-sm text-muted-foreground">
                    {c.blurb}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 rounded-full border border-foreground/30 px-5 py-2 text-xs font-bold uppercase tracking-wide transition group-hover:border-primary group-hover:text-primary">
                    {c.cta}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scrolling bears strip */}
      <section className="relative overflow-hidden px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h3 className="font-display uppercase text-[clamp(2rem,4.5vw,3.75rem)] leading-[0.95] tracking-[-0.025em]">
                Every cub is <span className="text-primary">one of one</span>.
              </h3>
              <p className="mt-4 max-w-md text-muted-foreground">
                Composable traits, on-chain rarity, no two the same. Dive
                into the collection and find yours.
              </p>
              <Link
                href="/marketplace"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:brightness-110"
              >
                Browse the den
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="aspect-video w-full object-cover"
              >
                <source src="/ux/home/scroll-bears.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Information section — auto-loop video */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-card">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="aspect-[16/7] w-full object-cover"
          >
            <source src="/ux/home/info.mp4" type="video/mp4" />
          </video>
        </div>
      </section>
    </div>
  );
}
