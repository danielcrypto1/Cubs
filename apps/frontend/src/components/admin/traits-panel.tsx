"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import type { TraitDefinition } from "@/types";

const CATEGORIES = ["BACKGROUND", "BODY", "OUTFIT", "SHOES", "ACCESSORIES", "HAT", "EYES", "MOUTH", "SPECIAL"];
const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"];

export function TraitsPanel() {
  const [traits, setTraits] = useState<TraitDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterRarity, setFilterRarity] = useState("");
  const [form, setForm] = useState({
    name: "", category: "BODY", rarity: "COMMON", rarityWeight: "1",
    maxSupply: "100", imageUrl: "", boostType: "NONE", boostValue: "0",
    isFullBody: false,
  });
  const [saving, setSaving] = useState(false);

  const fetchTraits = useCallback(() => {
    const params = new URLSearchParams();
    if (filterCategory) params.set("category", filterCategory);
    if (filterRarity) params.set("rarity", filterRarity);
    const qs = params.toString();
    api.get<{ data: TraitDefinition[] }>(`/api/admin/traits${qs ? `?${qs}` : ""}`)
      .then((res) => setTraits(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterCategory, filterRarity]);

  useEffect(() => { fetchTraits(); }, [fetchTraits]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/admin/traits", {
        name: form.name, category: form.category, rarity: form.rarity,
        rarityWeight: parseFloat(form.rarityWeight), maxSupply: parseInt(form.maxSupply),
        imageUrl: form.imageUrl || "https://placeholder.co/256x256",
        boostType: form.boostType, boostValue: parseFloat(form.boostValue),
        isFullBody: form.isFullBody,
      });
      setShowForm(false);
      fetchTraits();
    } catch {} finally { setSaving(false); }
  };

  const rarityColors: Record<string, string> = {
    COMMON: "text-zinc-400", UNCOMMON: "text-green-400", RARE: "text-blue-400",
    EPIC: "text-purple-400", LEGENDARY: "text-amber-400",
  };

  const filtered = traits;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Trait Manager</h2>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "+ New Trait"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-border/50 bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Category (Slot)</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Rarity</label>
              <select value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Rarity Weight</label>
              <input type="number" step="0.1" value={form.rarityWeight} onChange={(e) => setForm({ ...form, rarityWeight: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Max Supply</label>
              <input type="number" value={form.maxSupply} onChange={(e) => setForm({ ...form, maxSupply: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Image URL</label>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="https://..." />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Boost Type</label>
              <select value={form.boostType} onChange={(e) => setForm({ ...form, boostType: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {["NONE", "PAWS_MULTIPLIER", "PAWS_FLAT", "LUCK"].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Boost Value</label>
              <input type="number" step="0.1" value={form.boostValue} onChange={(e) => setForm({ ...form, boostValue: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isFullBody} onChange={(e) => setForm({ ...form, isFullBody: e.target.checked })} className="rounded" />
                Full Body (Onsie)
              </label>
            </div>
          </div>
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {saving ? "Creating..." : "Create Trait"}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">All Rarities</option>
          {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className="flex items-center text-sm text-muted-foreground">{filtered.length} traits</span>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-card" />)}</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-card">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rarity</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Supply</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Boost</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trait) => (
                <tr key={trait.id} className="border-b border-border/30 hover:bg-card/50">
                  <td className="px-4 py-3 font-medium">{trait.name}{trait.isFullBody && <span className="ml-1 text-xs text-amber-400">(Onsie)</span>}</td>
                  <td className="px-4 py-3 text-xs">{trait.category}</td>
                  <td className={`px-4 py-3 text-xs font-semibold ${rarityColors[trait.rarity] ?? ""}`}>{trait.rarity}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{trait.currentSupply}/{trait.maxSupply}</span>
                      <div className="h-1.5 w-16 rounded-full bg-zinc-800">
                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, (trait.currentSupply / trait.maxSupply) * 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {trait.boostType !== "NONE" ? `${trait.boostType}: ${trait.boostValue}` : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No traits found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
