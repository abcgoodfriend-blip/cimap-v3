import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "@/contexts/AppContext";
import { Sparkles, TrendingUp, Flame, Target, AlertTriangle, Gavel, Megaphone, ShieldAlert, X } from "lucide-react";

function Fab({ icon: Icon, label, bottom, testid, accent, onClick, count }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className="fixed right-48 z-[60] flex items-center gap-2 px-3 py-2.5 border border-hair shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.18)] transition-shadow"
      style={{ bottom, background: accent?.bg || "var(--bg-surface)", color: accent?.fg || "var(--text-primary)" }}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs font-semibold tracking-widest uppercase">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="ml-1 text-[9px] font-semibold px-1.5 py-0.5 bg-[var(--sev-critical)]" style={{ color: "#fff" }}>{count}</span>
      )}
    </button>
  );
}

function Panel({ open, onClose, title, subtitle, testid, bottom, children }) {
  if (!open) return null;
  return createPortal(
    <div
      data-testid={testid}
      className="fixed right-5 z-[62] w-[440px] max-w-[calc(100vw-2rem)] glass flex flex-col"
      style={{ bottom, maxHeight: "calc(100vh - 6rem)" }}
    >
      <div className="flex items-center justify-between p-3 border-b border-hair">
        <div>
          <div className="font-display text-sm">{title}</div>
          <div className="label-micro">{subtitle}</div>
        </div>
        <button data-testid={`${testid}-close`} onClick={onClose} className="p-1 hover:bg-black/5">
          <X className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </div>
      <div className="p-3 overflow-y-auto">{children}</div>
    </div>,
    document.body
  );
}

function BriefingContent() {
  const { kpis, categoryDist, locations, posts } = useApp();

  const insights = useMemo(() => {
    const out = [];
    if (categoryDist?.[0]) {
      const top = categoryDist[0];
      if (top.critical > 0) {
        out.push({
          icon: Flame, color: "var(--sev-critical)",
          text: `${top.category} is driving the most critical signals (${top.critical}). Avg risk ${top.avg_risk?.toFixed ? top.avg_risk.toFixed(2) : top.avg_risk}.`,
        });
      }
    }
    if (locations?.states?.length) {
      const topState = [...locations.states].sort((a, b) => b.critical - a.critical)[0];
      if (topState) {
        out.push({
          icon: TrendingUp, color: "var(--sev-high)",
          text: `Critical pressure concentrated in ${topState.state}: ${topState.critical} critical across ${topState.sites || 0} sites.`,
        });
      }
    }
    const negCount = (posts || []).filter((p) => p.sentiment < -0.2).length;
    if (negCount > 0) {
      out.push({
        icon: Sparkles, color: "var(--text-primary)",
        text: `${negCount} posts trending negatively in current window — recommend PR narrative sweep.`,
      });
    }
    const posCount = (posts || []).filter((p) => p.sentiment > 0.3).length;
    if (posCount > 0) {
      out.push({
        icon: Sparkles, color: "var(--sev-low)",
        text: `${posCount} supportive signals detected — opportunity to amplify positive narrative.`,
      });
    }
    const critRatio = kpis?.total_posts ? (kpis.critical_count / kpis.total_posts) : 0;
    if (critRatio > 0.25) {
      out.push({
        icon: Flame, color: "var(--sev-critical)",
        text: `Critical ratio at ${Math.round(critRatio * 100)}% — elevated system-wide risk posture.`,
      });
    }
    if (!out.length) out.push({ icon: Sparkles, color: "var(--text-primary)", text: "No critical patterns detected. Continue monitoring." });
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
    <div className="space-y-2">
      {recs.map((r, i) => (
        <button
          key={i}
          type="button"
          data-testid={`action-card-${i}`}
          onClick={() => { if (r.action) { r.action(); onClose(); } }}
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

export default function FloatingInsights() {
  const [which, setWhich] = useState(null);
  const { categoryDist } = useApp();
  const actionsCount = categoryDist?.length ? Math.min(4, categoryDist.length) : 0;

  return (
    <>
      <Fab
        icon={Sparkles} label="Briefing" testid="fab-briefing"
        bottom={144}
        onClick={() => setWhich(which === "brief" ? null : "brief")}
      />
      <Fab
        icon={Target} label="Actions" testid="fab-actions"
        bottom={88}
        accent={{ bg: "var(--sev-critical)", fg: "#fff" }}
        count={actionsCount}
        onClick={() => setWhich(which === "actions" ? null : "actions")}
      />

      <Panel
        open={which === "brief"}
        onClose={() => setWhich(null)}
        title="Executive Briefing"
        subtitle="Auto-generated insights"
        testid="panel-briefing"
        bottom={200}
      >
        <BriefingContent />
      </Panel>
      <Panel
        open={which === "actions"}
        onClose={() => setWhich(null)}
        title="Recommended Actions"
        subtitle="Tactical moves · click to drill down"
        testid="panel-actions"
        bottom={144}
      >
        <ActionsContent onClose={() => setWhich(null)} />
      </Panel>
    </>
  );
}
