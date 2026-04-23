import React from "react";
import { useApp } from "@/contexts/AppContext";
import SeverityBar from "@/components/shared/SeverityBar";
import { BriefingButton, ActionsButton } from "@/components/ai/FloatingInsights";

function KPI({ label, value, accent, testid, onClick, clickable = true }) {
  const Comp = clickable ? "button" : "div";
  return (
    <Comp
      type={clickable ? "button" : undefined}
      onClick={onClick}
      data-testid={testid}
      className={`flex-1 basis-0 min-w-0 px-3 py-2 border-l border-hair first:border-l-0 flex flex-col justify-center text-left ${clickable ? "hover:bg-black/[0.035] cursor-pointer" : ""}`}
    >
      <div className="label-micro truncate">{label}</div>
      <div className="font-display text-lg lg:text-xl leading-tight tracking-tight mt-0.5 truncate" style={{ color: accent || "var(--text-primary)" }}>
        {value ?? "—"}
      </div>
    </Comp>
  );
}

export default function UnifiedInsightRow() {
  const { kpis, severityDist, setSelectedDetail, setActiveTab, patchFilters } = useApp();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_2.6fr] border-b border-hair" data-testid="unified-insight-row">
      <div className="p-3 border-r border-hair">
        <SeverityBar data={severityDist} />
      </div>
      <div className="flex items-stretch">
        <KPI
          testid="kpi-total-signals"
          label="Total Signals"
          value={kpis?.total_posts?.toLocaleString()}
          onClick={() => setSelectedDetail({ type: "severity", payload: { severity: "critical", count: kpis?.critical_count } })}
        />
        <KPI
          testid="kpi-critical-signals"
          label="Critical"
          value={kpis?.critical_count}
          accent="var(--sev-critical)"
          onClick={() => setSelectedDetail({ type: "severity", payload: { severity: "critical", count: kpis?.critical_count } })}
        />
        <KPI
          testid="kpi-high-risk"
          label="High Risk"
          value={kpis?.high_risk_count}
          accent="var(--sev-high)"
          onClick={() => setSelectedDetail({ type: "severity", payload: { severity: "high", count: kpis?.high_risk_count } })}
        />
        <KPI
          testid="kpi-active-sites"
          label="Active Sites"
          value={kpis?.active_sites}
          onClick={() => setActiveTab("map")}
        />
        <KPI
          testid="kpi-avg-sentiment"
          label="Avg Sentiment"
          value={kpis?.avg_sentiment?.toFixed?.(2) ?? kpis?.avg_sentiment}
          accent={(kpis?.avg_sentiment ?? 0) < 0 ? "var(--sev-high)" : "var(--sev-low)"}
          onClick={() => setActiveTab("analysis")}
        />
        <KPI
          testid="kpi-posts-24h"
          label="Posts (24h)"
          value={kpis?.posts_last_24h}
          onClick={() => patchFilters({ window: "24h" })}
        />

        {/* Briefing + Actions occupy the last two equal cells */}
        <div className="flex-1 basis-0 min-w-0 border-l border-hair flex items-center justify-center p-1">
          <BriefingButton />
        </div>
        <div className="flex-1 basis-0 min-w-0 border-l border-hair flex items-center justify-center p-1">
          <ActionsButton />
        </div>
      </div>
    </div>
  );
}
