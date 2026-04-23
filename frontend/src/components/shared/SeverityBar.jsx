import React from "react";
import { useApp } from "@/contexts/AppContext";

const SEV_COLOR = {
  critical: "var(--sev-critical)", high: "var(--sev-high)",
  medium: "var(--sev-medium)", low: "var(--sev-low)",
};

export default function SeverityBar({ data = [], testid = "severity-bar" }) {
  const { setSelectedDetail } = useApp();
  const total = data.reduce((a, x) => a + (x.count || 0), 0) || 1;
  const order = ["critical", "high", "medium", "low"];
  const sorted = order.map((s) => data.find((x) => x.severity === s) || { severity: s, count: 0 });

  return (
    <div data-testid={testid} className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="label-micro">Signal Severity Distribution</span>
        <span className="label-micro">Σ {total.toLocaleString()}</span>
      </div>
      <div className="flex w-full h-4 border border-hair overflow-hidden">
        {sorted.map((s) => {
          const pct = (s.count / total) * 100;
          if (pct <= 0) return null;
          return (
            <button
              type="button"
              key={s.severity}
              data-testid={`severity-segment-${s.severity}`}
              onClick={() => setSelectedDetail({ type: "severity", payload: { severity: s.severity, count: s.count } })}
              className="relative hover:opacity-90 transition-opacity cursor-pointer"
              style={{ width: `${pct}%`, background: SEV_COLOR[s.severity] }}
              title={`${s.severity}: ${s.count}`}
            >
              {pct > 12 && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold tracking-wide" style={{ color: "#fff" }}>
                  {s.count} / {Math.round(pct)}%
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-1.5">
        {sorted.map((s) => (
          <button
            key={s.severity}
            type="button"
            onClick={() => setSelectedDetail({ type: "severity", payload: { severity: s.severity, count: s.count } })}
            className="flex items-center gap-1.5 hover:opacity-80"
          >
            <span className="w-1.5 h-1.5" style={{ background: SEV_COLOR[s.severity] }} />
            <span className="label-micro capitalize">{s.severity}</span>
            <span className="text-[10px] font-display text-[var(--text-primary)]">{s.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
