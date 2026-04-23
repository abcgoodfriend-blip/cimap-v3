import React from "react";
import { useApp } from "@/contexts/AppContext";

function color(risk) {
  if (risk >= 0.75) return "var(--sev-critical)";
  if (risk >= 0.55) return "var(--sev-high)";
  if (risk >= 0.35) return "var(--sev-medium)";
  return "var(--sev-low)";
}

export default function RiskDialGauge({ item }) {
  const { setSelectedDetail } = useApp();
  const risk = Math.max(0, Math.min(1, item.avg_risk || 0));
  const pct = Math.round(risk * 100);
  const c = color(risk);

  // Build an SVG half-donut
  const R = 44;
  const C = Math.PI * R; // semicircle circumference
  const dash = C * risk;

  return (
    <button
      type="button"
      data-testid={`risk-dial-${(item.category || "").replace(/\s+/g, "-")}`}
      onClick={() => setSelectedDetail({ type: "category", payload: item })}
      className="w-full text-left p-3 hover:bg-white/5 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className="relative w-[110px] h-[62px] shrink-0">
          <svg viewBox="0 0 110 62" className="w-full h-full">
            <path d="M 10 55 A 45 45 0 0 1 100 55" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
            <path
              d="M 10 55 A 45 45 0 0 1 100 55"
              stroke={c}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${dash} ${C}`}
              strokeLinecap="butt"
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <div className="font-display text-xl leading-none" style={{ color: c }}>{pct}</div>
            <div className="label-micro">RISK</div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-xs font-display leading-tight truncate">{item.category}</div>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-white/60">
            <span><span className="sev-critical">●</span> {item.critical}</span>
            <span>{item.signals} signals</span>
          </div>
          <div className="text-[10px] text-white/40 mt-1 group-hover:text-white/70">Drill down →</div>
        </div>
      </div>
    </button>
  );
}
