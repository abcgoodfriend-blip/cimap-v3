import React, { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sparkles, TrendingUp, Flame, Target, AlertTriangle, Gavel, Megaphone, ShieldAlert } from "lucide-react";

function BriefingContent() {
  const { kpis, categoryDist, locations, posts } = useApp();

  const insights = useMemo(() => {
    const out = [];
    if (categoryDist?.[0]) {
      const top = categoryDist[0];
      if (top.critical > 0) out.push({
        icon: Flame, color: "var(--sev-critical)",
        text: `${top.category} is driving the most critical signals (${top.critical}). Avg risk ${top.avg_risk?.toFixed ? top.avg_risk.toFixed(2) : top.avg_risk}.`,
      });
    }
    if (locations?.states?.length) {
      const topState = [...locations.states].sort((a, b) => b.critical - a.critical)[0];
      if (topState) out.push({
        icon: TrendingUp, color: "var(--sev-high)",
        text: `Critical pressure concentrated in ${topState.state}: ${topState.critical} critical across ${topState.sites || 0} sites.`,
      });
    }
    const negCount = (posts || []).filter((p) => p.sentiment < -0.2).length;
    if (negCount > 0) out.push({
      icon: Sparkles, color: "var(--text-primary)",
      text: `${negCount} posts trending negatively in current window — recommend PR narrative sweep.`,
    });
    const posCount = (posts || []).filter((p) => p.sentiment > 0.3).length;
    if (posCount > 0) out.push({
      icon: Sparkles, color: "var(--sev-low)",
      text: `${posCount} supportive signals detected — opportunity to amplify positive narrative.`,
    });
    const critRatio = kpis?.total_posts ? (kpis.critical_count / kpis.total_posts) : 0;
    if (critRatio > 0.25) out.push({
      icon: Flame, color: "var(--sev-critical)",
      text: `Critical ratio at ${Math.round(critRatio * 100)}% — elevated system-wide risk posture.`,
    });
    if (!out.length) out.push({ icon: Sparkles, color: "var(--text-primary)", text: "No critical patterns detected." });
    return out.slice(0, 6);
  }, [kpis, categoryDist, locations, posts]);

  return (
    <div className="space-y-2">
      {insights.map((i, idx) => (
        <div key={idx} className="flex items-start gap-2.5 p-2.5 border border-hair bg-[var(--bg-surface)]">
          <i.icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: i.color }} />
          <div className="text-xs text-[var(--text-primary)] leading-relaxed">{i.text}</div>
        </div>
      ))}
    </div>
  );
}

function ActionsContent({ onClose }) {
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
    if (topState) out.push({
      icon: AlertTriangle, color: "var(--sev-high)", severity: "48H",
      title: `Deploy ground team to ${topState.state}`,
      detail: `${topState.critical} critical across ${topState.sites} sites · sentiment ${topState.sentiment}. On-ground stakeholder engagement.`,
      action: () => setSelectedDetail({ type: "state", payload: topState }),
    });
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
    if (negCount > 0) out.push({
      icon: Megaphone, color: "var(--text-primary)", severity: "THIS WEEK",
      title: `Activate counter-narrative program`,
      detail: `${negCount} sharply-negative signals in window. Align owned media + influencer push with factual rebuttals.`,
      action: null,
    });
    return out.slice(0, 4);
  }, [categoryDist, locations, ventureDist, posts, setSelectedDetail]);

  return (
    <div className="space-y-2">
      {recs.map((r, i) => (
        <button
          key={i}
          type="button"
          data-testid={`action-card-${i}`}
          onClick={() => { if (r.action) { r.action(); onClose && onClose(); } }}
          disabled={!r.action}
          className="w-full text-left p-2.5 border border-hair bg-[var(--bg-surface)] hover:bg-black/[0.03] disabled:cursor-default"
        >
          <div className="flex items-center gap-2 mb-1">
            <r.icon className="w-3.5 h-3.5" style={{ color: r.color }} />
            <span className="label-micro" style={{ color: r.color }}>{r.severity}</span>
            <Target className="w-3 h-3 text-[var(--text-muted)] ml-auto" />
          </div>
          <div className="text-[12px] font-display text-[var(--text-primary)] leading-tight">{r.title}</div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">{r.detail}</div>
        </button>
      ))}
    </div>
  );
}

export function BriefingButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          data-testid="fab-briefing"
          className="flex items-center gap-1.5 px-2.5 h-8 text-xs border border-hair hover:bg-black/[0.03] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="uppercase tracking-[0.15em] text-[10px]">Briefing</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        data-testid="panel-briefing"
        className="w-[420px] max-w-[calc(100vw-2rem)] p-3 rounded-none bg-[var(--bg-app)] border-hair text-[var(--text-primary)]"
      >
        <div className="label-micro mb-2">Executive Briefing · Auto-generated insights</div>
        <BriefingContent />
      </PopoverContent>
    </Popover>
  );
}

export function ActionsButton() {
  const [open, setOpen] = React.useState(false);
  const { categoryDist } = useApp();
  const count = categoryDist?.length ? Math.min(4, categoryDist.length) : 0;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          data-testid="fab-actions"
          className="flex items-center gap-1.5 px-2.5 h-8 text-xs border border-hair hover:bg-black/[0.03] transition-colors"
          style={{ background: "var(--sev-critical)", color: "#fff", borderColor: "var(--sev-critical)" }}
        >
          <Target className="w-3.5 h-3.5" />
          <span className="uppercase tracking-[0.15em] text-[10px]">Actions</span>
          {count > 0 && (
            <span className="text-[9px] font-semibold px-1 ml-0.5" style={{ background: "#fff", color: "var(--sev-critical)" }}>{count}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        data-testid="panel-actions"
        className="w-[420px] max-w-[calc(100vw-2rem)] p-3 rounded-none bg-[var(--bg-app)] border-hair text-[var(--text-primary)]"
      >
        <div className="label-micro mb-2">Recommended Actions · click to drill down</div>
        <ActionsContent onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
