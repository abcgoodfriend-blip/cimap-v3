import React from "react";
import { useApp } from "@/contexts/AppContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function RiskIndexGauge() {
  const { kpis, posts } = useApp();
  const critical = kpis?.critical_count || 0;
  const total = kpis?.total_posts || 1;
  const ratio = critical / total;
  const index = Math.min(100, Math.round(ratio * 300));
  let color = "#34C759", label = "STABLE";
  if (index > 65) { color = "#FF3B30"; label = "CRITICAL"; }
  else if (index > 40) { color = "#FF9500"; label = "ELEVATED"; }
  else if (index > 20) { color = "#FFCC00"; label = "WATCH"; }

  const R = 60, C = Math.PI * R, dash = C * (index / 100);

  return (
    <div data-testid="risk-index-gauge" className="panel p-4 flex items-center gap-4">
      <div className="relative w-[150px] h-[85px] shrink-0">
        <svg viewBox="0 0 150 85" className="w-full h-full">
          <path d="M 15 75 A 60 60 0 0 1 135 75" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
          <path
            d="M 15 75 A 60 60 0 0 1 135 75"
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${dash} ${C}`}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <div className="font-display text-3xl leading-none" style={{ color }}>{index}</div>
          <div className="label-micro">RISK INDEX</div>
        </div>
      </div>
      <div>
        <div className="label-micro">System Level</div>
        <div className="font-display text-xl" style={{ color }}>{label}</div>
        <div className="text-[11px] text-white/60 mt-2 max-w-[260px] leading-relaxed">
          Composite indicator of critical signal concentration, narrative velocity and sentiment deterioration across all ventures.
        </div>
      </div>
    </div>
  );
}

function VolumeTrend() {
  const { sentimentTrend } = useApp();
  return (
    <div data-testid="volume-trend" className="panel p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="label-micro">Critical Signal Volume</div>
          <h4 className="font-display text-sm">30-day Trend</h4>
        </div>
      </div>
      <div className="h-[140px]">
        <ResponsiveContainer>
          <LineChart data={sentimentTrend}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
            <XAxis dataKey="bucket" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
            <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
            <Tooltip contentStyle={{ background: "#121212", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 0, fontSize: 11 }} />
            <Line type="monotone" dataKey="critical" stroke="#FF3B30" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="posts" stroke="#FFCC00" strokeWidth={1} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function VentureBreakdown() {
  const { ventureBreakdown, setSelectedDetail } = useApp();
  const max = Math.max(1, ...ventureBreakdown.map((v) => v.total || 0));

  return (
    <div data-testid="venture-breakdown" className="panel p-3 h-full">
      <div className="label-micro mb-2">Venture Signal Breakdown</div>
      <div className="space-y-2">
        {ventureBreakdown.map((v) => {
          const widths = {
            critical: (v.critical / max) * 100,
            high: (v.high / max) * 100,
            medium: (v.medium / max) * 100,
            low: (v.low / max) * 100,
          };
          return (
            <button
              key={v.venture}
              data-testid={`venture-${v.venture}`}
              onClick={() => setSelectedDetail({ type: "venture", payload: { name: v.venture, signals: v.total, critical: v.critical } })}
              className="w-full text-left hover:bg-white/5 p-1 group"
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="truncate">{v.venture}</span>
                <span className="text-white/50 font-display">{v.total}</span>
              </div>
              <div className="flex h-3 border border-white/10">
                <div className="bg-[var(--sev-critical)]" style={{ width: `${widths.critical}%` }} />
                <div className="bg-[var(--sev-high)]" style={{ width: `${widths.high}%` }} />
                <div className="bg-[var(--sev-medium)]" style={{ width: `${widths.medium}%` }} />
                <div className="bg-[var(--sev-low)]" style={{ width: `${widths.low}%` }} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3 label-micro">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[var(--sev-critical)]" /> Crit</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[var(--sev-high)]" /> High</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[var(--sev-medium)]" /> Med</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[var(--sev-low)]" /> Low</span>
      </div>
    </div>
  );
}

function TopCriticalSites() {
  const { topSites, setSelectedDetail } = useApp();

  return (
    <div data-testid="top-critical-sites" className="panel p-0 h-full">
      <div className="p-3 border-b border-white/10">
        <div className="label-micro">Top 10 Most Critical Sites</div>
        <h4 className="font-display text-sm">Sites demanding immediate attention</h4>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10 bg-black/30">
            <th className="text-left px-3 py-2 label-micro">Site</th>
            <th className="text-left px-2 py-2 label-micro">State</th>
            <th className="text-left px-2 py-2 label-micro">Venture</th>
            <th className="text-right px-2 py-2 label-micro">Signals</th>
            <th className="text-right px-2 py-2 label-micro">Critical</th>
            <th className="text-right px-2 py-2 label-micro">Risk</th>
            <th className="text-right px-2 py-2 label-micro">Sent</th>
          </tr>
        </thead>
        <tbody>
          {topSites.map((s) => (
            <tr
              key={s.site}
              data-testid={`top-site-${s.site}`}
              className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
              onClick={() => setSelectedDetail({ type: "site", payload: { name: s.site, state: s.state, venture: s.venture, signals: s.signals, critical: s.critical } })}
            >
              <td className="px-3 py-2">{s.site}</td>
              <td className="px-2 py-2 text-white/70">{s.state}</td>
              <td className="px-2 py-2 text-white/70">{s.venture}</td>
              <td className="text-right px-2 py-2 font-display">{s.signals}</td>
              <td className="text-right px-2 py-2 font-display sev-critical">{s.critical}</td>
              <td className="text-right px-2 py-2 font-display sev-high">{s.avg_risk}</td>
              <td className="text-right px-2 py-2 font-display" style={{ color: s.avg_sentiment < 0 ? "var(--sev-high)" : "var(--sev-low)" }}>
                {s.avg_sentiment}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AnalysisTab() {
  const { filters, patchFilters } = useApp();

  return (
    <div className="space-y-4" data-testid="analysis-tab">
      <div className="panel p-3 flex items-center justify-between">
        <div>
          <div className="label-micro">Strategic Intelligence</div>
          <h3 className="font-display text-lg">Venture Risk & Site Intelligence</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="label-micro">From</span>
          <input
            data-testid="analysis-start-date"
            type="date"
            value={filters.start}
            onChange={(e) => patchFilters({ start: e.target.value })}
            className="bg-[var(--bg-surface)] border border-white/15 px-2 py-1 text-xs text-white"
          />
          <span className="label-micro">To</span>
          <input
            data-testid="analysis-end-date"
            type="date"
            value={filters.end}
            onChange={(e) => patchFilters({ end: e.target.value })}
            className="bg-[var(--bg-surface)] border border-white/15 px-2 py-1 text-xs text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-4">
        <VentureBreakdown />
        <TopCriticalSites />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-4">
        <RiskIndexGauge />
        <VolumeTrend />
      </div>
    </div>
  );
}
