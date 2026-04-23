import React, { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import RiskDialGauge from "./RiskDialGauge";
import HierarchyTree from "./HierarchyTree";
import { AlertTriangle, Gavel, Megaphone, ShieldAlert } from "lucide-react";

function ExecutiveActions() {
  const { categoryDist, locations, ventureDist, posts, setSelectedDetail } = useApp();

  const recs = useMemo(() => {
    const out = [];
    if (categoryDist[0]) {
      const top = categoryDist[0];
      out.push({
        icon: ShieldAlert, color: "var(--sev-critical)", severity: "IMMEDIATE",
        title: `Contain narrative: ${top.category}`,
        detail: `${top.critical} critical / ${top.signals} signals · avg risk ${top.avg_risk?.toFixed ? top.avg_risk.toFixed(2) : top.avg_risk}. Coordinate legal + comms.`,
        action: () => setSelectedDetail({ type: "category", payload: top }),
      });
    }
    const topState = [...(locations.states || [])].sort((a, b) => b.critical - a.critical)[0];
    if (topState) {
      out.push({
        icon: AlertTriangle, color: "var(--sev-high)", severity: "48H",
        title: `Deploy ground team to ${topState.state}`,
        detail: `${topState.critical} critical across ${topState.sites} sites · sentiment ${topState.sentiment}. On-ground stakeholder engagement.`,
        action: () => setSelectedDetail({ type: "state", payload: topState }),
      });
    }
    if (ventureDist[0]) {
      const v = ventureDist[0];
      out.push({
        icon: Gavel, color: "var(--sev-high)", severity: "72H",
        title: `Pre-emptive brief: ${v.category}`,
        detail: `Most exposed venture — ${v.critical} critical. Prepare board statement and regulator comms.`,
        action: () => setSelectedDetail({ type: "venture", payload: { name: v.category, signals: v.signals, critical: v.critical } }),
      });
    }
    const negCount = (posts || []).filter((p) => p.sentiment < -0.3).length;
    if (negCount > 0) {
      out.push({
        icon: Megaphone, color: "var(--text-primary)", severity: "THIS WEEK",
        title: `Activate counter-narrative program`,
        detail: `${negCount} sharply-negative signals in window. Align owned media + influencer push with factual rebuttals.`,
        action: null,
      });
    }
    return out.slice(0, 4);
  }, [categoryDist, locations, ventureDist, posts, setSelectedDetail]);

  return (
    <div data-testid="executive-actions" className="panel">
      <div className="flex items-center justify-between px-3 py-2 border-b border-hair">
        <div className="label-micro">Executive Actions · Recommended</div>
        <div className="label-micro">Auto-derived from current signal</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-px bg-[var(--border-default)]">
        {recs.map((r, i) => (
          <button
            key={i}
            type="button"
            onClick={r.action || undefined}
            disabled={!r.action}
            className="bg-[var(--bg-surface)] p-3 text-left hover:bg-black/[0.03] disabled:cursor-default"
          >
            <div className="flex items-center gap-2 mb-1">
              <r.icon className="w-3.5 h-3.5" style={{ color: r.color }} />
              <span className="label-micro" style={{ color: r.color }}>{r.severity}</span>
            </div>
            <div className="text-[12px] font-display text-[var(--text-primary)] leading-tight">{r.title}</div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">{r.detail}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OverviewTab() {
  const { categoryDist, ventureDist } = useApp();

  return (
    <div className="space-y-4" data-testid="overview-tab">
      <ExecutiveActions />

      <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-4">
        <div className="space-y-4">
          <section className="panel p-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="label-micro">Risk Dial · By Category</div>
                <h3 className="font-display text-lg">Category Risk Landscape</h3>
              </div>
              <div className="label-micro">{categoryDist.length} categories</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-px bg-[var(--border-default)]">
              {categoryDist.map((c) => (
                <div key={c.category} className="bg-[var(--bg-surface)]">
                  <RiskDialGauge item={c} type="category" />
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="label-micro">Risk Dial · By Venture</div>
                <h3 className="font-display text-lg">Venture Risk Landscape</h3>
              </div>
              <div className="label-micro">{ventureDist.length} ventures</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-px bg-[var(--border-default)]">
              {ventureDist.map((v) => (
                <div key={v.category} className="bg-[var(--bg-surface)]">
                  <RiskDialGauge item={v} type="venture" />
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="panel p-3 h-fit">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="label-micro">Hierarchical Drilldown</div>
              <h3 className="font-display text-lg">Venture → Site → Category</h3>
            </div>
            <div className="label-micro">Sorted by severity</div>
          </div>
          <HierarchyTree />
        </section>
      </div>
    </div>
  );
}
