import React from "react";
import { useApp } from "@/contexts/AppContext";

/**
 * Speedometer-style gauge with 4 color bands (green -> yellow -> orange -> red)
 * and a needle pointing at the current avg_risk (0..1).
 */
export default function RiskDialGauge({ item }) {
  const { setSelectedDetail } = useApp();
  const risk = Math.max(0, Math.min(1, item.avg_risk || 0));
  const pct = Math.round(risk * 100);

  // Gauge geometry
  const cx = 90, cy = 90, r = 70;
  const start = 180; // degrees (left)
  const end = 360;   // degrees (right)
  const deg = (risk * 180);
  const needleAngle = 180 + deg; // 180..360
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleX = cx + (r - 8) * Math.cos(needleRad);
  const needleY = cy + (r - 8) * Math.sin(needleRad);

  const polar = (angleDeg) => {
    const a = (angleDeg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const arcPath = (fromDeg, toDeg) => {
    const [x1, y1] = polar(fromDeg);
    const [x2, y2] = polar(toDeg);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };

  const bands = [
    { from: 180, to: 225, color: "var(--sev-low)" },
    { from: 225, to: 270, color: "var(--sev-medium)" },
    { from: 270, to: 315, color: "var(--sev-high)" },
    { from: 315, to: 360, color: "var(--sev-critical)" },
  ];

  const label = risk >= 0.75 ? "CRITICAL" : risk >= 0.5 ? "HIGH" : risk >= 0.25 ? "MEDIUM" : "LOW";
  const labelColor = risk >= 0.75 ? "var(--sev-critical)" : risk >= 0.5 ? "var(--sev-high)" : risk >= 0.25 ? "var(--sev-medium)" : "var(--sev-low)";

  return (
    <button
      type="button"
      data-testid={`risk-dial-${(item.category || "").replace(/\s+/g, "-")}`}
      onClick={() => setSelectedDetail({ type: "category", payload: item })}
      className="w-full text-left p-3 hover:bg-black/5 transition-colors group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-display leading-tight truncate text-[var(--text-primary)]">{item.category}</div>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--text-secondary)]">
            <span className="sev-critical">● {item.critical}</span>
            <span>{item.signals} signals</span>
          </div>
        </div>
        <span className="label-micro px-1.5 py-0.5 border border-hair" style={{ color: labelColor, borderColor: labelColor }}>
          {label}
        </span>
      </div>

      <div className="relative w-full flex justify-center">
        <svg viewBox="0 0 180 110" className="w-full max-w-[200px] h-auto">
          {/* Background track */}
          <path d={arcPath(180, 360)} stroke="rgba(0,0,0,0.06)" strokeWidth="14" fill="none" strokeLinecap="butt" />
          {/* Color bands */}
          {bands.map((b, i) => (
            <path key={i} d={arcPath(b.from, b.to)} stroke={b.color} strokeWidth="12" fill="none" strokeLinecap="butt" />
          ))}
          {/* Tick marks at each segment boundary */}
          {[180, 225, 270, 315, 360].map((t, i) => {
            const [x1, y1] = polar(t);
            const [x2, y2] = [
              cx + (r - 16) * Math.cos((t * Math.PI) / 180),
              cy + (r - 16) * Math.sin((t * Math.PI) / 180),
            ];
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="2" />;
          })}
          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="var(--text-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="5" fill="var(--text-primary)" />
          <circle cx={cx} cy={cy} r="2" fill="var(--bg-surface)" />
        </svg>
        <div className="absolute bottom-1 left-0 right-0 text-center">
          <div className="font-display text-2xl leading-none" style={{ color: labelColor }}>
            {pct}
          </div>
          <div className="label-micro">RISK INDEX</div>
        </div>
      </div>

      <div className="text-[10px] text-[var(--text-muted)] mt-2 text-center group-hover:text-[var(--text-primary)]">
        Drill down →
      </div>
    </button>
  );
}
