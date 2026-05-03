"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check, Circle } from "lucide-react";

const MILESTONES = [
  {
    quarter: "Q2 2026",
    title: "Genesis Mint",
    body: "10,000 unique cubs hit the chain. 8 trait categories, on-chain rarity.",
    status: "done",
  },
  {
    quarter: "Q3 2026",
    title: "Cub Forge launches",
    body: "Burn-and-forge any cub. Mix traits, swap layers, climb the rarity board.",
    status: "done",
  },
  {
    quarter: "Q4 2026",
    title: "Marketplace v1",
    body: "Native marketplace with floor bids, basket buys and 0% royalties for holders.",
    status: "active",
  },
  {
    quarter: "Q1 2027",
    title: "Drops & Chests",
    body: "Limited-run themed drops, randomised chests with on-chain entropy.",
    status: "upcoming",
  },
  {
    quarter: "Q2 2027",
    title: "PAWS economy",
    body: "Stake your cubs, earn $PAWS, redeem against drops, traits and merch.",
    status: "upcoming",
  },
  {
    quarter: "Q3 2027",
    title: "Mobile + AR",
    body: "Take your cub anywhere. AR companion app, mobile minting and trading.",
    status: "upcoming",
  },
  {
    quarter: "Q4 2027",
    title: "Beyond the den",
    body: "Brand collabs, IRL drops, animated short films and a bigger world.",
    status: "upcoming",
  },
];

const STATUS_LABEL: Record<string, string> = {
  done: "Shipped",
  active: "In progress",
  upcoming: "Upcoming",
};

export default function RoadmapPage() {
  return (
    <div className="relative">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">About cubs</p>
        <h1 className="mt-3 font-display uppercase leading-[0.9] tracking-[-0.03em] text-[clamp(3rem,8vw,6rem)]">
          <span className="block">The cubs</span>
          <span className="block text-primary">story.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          Where we started, where we are, and where we&apos;re heading. Every
          milestone shipped is a step toward a bigger world for cubs.
        </p>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            { value: "200M+", label: "Trait combinations" },
            { value: "1.5B", label: "Possible rarity scores" },
            { value: "69%", label: "Holder retention" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="font-display text-4xl text-primary">{s.value}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vertical timeline */}
      <section className="mx-auto max-w-3xl px-4 pb-24">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">The cubs story</p>
        <h2 className="mt-2 font-display text-3xl uppercase">Roadmap</h2>

        <div className="relative mt-10">
          <span className="absolute left-4 top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-1/2" />
          <ul className="space-y-10">
            {MILESTONES.map((m, i) => {
              const isLeft = i % 2 === 0;
              const Icon = m.status === "done" ? Check : Circle;
              return (
                <motion.li
                  key={m.quarter + m.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: i * 0.04 }}
                  className="relative flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6"
                >
                  {/* Card */}
                  <div className={`md:col-start-1 ${isLeft ? "md:text-right" : "md:col-start-3"}`}>
                    <div className="ml-10 rounded-3xl border border-border bg-card p-6 md:ml-0">
                      <p className="text-[10px] uppercase tracking-widest text-primary">{m.quarter}</p>
                      <p className="mt-2 font-display text-xl uppercase">{m.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
                      <span className={`mt-3 inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        m.status === "done" ? "border-primary/40 bg-primary/10 text-primary" :
                        m.status === "active" ? "border-foreground/30 text-foreground" :
                        "border-border text-muted-foreground"
                      }`}>
                        {STATUS_LABEL[m.status]}
                      </span>
                    </div>
                  </div>

                  {/* Dot */}
                  <span className={`absolute left-4 -translate-x-1/2 md:static md:col-start-2 md:-translate-x-0 inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                    m.status === "done" ? "border-primary bg-primary text-primary-foreground" :
                    m.status === "active" ? "border-primary bg-background text-primary" :
                    "border-border bg-background text-muted-foreground"
                  }`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-3">
          <Link href="/team" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-xs font-bold uppercase tracking-widest transition hover:border-primary hover:text-primary">
            Meet the team
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:brightness-110">
            Browse the den
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
