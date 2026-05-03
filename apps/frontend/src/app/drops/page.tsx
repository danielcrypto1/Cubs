"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import type { Drop } from "@/types";

const CHEST_TIERS = [
  { name: "Bronze Chest", price: "0.05 ETH", odds: "Common · Uncommon", color: "from-amber-700 to-amber-900" },
  { name: "Silver Chest", price: "0.15 ETH", odds: "Rare · Uncommon", color: "from-slate-400 to-slate-700" },
  { name: "Gold Chest", price: "0.4 ETH", odds: "Epic · Rare", color: "from-amber-400 to-amber-700" },
  { name: "Diamond Chest", price: "1.0 ETH", odds: "Legendary · Epic", color: "from-cyan-300 to-blue-700" },
];

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return <span className="font-mono text-primary">{timeLeft}</span>;
}

function DropTile({ drop, dim = false }: { drop: Drop; dim?: boolean }) {
  return (
    <motion.div whileHover={{ y: -4 }} className={`group ${dim ? "opacity-70" : ""}`}>
      <Link href={`/drops/${drop.id}`} className="block overflow-hidden rounded-3xl border border-border bg-card cubs-card-hover">
        <div className="relative aspect-[16/9] overflow-hidden">
          {drop.bannerImage ? (
            <img src={drop.bannerImage} alt={drop.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div
              className="flex h-full items-center justify-center"
              style={{ background: drop.themeColor ? `linear-gradient(135deg, ${drop.themeColor}, oklch(0.10 0 0))` : "linear-gradient(135deg, oklch(0.30 0.10 145), oklch(0.10 0 0))" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${drop.status === "LIVE" ? "bg-primary text-primary-foreground" : drop.status === "SCHEDULED" ? "border border-white/40 text-white" : "border border-white/20 text-white/70"}`}>
            {drop.status}
          </span>
        </div>
        <div className="p-5">
          <p className="font-display text-xl uppercase tracking-tight">{drop.name}</p>
          {drop.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{drop.description}</p>}
          <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            <span>{drop.crates?.length ?? 0} chests</span>
            {drop.status === "LIVE" && drop.endTime && <span>Ends <CountdownTimer endTime={drop.endTime} /></span>}
            {drop.status === "SCHEDULED" && drop.startTime && <span>Starts <CountdownTimer endTime={drop.startTime} /></span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Drop[] }>("/api/drops")
      .then((res) => setDrops(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const liveDrops = drops.filter((d) => d.status === "LIVE");
  const scheduledDrops = drops.filter((d) => d.status === "SCHEDULED");
  const endedDrops = drops.filter((d) => d.status === "ENDED");
  const featured = liveDrops[0] ?? scheduledDrops[0] ?? drops[0];

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative -mt-8 mb-16 overflow-hidden border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Limited drops</p>
          <h1 className="mt-3 font-display uppercase leading-[0.9] tracking-[-0.03em] text-[clamp(3rem,8vw,6rem)]">
            <span className="block">Open the</span>
            <span className="block text-primary">chest.</span>
          </h1>
          <p className="mt-5 max-w-xl text-muted-foreground">
            Each chest contains randomized traits, cubs and rarities. Open
            it to find out what&apos;s inside — every chest is final.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16">
        {/* Featured banner — three example chests */}
        {featured && (
          <section className="mb-16">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
              <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
                <div className="relative aspect-[16/9] lg:aspect-auto">
                  {featured.bannerImage ? (
                    <img src={featured.bannerImage} alt={featured.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full" style={{ background: "linear-gradient(135deg, oklch(0.30 0.10 145), oklch(0.10 0 0))" }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                </div>
                <div className="flex flex-col justify-between gap-6 p-8 lg:p-10">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary">Now live</p>
                    <h2 className="mt-2 font-display text-3xl uppercase tracking-tight lg:text-5xl">{featured.name}</h2>
                    <p className="mt-3 text-sm text-muted-foreground">{featured.description}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Image src="/ux/drops/chests.png" alt="" width={120} height={120} className="rounded-xl border border-border" />
                    <Image src="/ux/drops/chests.png" alt="" width={120} height={120} className="rounded-xl border border-border" />
                    <Image src="/ux/drops/chests.png" alt="" width={120} height={120} className="rounded-xl border border-border" />
                  </div>
                  <Link href={`/drops/${featured.id}`} className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:brightness-110">
                    Buy a chest
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Chest tiers */}
        <section className="mb-16">
          <h2 className="font-display text-3xl uppercase">Chest Tiers</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">Pick your luck level. Higher tier, rarer rolls.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CHEST_TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="cubs-shield border border-border bg-card p-6 pb-10 text-center"
              >
                <div className={`mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br ${tier.color}`} />
                <p className="mt-5 font-display text-xl uppercase">{tier.name}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{tier.odds}</p>
                <p className="mt-4 font-display text-2xl text-primary">{tier.price}</p>
                <button className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-[11px] font-bold uppercase tracking-widest transition hover:border-primary hover:text-primary">
                  Open chest
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Live drops grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-80 animate-pulse rounded-3xl bg-card" />)}
          </div>
        ) : (
          <div className="space-y-16">
            {liveDrops.length > 0 && (
              <section>
                <h2 className="mb-6 font-display text-3xl uppercase">Live now</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {liveDrops.map((d) => <DropTile key={d.id} drop={d} />)}
                </div>
              </section>
            )}

            {scheduledDrops.length > 0 && (
              <section>
                <h2 className="mb-6 font-display text-3xl uppercase">Upcoming</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {scheduledDrops.map((d) => <DropTile key={d.id} drop={d} />)}
                </div>
              </section>
            )}

            {endedDrops.length > 0 && (
              <section>
                <h2 className="mb-6 font-display text-3xl uppercase text-muted-foreground">Archive</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {endedDrops.map((d) => <DropTile key={d.id} drop={d} dim />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
