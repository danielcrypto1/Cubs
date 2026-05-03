"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Pencil, ShieldCheck, Trophy, Star, Hammer, Image as ImageIcon, Activity, Settings } from "lucide-react";
import sampleCubs from "@/data/sample-cubs.json";
import { usePoints } from "@/hooks/use-points";
import { cn } from "@/lib/utils";

type Tab = "owned" | "activity" | "achievements" | "settings";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "owned", label: "Owned", icon: ImageIcon },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "settings", label: "Settings", icon: Settings },
];

const ACHIEVEMENTS = [
  { name: "First Mint", desc: "Mint your first Cub", earned: true, points: 100 },
  { name: "Collector", desc: "Hold 5+ cubs", earned: true, points: 250 },
  { name: "Forge Master", desc: "Forge your first cub", earned: false, points: 500 },
  { name: "Whale", desc: "Trade 10 ETH in volume", earned: false, points: 1000 },
  { name: "Day One", desc: "Joined in season one", earned: true, points: 150 },
  { name: "Legendary", desc: "Own a legendary cub", earned: false, points: 2000 },
];

const ACTIVITY_LOG = [
  { type: "Mint", item: "Cub #4821", value: "0.08 ETH", time: "2h ago" },
  { type: "Listed", item: "Cub #2118", value: "0.42 ETH", time: "5h ago" },
  { type: "Bid", item: "Sapphire Onsie", value: "0.12 ETH", time: "1d ago" },
  { type: "Forged", item: "Custom Cub", value: "—", time: "2d ago" },
  { type: "Opened", item: "Gold Chest", value: "—", time: "3d ago" },
];

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("owned");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const { available, balance } = usePoints();
  const cubs = sampleCubs.filter((c) => c.type !== "oneofone").slice(0, 12);

  return (
    <div className="relative">
      {/* Cover */}
      <section className="relative">
        <div className="relative h-56 w-full overflow-hidden bg-card md:h-72 lg:h-80">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="cubs-leopard-border h-full w-full opacity-70" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition hover:border-primary hover:text-primary">
            <Camera className="h-3.5 w-3.5" />
            Edit cover
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setCoverUrl(URL.createObjectURL(f));
              }}
            />
          </label>
        </div>

        <div className="mx-auto -mt-12 max-w-6xl px-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-5">
              <label className="group relative cursor-pointer">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-background bg-card md:h-32 md:w-32">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/40 to-card font-display text-3xl text-primary">
                      C
                    </div>
                  )}
                </div>
                <span className="absolute bottom-1 right-1 rounded-full bg-primary p-2 text-primary-foreground opacity-0 shadow-lg transition group-hover:opacity-100">
                  <Camera className="h-3.5 w-3.5" />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setAvatarUrl(URL.createObjectURL(f));
                  }}
                />
              </label>
              <div className="pb-2">
                <p className="font-display text-3xl uppercase tracking-tight md:text-4xl">0xCub...4f2A</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Joined Season One</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-xs font-bold uppercase tracking-widest transition hover:border-primary hover:text-primary"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit profile
              </button>
              <button
                onClick={() => setVerifyOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:brightness-110"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Get verified
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "PAWS", value: available.toLocaleString() },
              { label: "Cubs", value: cubs.length },
              { label: "Followers", value: 1284 },
              { label: "Following", value: 91 },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className="mt-2 font-display text-2xl text-primary">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="mx-auto mt-10 max-w-6xl px-4">
        <div className="flex flex-wrap items-center gap-1 border-b border-border">
          {TABS.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest transition",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
                {isActive && (
                  <motion.span layoutId="dash-tab" className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        <div className="py-10">
          {tab === "owned" && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {cubs.map((cub) => (
                <motion.div key={cub.tokenId} whileHover={{ y: -4 }} className="overflow-hidden rounded-3xl border border-border bg-card cubs-card-hover">
                  <div className="aspect-square overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cub.imageUrl} alt={cub.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-base uppercase">#{cub.tokenId}</p>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{cub.type}</span>
                    </div>
                    <Link href="/forge" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition hover:border-primary hover:text-primary">
                      <Hammer className="h-3 w-3" />
                      Forge
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === "activity" && (
            <div className="space-y-2">
              {ACTIVITY_LOG.map((row, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4">
                  <div className="flex items-center gap-4">
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">{row.type}</span>
                    <p className="font-medium">{row.item}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="font-display text-primary">{row.value}</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">{row.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "achievements" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ACHIEVEMENTS.map((a) => (
                <div key={a.name} className={cn("rounded-3xl border bg-card p-6", a.earned ? "border-primary/40" : "border-border opacity-60")}>
                  <div className="flex items-start justify-between">
                    <div className={cn("rounded-full p-3", a.earned ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                      <Trophy className="h-5 w-5" />
                    </div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">+{a.points} pts</span>
                  </div>
                  <p className="mt-4 font-display text-lg uppercase">{a.name}</p>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Points breakdown</p>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Staking", value: balance.earned.staking },
                    { label: "Activity", value: balance.earned.activity },
                    { label: "Achievements", value: balance.earned.achievements },
                    { label: "Discord", value: balance.earned.discord },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-display text-primary">{row.value.toLocaleString()} pts</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="font-bold uppercase tracking-widest text-xs">Total</span>
                    <span className="font-display text-primary">{balance.total.toLocaleString()} pts</span>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Quick links</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Link href="/forge" className="rounded-2xl border border-border px-4 py-3 text-sm font-medium transition hover:border-primary hover:text-primary">Cub Forge</Link>
                  <Link href="/marketplace" className="rounded-2xl border border-border px-4 py-3 text-sm font-medium transition hover:border-primary hover:text-primary">Browse marketplace</Link>
                  <Link href="/drops" className="rounded-2xl border border-border px-4 py-3 text-sm font-medium transition hover:border-primary hover:text-primary">View drops</Link>
                  <Link href="/mint" className="rounded-2xl border border-border px-4 py-3 text-sm font-medium transition hover:border-primary hover:text-primary">Mint a cub</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit profile modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-border bg-card p-8"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Profile settings</p>
              <h3 className="mt-2 font-display text-3xl uppercase">Edit profile</h3>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Display name</label>
                  <input className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Username</label>
                  <input className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" placeholder="@yourhandle" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Short bio</label>
                  <textarea rows={3} className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" placeholder="Cubs collector, on the hunt." />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setEditOpen(false)} className="rounded-full border border-border px-5 py-2 text-xs font-bold uppercase tracking-widest hover:border-foreground/50">Cancel</button>
                <button onClick={() => setEditOpen(false)} className="rounded-full bg-primary px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:brightness-110">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verify modal */}
      <AnimatePresence>
        {verifyOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setVerifyOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/40">
                <ShieldCheck className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="mt-6 font-display text-3xl uppercase">Get verified</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Verified accounts get a badge, more visibility and trust.
                Connect your social accounts to begin.
              </p>
              <div className="mt-6 grid gap-2">
                <button className="rounded-full border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest transition hover:border-primary">Connect Twitter</button>
                <button className="rounded-full border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest transition hover:border-primary">Connect Discord</button>
              </div>
              <button onClick={() => setVerifyOpen(false)} className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                <Star className="h-3 w-3" />
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
