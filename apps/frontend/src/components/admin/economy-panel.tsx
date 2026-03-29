"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import type { EconomyConfig } from "@/types";

export function EconomyPanel() {
  const [config, setConfig] = useState<EconomyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    basePawsRate: 100,
    dailyClaimAmount: 50,
    dailyClaimCooldownHrs: 24,
    marketplaceFeeBps: 250,
    marketplaceRoyaltyBps: 500,
    pawsTradeBurnPct: 10,
    traitBurnReturnMin: 30,
    traitBurnReturnMax: 60,
    rarityMultipliers: { COMMON: 1, UNCOMMON: 1.25, RARE: 1.5, EPIC: 2, LEGENDARY: 3 } as Record<string, number>,
  });

  useEffect(() => {
    api.get<{ data: EconomyConfig }>("/api/admin/economy")
      .then((res) => {
        const c = res.data;
        setConfig(c);
        setForm({
          basePawsRate: c.basePawsRate,
          dailyClaimAmount: c.dailyClaimAmount,
          dailyClaimCooldownHrs: c.dailyClaimCooldownHrs,
          marketplaceFeeBps: c.marketplaceFeeBps,
          marketplaceRoyaltyBps: c.marketplaceRoyaltyBps,
          pawsTradeBurnPct: c.pawsTradeBurnPct,
          traitBurnReturnMin: c.traitBurnReturnMin,
          traitBurnReturnMax: c.traitBurnReturnMax,
          rarityMultipliers: c.rarityMultipliers as unknown as Record<string, number>,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.put<{ data: EconomyConfig }>("/api/admin/economy", form);
      setConfig(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {} finally { setSaving(false); }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-card" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Economy Config</h2>
          {config && <p className="text-sm text-muted-foreground">Version {config.version} &middot; Last updated {new Date(config.updatedAt).toLocaleString()}</p>}
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-400">Saved!</span>}
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PAWS Rates */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 font-display text-lg">PAWS Rates</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>Base Staking Rate (per cub/day)</span>
                <span className="font-mono text-foreground">{form.basePawsRate}</span>
              </label>
              <input type="range" min={10} max={500} value={form.basePawsRate} onChange={(e) => setForm({ ...form, basePawsRate: parseInt(e.target.value) })} className="w-full" />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>Daily Claim Amount</span>
                <span className="font-mono text-foreground">{form.dailyClaimAmount}</span>
              </label>
              <input type="range" min={0} max={500} value={form.dailyClaimAmount} onChange={(e) => setForm({ ...form, dailyClaimAmount: parseInt(e.target.value) })} className="w-full" />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>Daily Claim Cooldown (hours)</span>
                <span className="font-mono text-foreground">{form.dailyClaimCooldownHrs}h</span>
              </label>
              <input type="range" min={1} max={48} value={form.dailyClaimCooldownHrs} onChange={(e) => setForm({ ...form, dailyClaimCooldownHrs: parseInt(e.target.value) })} className="w-full" />
            </div>
          </div>
        </div>

        {/* Rarity Multipliers */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 font-display text-lg">Rarity Multipliers</h3>
          <div className="space-y-3">
            {Object.entries(form.rarityMultipliers).map(([rarity, mult]) => (
              <div key={rarity}>
                <label className="mb-1 flex justify-between text-sm text-muted-foreground">
                  <span>{rarity}</span>
                  <span className="font-mono text-foreground">{mult}x</span>
                </label>
                <input type="range" min={0.5} max={10} step={0.25} value={mult} onChange={(e) => setForm({ ...form, rarityMultipliers: { ...form.rarityMultipliers, [rarity]: parseFloat(e.target.value) } })} className="w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Marketplace */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 font-display text-lg">Marketplace Fees</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>Platform Fee</span>
                <span className="font-mono text-foreground">{(form.marketplaceFeeBps / 100).toFixed(1)}%</span>
              </label>
              <input type="range" min={0} max={1000} step={25} value={form.marketplaceFeeBps} onChange={(e) => setForm({ ...form, marketplaceFeeBps: parseInt(e.target.value) })} className="w-full" />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>Royalty Fee</span>
                <span className="font-mono text-foreground">{(form.marketplaceRoyaltyBps / 100).toFixed(1)}%</span>
              </label>
              <input type="range" min={0} max={1000} step={25} value={form.marketplaceRoyaltyBps} onChange={(e) => setForm({ ...form, marketplaceRoyaltyBps: parseInt(e.target.value) })} className="w-full" />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>PAWS Trade Burn</span>
                <span className="font-mono text-foreground">{form.pawsTradeBurnPct}%</span>
              </label>
              <input type="range" min={0} max={50} value={form.pawsTradeBurnPct} onChange={(e) => setForm({ ...form, pawsTradeBurnPct: parseInt(e.target.value) })} className="w-full" />
            </div>
          </div>
        </div>

        {/* Trait Burns */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 font-display text-lg">Trait Burn Returns</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>Min Return</span>
                <span className="font-mono text-foreground">{form.traitBurnReturnMin}%</span>
              </label>
              <input type="range" min={0} max={100} value={form.traitBurnReturnMin} onChange={(e) => setForm({ ...form, traitBurnReturnMin: parseInt(e.target.value) })} className="w-full" />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>Max Return</span>
                <span className="font-mono text-foreground">{form.traitBurnReturnMax}%</span>
              </label>
              <input type="range" min={0} max={100} value={form.traitBurnReturnMax} onChange={(e) => setForm({ ...form, traitBurnReturnMax: parseInt(e.target.value) })} className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
