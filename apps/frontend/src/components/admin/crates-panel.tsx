"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import type { CrateDefinition, CrateReward } from "@/types";

interface CrateWithRewards extends CrateDefinition {
  rewards: CrateReward[];
  _count?: { userCrates: number };
}

export function CratesPanel() {
  const [crates, setCrates] = useState<CrateWithRewards[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", rarity: "COMMON", description: "", imageUrl: "",
    priceAmount: "100", maxSupply: "", type: "STANDARD", isBase: false,
  });
  const [rewardForm, setRewardForm] = useState({
    rewardType: "TRAIT" as string, weight: 10,
    traitRarity: "COMMON", pawsAmount: 0, pawsMin: 0, pawsMax: 0,
  });
  const [saving, setSaving] = useState(false);

  const fetchCrates = useCallback(() => {
    api.get<{ data: CrateWithRewards[] }>("/api/admin/crates")
      .then((res) => setCrates(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCrates(); }, [fetchCrates]);

  const handleCreateCrate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/admin/crates", {
        name: form.name, rarity: form.rarity, description: form.description || undefined,
        imageUrl: form.imageUrl || "https://placeholder.co/256x256",
        priceAmount: form.priceAmount, type: form.type,
        maxSupply: form.maxSupply ? parseInt(form.maxSupply) : undefined,
        isBase: form.isBase,
      });
      setShowForm(false);
      fetchCrates();
    } catch {} finally { setSaving(false); }
  };

  const handleAddReward = async (crateId: string) => {
    try {
      await api.post(`/api/admin/crates/${crateId}/rewards`, {
        rewardType: rewardForm.rewardType,
        weight: rewardForm.weight,
        ...(rewardForm.rewardType === "TRAIT" && { traitRarity: rewardForm.traitRarity }),
        ...(rewardForm.rewardType === "PAWS" && {
          pawsAmount: rewardForm.pawsAmount || undefined,
          pawsMin: rewardForm.pawsMin || undefined,
          pawsMax: rewardForm.pawsMax || undefined,
        }),
      });
      fetchCrates();
    } catch {}
  };

  const handleDeleteReward = async (crateId: string, rewardId: string) => {
    try {
      await api.get(`/api/admin/crates/${crateId}/rewards/${rewardId}`);
      fetchCrates();
    } catch {}
  };

  const totalWeight = (rewards: CrateReward[]) => rewards.reduce((s, r) => s + r.weight, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Crate Builder</h2>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "+ New Crate"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateCrate} className="space-y-4 rounded-xl border border-border/50 bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Rarity</label>
              <select value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {["STANDARD", "PREMIUM", "GENESIS", "EVENT"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Price (PAWS)</label>
              <input value={form.priceAmount} onChange={(e) => setForm({ ...form, priceAmount: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Max Supply (blank = unlimited)</label>
              <input value={form.maxSupply} onChange={(e) => setForm({ ...form, maxSupply: e.target.value })} type="number" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isBase} onChange={(e) => setForm({ ...form, isBase: e.target.checked })} className="rounded" />
                Base Crate (always available)
              </label>
            </div>
          </div>
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {saving ? "Creating..." : "Create Crate"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-card" />)}</div>
      ) : (
        <div className="space-y-3">
          {crates.map((crate) => (
            <div key={crate.id} className="rounded-xl border border-border/50 bg-card">
              <button onClick={() => setExpandedId(expandedId === crate.id ? null : crate.id)} className="flex w-full items-center justify-between p-4 text-left">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{crate.name}</h3>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs">{crate.rarity}</span>
                    <span className="text-xs text-amber-400">{Number(crate.priceAmount).toLocaleString()} PAWS</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {crate.rewards.length} rewards &middot; Supply: {crate.currentSupply}/{crate.maxSupply ?? "∞"}
                  </p>
                </div>
                <span className="text-muted-foreground">{expandedId === crate.id ? "▲" : "▼"}</span>
              </button>

              {expandedId === crate.id && (
                <div className="border-t border-border/50 p-4">
                  <h4 className="mb-3 text-sm font-medium">Rewards (Total Weight: {totalWeight(crate.rewards)})</h4>
                  {crate.rewards.length > 0 ? (
                    <div className="mb-4 space-y-2">
                      {crate.rewards.map((reward) => {
                        const total = totalWeight(crate.rewards);
                        const pct = total > 0 ? ((reward.weight / total) * 100).toFixed(1) : "0";
                        return (
                          <div key={reward.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">{reward.rewardType}</span>
                              {reward.traitRarity && <span className="text-xs text-muted-foreground">{reward.traitRarity}</span>}
                              {reward.pawsAmount && <span className="text-xs text-amber-400">{reward.pawsAmount} PAWS</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-20 rounded-full bg-zinc-700">
                                  <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{pct}%</span>
                              </div>
                              <button onClick={() => handleDeleteReward(crate.id, reward.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mb-4 text-sm text-muted-foreground">No rewards configured</p>
                  )}

                  <div className="flex flex-wrap items-end gap-3 border-t border-border/30 pt-4">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Type</label>
                      <select value={rewardForm.rewardType} onChange={(e) => setRewardForm({ ...rewardForm, rewardType: e.target.value })} className="rounded border border-border bg-background px-2 py-1.5 text-xs">
                        <option value="TRAIT">TRAIT</option>
                        <option value="PAWS">PAWS</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Weight</label>
                      <input type="number" value={rewardForm.weight} onChange={(e) => setRewardForm({ ...rewardForm, weight: parseInt(e.target.value) || 0 })} className="w-20 rounded border border-border bg-background px-2 py-1.5 text-xs" />
                    </div>
                    {rewardForm.rewardType === "TRAIT" && (
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Trait Rarity</label>
                        <select value={rewardForm.traitRarity} onChange={(e) => setRewardForm({ ...rewardForm, traitRarity: e.target.value })} className="rounded border border-border bg-background px-2 py-1.5 text-xs">
                          {["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"].map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    )}
                    {rewardForm.rewardType === "PAWS" && (
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Amount</label>
                        <input type="number" value={rewardForm.pawsAmount} onChange={(e) => setRewardForm({ ...rewardForm, pawsAmount: parseInt(e.target.value) || 0 })} className="w-24 rounded border border-border bg-background px-2 py-1.5 text-xs" />
                      </div>
                    )}
                    <button onClick={() => handleAddReward(crate.id)} className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Add Reward</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {crates.length === 0 && <p className="py-8 text-center text-muted-foreground">No crates created yet</p>}
        </div>
      )}
    </div>
  );
}
