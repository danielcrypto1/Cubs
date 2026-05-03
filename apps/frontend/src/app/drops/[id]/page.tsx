"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { DropDetail, CrateDefinition } from "@/types";

function DropCountdown({ targetTime, label }: { targetTime: string; label: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Now"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-center">
      <div className="text-xs uppercase tracking-wider text-amber-400/70">{label}</div>
      <div className="mt-1 font-mono text-2xl font-bold text-amber-400">{timeLeft}</div>
    </div>
  );
}

function SupplyBar({ current, max }: { current: number; max: number | null }) {
  if (!max) return <span className="text-xs text-muted-foreground">Unlimited</span>;
  const pct = Math.min(100, (current / max) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{current} / {max}</span>
        <span>{Math.round(pct)}% claimed</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CrateCard({ crate }: { crate: CrateDefinition }) {
  const rarityColors: Record<string, string> = {
    COMMON: "border-zinc-500/30",
    UNCOMMON: "border-green-500/30",
    RARE: "border-blue-500/30",
    EPIC: "border-purple-500/30",
    LEGENDARY: "border-amber-500/30",
  };

  return (
    <div className={`rounded-xl border bg-card p-5 ${rarityColors[crate.rarity] ?? ""}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
          <span className="text-3xl">📦</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg">{crate.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-amber-400">
              {Number(crate.priceAmount).toLocaleString()} {crate.priceType}
            </span>
            <span className={`rounded px-2 py-0.5 text-xs ${rarityColors[crate.rarity]?.replace("border-", "bg-").replace("/30", "/20")}`}>
              {crate.rarity}
            </span>
          </div>
          <div className="mt-3">
            <SupplyBar current={crate.currentSupply} max={crate.maxSupply} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [drop, setDrop] = useState<DropDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    api.get<{ data: DropDetail }>(`/api/drops/${params.id}`)
      .then((res) => setDrop(res.data))
      .catch(() => router.push("/drops"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-64 animate-pulse rounded-2xl bg-card" />
        <div className="mt-6 h-8 w-1/3 animate-pulse rounded bg-card" />
        <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-card" />
      </div>
    );
  }

  if (!drop) return null;

  const statusColors: Record<string, string> = {
    LIVE: "text-green-400",
    SCHEDULED: "text-blue-400",
    ENDED: "text-zinc-400",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <Link href="/drops" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        &larr; All Drops
      </Link>

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl">
        {drop.bannerImage ? (
          <img src={drop.bannerImage} alt={drop.name} className="h-64 w-full object-cover" />
        ) : (
          <div
            className="flex h-64 items-center justify-center"
            style={{ background: drop.themeColor ? `linear-gradient(135deg, ${drop.themeColor}, transparent)` : "linear-gradient(135deg, oklch(0.5 0.15 280), oklch(0.3 0.1 300))" }}
          >
            <span className="text-7xl">🎉</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-end justify-between">
            <div>
              <span className={`text-sm font-semibold ${statusColors[drop.status] ?? ""}`}>
                {drop.status === "LIVE" && "● "}{drop.status}
              </span>
              <h1 className="font-display text-3xl tracking-tight text-white">{drop.name}</h1>
            </div>
            {drop.isFeatured && (
              <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-black">FEATURED</span>
            )}
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="mt-6">
        {drop.status === "LIVE" && drop.endTime && (
          <DropCountdown targetTime={drop.endTime} label="Ends in" />
        )}
        {drop.status === "SCHEDULED" && drop.startTime && (
          <DropCountdown targetTime={drop.startTime} label="Starts in" />
        )}
      </div>

      {/* Description */}
      {drop.description && (
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{drop.description}</p>
      )}

      {/* Crates */}
      {drop.crates && drop.crates.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-2xl">Available Crates</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {drop.crates.map((crate) => <CrateCard key={crate.id} crate={crate} />)}
          </div>
        </section>
      )}

      {/* Featured Traits */}
      {drop.traitDefinitions && drop.traitDefinitions.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-2xl">Featured Traits</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {drop.traitDefinitions.map((trait) => (
              <div key={trait.id} className="group flex flex-col items-center rounded-lg border border-border/50 bg-card p-3 text-center transition-colors hover:border-primary/30">
                <div className="mb-2 h-16 w-16 overflow-hidden rounded-lg bg-zinc-800">
                  <img src={trait.imageUrl} alt={trait.name} className="h-full w-full object-cover" />
                </div>
                <span className="text-xs font-medium leading-tight">{trait.name}</span>
                <span className="text-[10px] text-muted-foreground">{trait.rarity}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
