"use client";

import { useState } from "react";
import { DropsPanel } from "@/components/admin/drops-panel";
import { CratesPanel } from "@/components/admin/crates-panel";
import { TraitsPanel } from "@/components/admin/traits-panel";
import { EconomyPanel } from "@/components/admin/economy-panel";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { AuditPanel } from "@/components/admin/audit-panel";

const TABS = [
  { id: "drops", label: "Drops", icon: "🎉" },
  { id: "crates", label: "Crates", icon: "📦" },
  { id: "traits", label: "Traits", icon: "🧬" },
  { id: "economy", label: "Economy", icon: "💰" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "audit", label: "Audit Log", icon: "📋" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("drops");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tight">Admin Panel</h1>
        <p className="mt-2 text-muted-foreground">Manage drops, crates, traits, and the economy</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border/50 bg-card/50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "drops" && <DropsPanel />}
        {activeTab === "crates" && <CratesPanel />}
        {activeTab === "traits" && <TraitsPanel />}
        {activeTab === "economy" && <EconomyPanel />}
        {activeTab === "analytics" && <AnalyticsPanel />}
        {activeTab === "audit" && <AuditPanel />}
      </div>
    </div>
  );
}
