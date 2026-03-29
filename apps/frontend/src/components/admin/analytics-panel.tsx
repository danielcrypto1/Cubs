"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import type { AdminStats, AdminDailyStats } from "@/types";

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}

function MiniChart({ data, dataKey }: { data: AdminDailyStats[]; dataKey: keyof AdminDailyStats }) {
  if (data.length === 0) return <div className="h-24 rounded bg-zinc-800/50" />;

  const values = data.map((d) => Number(d[dataKey]) || 0);
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-24 items-end gap-0.5">
      {values.map((val, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-primary/60 transition-all hover:bg-primary"
          style={{ height: `${(val / max) * 100}%`, minHeight: val > 0 ? "2px" : "0px" }}
          title={`${data[i].date}: ${val.toLocaleString()}`}
        />
      ))}
    </div>
  );
}

export function AnalyticsPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [daily, setDaily] = useState<AdminDailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: AdminStats }>("/api/admin/analytics/stats"),
      api.get<{ data: AdminDailyStats[] }>("/api/admin/analytics/daily?days=30"),
    ])
      .then(([statsRes, dailyRes]) => {
        setStats(statsRes.data);
        setDaily(dailyRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Analytics Dashboard</h2>

      {/* Key Metrics */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total PAWS Earned" value={stats.totalPawsEarned} icon="💰" />
          <StatCard label="Total PAWS Spent" value={stats.totalPawsSpent} icon="🔥" />
          <StatCard label="Crates Opened" value={stats.cratesOpened} icon="📦" />
          <StatCard label="Traits Minted" value={stats.traitsMinted} icon="🧬" />
          <StatCard label="Active Users (7d)" value={stats.activeUsers} icon="👤" />
          <StatCard label="Total Cubs" value={stats.totalCubs} icon="🐻" />
        </div>
      )}

      {/* Daily Charts */}
      {daily.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">PAWS Earned (30d)</h3>
            <MiniChart data={daily} dataKey="totalPawsEarned" />
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">PAWS Spent (30d)</h3>
            <MiniChart data={daily} dataKey="totalPawsSpent" />
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Crates Opened (30d)</h3>
            <MiniChart data={daily} dataKey="cratesOpened" />
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Traits Minted (30d)</h3>
            <MiniChart data={daily} dataKey="traitsMinted" />
          </div>
        </div>
      )}

      {/* Daily Table */}
      {daily.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-card">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Earned</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Spent</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Crates</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Traits</th>
              </tr>
            </thead>
            <tbody>
              {daily.slice(-10).reverse().map((d) => (
                <tr key={d.date} className="border-b border-border/30 hover:bg-card/50">
                  <td className="px-4 py-2 font-mono text-xs">{new Date(d.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right text-xs text-green-400">{d.totalPawsEarned.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-xs text-red-400">{d.totalPawsSpent.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-xs">{d.cratesOpened}</td>
                  <td className="px-4 py-2 text-right text-xs">{d.traitsMinted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
