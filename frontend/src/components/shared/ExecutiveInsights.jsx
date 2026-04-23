import React, { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Sparkles, TrendingUp, Flame } from "lucide-react";

export default function ExecutiveInsights() {
  const { kpis, categoryDist, locations, posts } = useApp();

  const insights = useMemo(() => {
    const out = [];
    if (categoryDist?.length) {
      const top = categoryDist[0];
      if (top && top.critical > 0) {
        out.push({
          icon: Flame,
          color: "var(--sev-critical)",
          text: `${top.category} driving the most critical signals (${top.critical}). Avg risk ${top.avg_risk?.toFixed?.(2) ?? top.avg_risk}.`,
        });
      }
    }
    if (locations?.states?.length) {
      const topState = [...locations.states].sort((a, b) => b.critical - a.critical)[0];
      if (topState) {
        out.push({
          icon: TrendingUp,
          color: "var(--sev-high)",
          text: `Critical pressure concentrated in ${topState.state}: ${topState.critical} critical across ${topState.sites || 0} sites.`,
        });
      }
    }
    const negCount = (posts || []).filter((p) => p.sentiment < -0.2).length;
    if (negCount > 0) {
      out.push({
        icon: Sparkles,
        color: "#fff",
        text: `${negCount} posts trending negatively in current window — recommend PR narrative sweep.`,
      });
    }
    if (!out.length) {
      out.push({ icon: Sparkles, color: "#fff", text: "Awaiting signal — no critical patterns detected yet." });
    }
    return out.slice(0, 3);
  }, [kpis, categoryDist, locations, posts]);

  return (
    <div data-testid="executive-insights" className="mb-4 border border-white/10 bg-[var(--bg-surface)]">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 bg-black/30">
        <Sparkles className="w-3.5 h-3.5 text-[var(--sev-medium)]" />
        <span className="label-micro">Auto-Generated Executive Briefing</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
        {insights.map((i, idx) => (
          <div key={idx} className="bg-[var(--bg-surface)] p-3 flex items-start gap-2.5">
            <i.icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: i.color }} />
            <div className="text-xs text-white/80 leading-relaxed">{i.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
