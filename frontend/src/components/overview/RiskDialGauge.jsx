import React from "react";
import { useApp } from "@/contexts/AppContext";

/**
 * Speedometer gauge — 4-color arc + needle + big readable number
 * Stacked layout so the value never overlaps the arc/pin.
 *
 * item: { category | name, avg_risk, critical, signals, subcategories? }
 * type: "category" | "venture"
 */
export default function RiskDialGauge({ item, type = "category" }) {
  const { setSelectedDetail } = useApp();
  const risk = Math.max(0, Math.min(1, item.avg_risk || 0));
  const pct = Math.round(risk * 100);
  const label = item.category || item.name || item.venture || "";

  // Geometry — half circle
  const cx = 70, cy = 70, r = 54;
  const polar = (d) => {
    const a = (d * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const arc = (f, t) => {
    const [x1, y1] = polar(f);
    const [x2, y2] = polar(t);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  const bands = [
    { f: 180, t: 225, c: "var(--sev-low)" },
    { f: 225, t: 270, c: "var(--sev-medium)" },
    { f: 270, t: 315, c: "var(--sev-high)" },
    { f: 315, t: 360, c: "var(--sev-critical)" },
  ];
  const needleAng = 180 + risk * 180;
  const needleRad = (needleAng * Math.PI) / 180;
  const nx = cx + (r - 6) * Math.cos(needleRad);
  const ny = cy + (r - 6) * Math.sin(needleRad);

  const band = risk >= 0.75 ? "CRITICAL" : risk >= 0.5 ? "HIGH" : risk >= 0.25 ? "MEDIUM" : "LOW";
  const bandColor = risk >= 0.75 ? "var(--sev-critical)" : risk >= 0.5 ? "var(--sev-high)" : risk >= 0.25 ? "var(--sev-medium)" : "var(--sev-low)";

  return (
    <button
      type="button"
      data-testid={`risk-dial-${label.replace(/\s+/g, "-")}`}
      onClick={() => setSelectedDetail({ type: type === "venture" ? "venture" : "category", payload: type === "venture" ? { name: label, signals: item.signals, critical: item.critical, avg_risk: item.avg_risk } : item })}
      className="w-full text-left p-3 hover:bg-black/[0.04] transition-colors group block"
    >
      <div className="flex items-start justify-between mb-1">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-display leading-tight truncate text-[var(--text-primary)]">{label}</div>
        </div>
        <span className="label-micro px-1.5 py-0.5 border" style={{ color: bandColor, borderColor: bandColor }}>
          {band}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <svg viewBox="0 0 140 82" className="w-[120px] h-[70px] shrink-0">
          <path d={arc(180, 360)} stroke="rgba(0,0,0,0.06)" strokeWidth="11" fill="none" />
          {bands.map((b, i) => (
            <path key={i} d={arc(b.f, b.t)} stroke={b.c} strokeWidth="10" fill="none" />
          ))}
          {/* Needle */}
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="4" fill="var(--text-primary)" />
          <circle cx={cx} cy={cy} r="1.7" fill="var(--bg-surface)" />
        </svg>

        <div>
          <div className="font-display text-[26px] leading-none" style={{ color: bandColor }}>{pct}</div>
          <div className="label-micro mt-0.5">Risk Index</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--text-secondary)]">
        <span className="sev-critical">● {item.critical || 0}</span>
        <span>{item.signals || 0} signals</span>
        <span className="ml-auto text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">Drill →</span>
      </div>
    </button>
  );
}
