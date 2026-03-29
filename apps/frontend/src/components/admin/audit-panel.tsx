"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import type { AuditLog } from "@/types";

interface AuditResponse {
  logs: (AuditLog & { admin?: { walletAddress: string; displayName: string | null } })[];
  total: number;
  page: number;
  limit: number;
}

export function AuditPanel() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filterType) params.set("targetType", filterType);
    api.get<{ data: AuditResponse }>(`/api/admin/audit-logs?${params}`)
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filterType]);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Audit Log</h2>
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">All Types</option>
          <option value="Drop">Drops</option>
          <option value="CrateDefinition">Crates</option>
          <option value="TraitDefinition">Traits</option>
          <option value="EconomyConfig">Economy</option>
          <option value="CrateReward">Rewards</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-card" />)}</div>
      ) : data && data.logs.length > 0 ? (
        <>
          <div className="space-y-2">
            {data.logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-border/30 bg-card px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">{log.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {log.targetType} &middot; {log.targetId.slice(0, 8)}...
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                {log.admin && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    by {log.admin.displayName || `${log.admin.walletAddress.slice(0, 6)}...${log.admin.walletAddress.slice(-4)}`}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50">
                Previous
              </button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50">
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="py-8 text-center text-muted-foreground">No audit logs found</p>
      )}
    </div>
  );
}
