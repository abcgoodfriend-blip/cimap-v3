import React from "react";
import { useApp } from "@/contexts/AppContext";
import SeverityBar from "@/components/shared/SeverityBar";

function KPI({ label, value, accent, testid }) {
  return (
    <div data-testid={testid} className="px-4 py-2.5 border-l border-white/10 first:border-l-0 flex flex-col justify-center min-w-[120px]">
      <div className="label-micro">{label}</div>
      <div className="font-display text-xl leading-tight tracking-tight mt-0.5" style={{ color: accent || "var(--text-primary)" }}>
        {value ?? "—"}
      </div>
    </div>
  );
}

export default function UnifiedInsightRow() {
  const { kpis, severityDist } = useApp();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] border-b border-white/10" data-testid="unified-insight-row">
      <div className="p-3 border-r border-white/10">
        <SeverityBar data={severityDist} />
      </div>
      <div className="flex overflow-x-auto">
        <KPI testid="kpi-total-signals" label="Total Signals" value={kpis?.total_posts?.toLocaleString()} />
        <KPI testid="kpi-critical-signals" label="Critical" value={kpis?.critical_count} accent="var(--sev-critical)" />
        <KPI testid="kpi-high-risk" label="High Risk" value={kpis?.high_risk_count} accent="var(--sev-high)" />
        <KPI testid="kpi-active-sites" label="Active Sites" value={kpis?.active_sites} />
        <KPI testid="kpi-avg-sentiment" label="Avg Sentiment" value={kpis?.avg_sentiment?.toFixed?.(2) ?? kpis?.avg_sentiment} accent={(kpis?.avg_sentiment ?? 0) < 0 ? "var(--sev-high)" : "var(--sev-low)"} />
        <KPI testid="kpi-posts-24h" label="Posts (24h)" value={kpis?.posts_last_24h} />
      </div>
    </div>
  );
}
