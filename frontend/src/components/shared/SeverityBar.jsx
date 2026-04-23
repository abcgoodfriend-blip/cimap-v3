import React from "react";

const SEV_COLOR = {
  critical: "var(--sev-critical)",
  high: "var(--sev-high)",
  medium: "var(--sev-medium)",
  low: "var(--sev-low)",
};

export default function SeverityBar({ data = [], compact = false, testid = "severity-bar" }) {
  const total = data.reduce((a, x) => a + (x.count || 0), 0) || 1;
  const order = ["critical", "high", "medium", "low"];
  const sorted = order.map((s) => data.find((x) => x.severity === s)).filter(Boolean);

  return (
    <div data-testid={testid} className="w-full">
      {!compact && <div className="label-micro mb-2">Signal Severity Distribution</div>}
      <div className="flex w-full h-6 border border-white/15">
        {sorted.map((s) => {
          const pct = (s.count / total) * 100;
          return (
            <div
              key={s.severity}
              className="relative group"
              style={{ width: `${pct}%`, background: SEV_COLOR[s.severity] }}
              title={`${s.severity}: ${s.count} (${s.percent || Math.round(pct)}%)`}
            >
              {pct > 10 && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-black tracking-wide">
                  {Math.round(pct)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
      {!compact && (
        <div className="mt-2 grid grid-cols-4 gap-px bg-white/10">
          {sorted.map((s) => (
            <div key={s.severity} className="bg-[var(--bg-app)] px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5" style={{ background: SEV_COLOR[s.severity] }} />
                <span className="label-micro capitalize">{s.severity}</span>
              </div>
              <div className="font-display text-sm mt-0.5">
                {s.percent || Math.round((s.count / total) * 100)}%
                <span className="text-white/40 text-[10px] ml-1">/ {s.count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
