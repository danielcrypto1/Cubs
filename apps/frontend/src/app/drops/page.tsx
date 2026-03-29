"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { api } from "@/lib/api-client";
import type { Drop } from "@/types";

function DropStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    LIVE: "bg-green-500/20 text-green-400 border-green-500/30",
    SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ENDED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${colors[status] ?? colors.ENDED}`}>
      {status === "LIVE" && <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />}
      {status}
    </span>
  );
}

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return <span className="font-mono text-sm text-amber-400">{timeLeft}</span>;
}

function DropCard({ drop }: { drop: Drop }) {
  return (
    <Link href={`/drops/${drop.id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        {/* Banner */}
        <div className="relative h-48 overflow-hidden">
          {drop.bannerImage ? (
            <img
              src={drop.bannerImage}
              alt={drop.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center"
              style={{ background: drop.themeColor ? `linear-gradient(135deg, ${drop.themeColor}, transparent)` : "linear-gradient(135deg, oklch(0.5 0.15 280), oklch(0.3 0.1 300))" }}
            >
              <span className="text-4xl">🎉</span>
            </div>
          )}
          <div className="absolute right-3 top-3">
            <DropStatusBadge status={drop.status} />
          </div>
          {drop.isFeatured && (
            <div className="absolute left-3 top-3 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-bold text-black">
              FEATURED
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display text-xl tracking-tight">{drop.name}</h3>
          {drop.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{drop.description}</p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {drop.crates?.length ?? 0} crate{(drop.crates?.length ?? 0) !== 1 ? "s" : ""}
            </span>
            {drop.status === "LIVE" && drop.endTime && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Ends in</span>
                <CountdownTimer endTime={drop.endTime} />
              </div>
            )}
            {drop.status === "SCHEDULED" && drop.startTime && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Starts in</span>
                <CountdownTimer endTime={drop.startTime} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader title="Drops" description="Limited-time events with exclusive crates and traits" />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {liveDrops.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 font-display text-2xl">
                <span className="h-3 w-3 animate-pulse rounded-full bg-green-400" />
                Live Now
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {liveDrops.map((d) => <DropCard key={d.id} drop={d} />)}
              </div>
            </section>
          )}

          {scheduledDrops.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-2xl text-blue-400">Upcoming</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {scheduledDrops.map((d) => <DropCard key={d.id} drop={d} />)}
              </div>
            </section>
          )}

          {endedDrops.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-2xl text-muted-foreground">Archive</h2>
              <div className="grid gap-6 opacity-60 sm:grid-cols-2 lg:grid-cols-3">
                {endedDrops.map((d) => <DropCard key={d.id} drop={d} />)}
              </div>
            </section>
          )}

          {drops.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              <span className="text-6xl">🎉</span>
              <h3 className="mt-4 font-display text-2xl">No Drops Yet</h3>
              <p className="mt-2 text-muted-foreground">Check back soon for exclusive drops!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
