"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import type { Drop } from "@/types";

export function DropsPanel() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", bannerImage: "", themeColor: "#6d28d9",
    startTime: "", endTime: "", isFeatured: false, status: "DRAFT" as string,
  });
  const [saving, setSaving] = useState(false);

  const fetchDrops = useCallback(() => {
    api.get<{ data: Drop[] }>("/api/admin/drops")
      .then((res) => setDrops(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDrops(); }, [fetchDrops]);

  const resetForm = () => {
    setForm({ name: "", description: "", bannerImage: "", themeColor: "#6d28d9", startTime: "", endTime: "", isFeatured: false, status: "DRAFT" });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (drop: Drop) => {
    setForm({
      name: drop.name,
      description: drop.description ?? "",
      bannerImage: drop.bannerImage ?? "",
      themeColor: drop.themeColor ?? "#6d28d9",
      startTime: drop.startTime ? new Date(drop.startTime).toISOString().slice(0, 16) : "",
      endTime: drop.endTime ? new Date(drop.endTime).toISOString().slice(0, 16) : "",
      isFeatured: drop.isFeatured,
      status: drop.status,
    });
    setEditId(drop.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        bannerImage: form.bannerImage || undefined,
        themeColor: form.themeColor || undefined,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        isFeatured: form.isFeatured,
        status: form.status,
      };

      if (editId) {
        await api.put(`/api/admin/drops/${editId}`, payload);
      } else {
        await api.post("/api/admin/drops", payload);
      }
      resetForm();
      fetchDrops();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-zinc-500/20 text-zinc-400",
    SCHEDULED: "bg-blue-500/20 text-blue-400",
    LIVE: "bg-green-500/20 text-green-400",
    ENDED: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Drop Management</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "+ New Drop"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border/50 bg-card p-6">
          <h3 className="font-display text-lg">{editId ? "Edit Drop" : "Create Drop"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Theme Color</label>
              <div className="flex gap-2">
                <input type="color" value={form.themeColor} onChange={(e) => setForm({ ...form, themeColor: e.target.value })} className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent" />
                <input value={form.themeColor} onChange={(e) => setForm({ ...form, themeColor: e.target.value })} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-muted-foreground">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-muted-foreground">Banner Image URL</label>
              <input value={form.bannerImage} onChange={(e) => setForm({ ...form, bannerImage: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="https://..." />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Start Time</label>
              <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">End Time</label>
              <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="LIVE">Live</option>
                <option value="ENDED">Ended</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded" />
                Featured Drop
              </label>
            </div>
          </div>
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {saving ? "Saving..." : editId ? "Update Drop" : "Create Drop"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-card" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {drops.map((drop) => (
            <div key={drop.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg" style={{ background: drop.themeColor ? `linear-gradient(135deg, ${drop.themeColor}, transparent)` : "#333" }} />
                <div>
                  <h3 className="font-medium">{drop.name}</h3>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[drop.status] ?? ""}`}>{drop.status}</span>
                    {drop.isFeatured && <span className="text-amber-400">Featured</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => handleEdit(drop)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent">
                Edit
              </button>
            </div>
          ))}
          {drops.length === 0 && <p className="py-8 text-center text-muted-foreground">No drops created yet</p>}
        </div>
      )}
    </div>
  );
}
