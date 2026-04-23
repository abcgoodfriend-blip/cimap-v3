import React, { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ComposedChart, Bar, ScatterChart, Scatter, ZAxis, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Flame, Target, Zap, Gauge as GaugeIcon } from "lucide-react";

function RiskIndexGauge() {
  const { kpis } = useApp();
  const critical = kpis?.critical_count || 0;
  const total = kpis?.total_posts || 1;
  const ratio = critical / total;
  const index = Math.min(100, Math.round(ratio * 300));
  let color = "var(--sev-low)", label = "STABLE";
  if (index > 65) { color = "var(--sev-critical)"; label = "CRITICAL"; }
  else if (index > 40) { color = "var(--sev-high)"; label = "ELEVATED"; }
  else if (index > 20) { color = "var(--sev-medium)"; label = "WATCH"; }

  const R = 60, C = Math.PI * R, dash = C * (index / 100);

  return (
    <div data-testid="risk-index-gauge" className="panel p-3 flex items-center gap-3 h-full min-h-0 overflow-hidden">
      <div className="relative w-[150px] h-[85px] shrink-0">
        <svg viewBox="0 0 150 85" className="w-full h-full">
          <path d="M 15 75 A 60 60 0 0 1 135 75" stroke="rgba(0,0,0,0.06)" strokeWidth="10" fill="none" />
          <path d="M 15 75 A 60 60 0 0 1 135 75" stroke={color} strokeWidth="10" fill="none" strokeDasharray={`${dash} ${C}`} />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <div className="font-display text-3xl leading-none" style={{ color }}>{index}</div>
          <div className="label-micro">RISK INDEX</div>
        </div>
      </div>
      <div>
        <div className="label-micro flex items-center gap-1"><GaugeIcon className="w-3 h-3" /> System Level</div>
        <div className="font-display text-xl" style={{ color }}>{label}</div>
        <div className="text-[11px] text-[var(--text-secondary)] mt-2 max-w-[260px] leading-relaxed">
          Composite of critical concentration, narrative velocity and sentiment deterioration across all ventures.
        </div>
      </div>
    </div>
  );
}

function VolumeTrend() {
  const { sentimentTrend } = useApp();
  return (
    <div data-testid="volume-trend" className="panel p-3 h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div>
          <div className="label-micro">Critical Signal Volume</div>
          <h4 className="font-display text-sm">30-day Trend</h4>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer>
          <LineChart data={sentimentTrend}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="2 2" />
            <XAxis dataKey="bucket" stroke="rgba(0,0,0,0.4)" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
            <YAxis stroke="rgba(0,0,0,0.4)" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 0, fontSize: 11 }} />
            <Line type="monotone" dataKey="critical" stroke="var(--sev-critical)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="posts" stroke="var(--sev-medium)" strokeWidth={1} dot={false} />
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
    <div data-testid="venture-breakdown" className="panel p-3 h-full min-h-0 flex flex-col overflow-hidden">
      <div className="label-micro mb-2 flex-shrink-0">Venture Signal Breakdown</div>
      <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
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
              className="w-full text-left hover:bg-black/[0.03] p-1 group"
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="truncate">{v.venture}</span>
                <span className="text-[var(--text-secondary)] font-display">{v.total}</span>
              </div>
              <div className="flex h-3 border border-hair">
                <div className="bg-[var(--sev-critical)]" style={{ width: `${widths.critical}%` }} />
                <div className="bg-[var(--sev-high)]" style={{ width: `${widths.high}%` }} />
                <div className="bg-[var(--sev-medium)]" style={{ width: `${widths.medium}%` }} />
                <div className="bg-[var(--sev-low)]" style={{ width: `${widths.low}%` }} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-2 label-micro flex-shrink-0">
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
    <div data-testid="top-critical-sites" className="panel p-0 h-full min-h-0 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-hair flex-shrink-0">
        <div className="label-micro">Top 10 Most Critical Sites</div>
        <h4 className="font-display text-sm">Sites demanding immediate attention</h4>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-hair bg-[var(--bg-panel)]">
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
              className="border-b border-hair hover:bg-black/[0.03] cursor-pointer"
              onClick={() => setSelectedDetail({ type: "site", payload: { name: s.site, state: s.state, venture: s.venture, signals: s.signals, critical: s.critical } })}
            >
              <td className="px-3 py-2">{s.site}</td>
              <td className="px-2 py-2 text-[var(--text-secondary)]">{s.state}</td>
              <td className="px-2 py-2 text-[var(--text-secondary)]">{s.venture}</td>
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
    </div>
  );
}

/** Pareto: 80/20 distribution of critical signals across sites. */
function RiskConcentration() {
  const { topSites } = useApp();
  const data = useMemo(() => {
    const sorted = [...topSites].sort((a, b) => b.critical - a.critical);
    const total = sorted.reduce((a, x) => a + x.critical, 0) || 1;
    let cum = 0;
    return sorted.map((s) => {
      cum += s.critical;
      return {
        site: s.site,
        critical: s.critical,
        cumPct: Math.round((cum / total) * 100),
      };
    });
  }, [topSites]);

  const n80 = data.findIndex((x) => x.cumPct >= 80);
  const siteCountTo80 = n80 === -1 ? data.length : n80 + 1;

  return (
    <div data-testid="risk-concentration" className="panel p-3 h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex items-start justify-between mb-2 flex-shrink-0">
        <div>
          <div className="label-micro flex items-center gap-1.5"><Target className="w-3 h-3" /> Risk Concentration · Pareto</div>
          <h4 className="font-display text-sm">Where are criticals clustering?</h4>
        </div>
        <div className="text-right">
          <div className="label-micro">80% from</div>
          <div className="font-display text-lg sev-critical">{siteCountTo80} sites</div>
        </div>
      </div>
      <div className="flex-1 min-h-0 -mx-2">
        <ResponsiveContainer>
          <ComposedChart data={data}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="2 2" />
            <XAxis dataKey="site" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} stroke="rgba(0,0,0,0.3)" interval={0} angle={-25} textAnchor="end" height={50} />
            <YAxis yAxisId="left" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} stroke="rgba(0,0,0,0.3)" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} stroke="rgba(0,0,0,0.3)" domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 0, fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="critical" fill="var(--sev-critical)" />
            <Line yAxisId="right" type="monotone" dataKey="cumPct" stroke="var(--text-primary)" strokeWidth={2} dot={{ r: 2 }} />
            <ReferenceLine yAxisId="right" y={80} stroke="rgba(0,0,0,0.4)" strokeDasharray="3 3" label={{ value: "80%", fontSize: 10, fill: "rgba(0,0,0,0.5)" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Sentiment × Risk Quadrant scatter — "Crisis zone" is top-left (high risk + negative sentiment). */
function SentimentRiskQuadrant() {
  const { posts, setSelectedDetail } = useApp();

  const data = useMemo(() => {
    const bySite = {};
    posts.forEach((p) => {
      if (!bySite[p.site]) bySite[p.site] = { site: p.site, venture: p.venture, state: p.state, risk: 0, sent: 0, count: 0 };
      bySite[p.site].risk += p.risk_score;
      bySite[p.site].sent += p.sentiment;
      bySite[p.site].count++;
    });
    return Object.values(bySite).map((s) => ({
      ...s,
      risk: Number((s.risk / s.count).toFixed(2)),
      sent: Number((s.sent / s.count).toFixed(2)),
      z: s.count,
    }));
  }, [posts]);

  const crisis = data.filter((d) => d.risk >= 0.55 && d.sent <= -0.15).length;

  return (
    <div data-testid="sentiment-risk-quadrant" className="panel p-3 h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex items-start justify-between mb-2 flex-shrink-0">
        <div>
          <div className="label-micro flex items-center gap-1.5"><Flame className="w-3 h-3 sev-critical" /> Sentiment × Risk · Site Quadrant</div>
          <h4 className="font-display text-sm">High-risk + negative = crisis zone</h4>
        </div>
        <div className="text-right">
          <div className="label-micro">In Crisis Zone</div>
          <div className="font-display text-lg sev-critical">{crisis} sites</div>
        </div>
      </div>
      <div className="flex-1 min-h-0 -mx-2 relative">
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="2 2" />
            <XAxis
              type="number"
              dataKey="sent"
              domain={[-1, 1]}
              tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
              stroke="rgba(0,0,0,0.3)"
              label={{ value: "Sentiment →", position: "insideBottom", offset: -8, fontSize: 10, fill: "rgba(0,0,0,0.5)" }}
            />
            <YAxis
              type="number"
              dataKey="risk"
              domain={[0, 1]}
              tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
              stroke="rgba(0,0,0,0.3)"
              label={{ value: "Risk ↑", angle: -90, position: "insideLeft", fontSize: 10, fill: "rgba(0,0,0,0.5)" }}
            />
            <ZAxis dataKey="z" range={[30, 220]} />
            <ReferenceLine x={0} stroke="rgba(0,0,0,0.25)" />
            <ReferenceLine y={0.5} stroke="rgba(0,0,0,0.25)" />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 0, fontSize: 11 }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-hair p-2 text-[11px]">
                    <div className="font-semibold">{d.site}</div>
                    <div>{d.state} · {d.venture}</div>
                    <div>Risk {d.risk} · Sent {d.sent} · {d.count} posts</div>
                  </div>
                );
              }}
            />
            <Scatter
              data={data}
              fill="var(--sev-high)"
              shape={(props) => {
                const { cx, cy, payload } = props;
                const fill = payload.risk >= 0.55 && payload.sent <= -0.15
                  ? "var(--sev-critical)"
                  : payload.risk >= 0.55 ? "var(--sev-high)"
                  : payload.sent <= -0.15 ? "var(--sev-medium)" : "var(--sev-low)";
                const r = Math.sqrt(payload.z) + 2;
                return (
                  <circle
                    cx={cx} cy={cy} r={r}
                    fill={fill} fillOpacity={0.55}
                    stroke={fill} strokeWidth={1}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedDetail({ type: "site", payload: { name: payload.site, state: payload.state, venture: payload.venture, signals: payload.count, critical: 0 } })}
                  />
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="absolute top-2 left-12 label-micro text-[var(--sev-critical)]">CRISIS</div>
        <div className="absolute top-2 right-4 label-micro text-[var(--sev-high)]">HIGH-RISK POSITIVE</div>
        <div className="absolute bottom-10 left-12 label-micro text-[var(--sev-medium)]">GRUMBLING</div>
        <div className="absolute bottom-10 right-4 label-micro text-[var(--sev-low)]">HAPPY</div>
      </div>
    </div>
  );
}

/** Emerging Hotspots — states with biggest week-over-week risk-velocity shift. */
function EmergingHotspots() {
  const { posts, setSelectedDetail } = useApp();

  const data = useMemo(() => {
    const now = Date.now(), DAY = 86400 * 1000;
    const recentWin = 3 * DAY;   // last 3 days
    const priorWin = 7 * DAY;    // days 4-10
    const m = {};
    posts.forEach((p) => {
      const t = new Date(p.timestamp).getTime();
      const age = now - t;
      if (!m[p.state]) m[p.state] = { state: p.state, recent: 0, prior: 0, critical: 0 };
      if (age <= recentWin) m[p.state].recent++;
      else if (age <= priorWin + recentWin) m[p.state].prior++;
      if (p.severity === "critical") m[p.state].critical++;
    });
    return Object.values(m)
      .map((x) => {
        const priorNorm = x.prior / 2.33; // normalize to 3-day window
        const delta = priorNorm > 0 ? ((x.recent - priorNorm) / priorNorm) * 100 : (x.recent > 0 ? 100 : 0);
        return { ...x, delta: Math.round(delta) };
      })
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 6);
  }, [posts]);

  return (
    <div data-testid="emerging-hotspots" className="panel p-3 h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex items-start justify-between mb-2 flex-shrink-0">
        <div>
          <div className="label-micro flex items-center gap-1.5"><Zap className="w-3 h-3 sev-high" /> Emerging Hotspots</div>
          <h4 className="font-display text-sm">Fastest-accelerating geographies</h4>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[var(--border-default)] flex-1 min-h-0 overflow-y-auto">
        {data.map((s) => {
          const rising = s.delta >= 0;
          return (
            <button
              key={s.state}
              data-testid={`hotspot-${s.state}`}
              onClick={() => setSelectedDetail({ type: "state", payload: s })}
              className="bg-[var(--bg-surface)] p-2.5 text-left hover:bg-black/[0.03] transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-3" style={{ background: rising ? "var(--sev-critical)" : "var(--sev-low)" }} />
                <div className="text-xs font-display truncate flex-1">{s.state}</div>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-display text-base" style={{ color: rising ? "var(--sev-critical)" : "var(--sev-low)" }}>
                  {rising ? "+" : ""}{s.delta}%
                </span>
                {rising ? <TrendingUp className="w-3 h-3 sev-critical" /> : <TrendingDown className="w-3 h-3 sev-low" />}
              </div>
              <div className="label-micro mt-1">3d: {s.recent} · prior: {Math.round(s.prior / 2.33)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Category × State heatmap */
function CategoryStateHeatmap() {
  const { posts } = useApp();
  const topStates = useMemo(() => {
    const m = {};
    posts.forEach((p) => { m[p.state] = (m[p.state] || 0) + (p.severity === "critical" ? 2 : 1); });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8).map((x) => x[0]);
  }, [posts]);
  const cats = useMemo(() => {
    const m = {};
    posts.forEach((p) => { m[p.category] = (m[p.category] || 0) + (p.severity === "critical" ? 2 : 1); });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map((x) => x[0]);
  }, [posts]);
  const grid = useMemo(() => {
    const m = {};
    posts.forEach((p) => {
      const k = `${p.category}__${p.state}`;
      if (!m[k]) m[k] = { count: 0, critical: 0 };
      m[k].count++;
      if (p.severity === "critical") m[k].critical++;
    });
    return m;
  }, [posts]);
  const max = Math.max(1, ...Object.values(grid).map((v) => v.count));

  const heat = (count) => {
    const t = count / max;
    if (t === 0) return "rgba(0,0,0,0.035)";
    if (t < 0.2) return "rgba(234, 130, 0, 0.25)";
    if (t < 0.45) return "rgba(234, 130, 0, 0.55)";
    if (t < 0.7) return "rgba(220, 38, 38, 0.55)";
    return "rgba(220, 38, 38, 0.85)";
  };

  return (
    <div data-testid="category-state-heatmap" className="panel p-3 h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex items-start justify-between mb-2 flex-shrink-0">
        <div>
          <div className="label-micro">Category × State Heatmap</div>
          <h4 className="font-display text-sm">Where narratives and geographies collide</h4>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th></th>
              {topStates.map((s) => (
                <th key={s} className="label-micro py-1 px-1.5 text-left font-normal whitespace-nowrap">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c}>
                <td className="label-micro pr-2 py-0.5 whitespace-nowrap">{c}</td>
                {topStates.map((s) => {
                  const cell = grid[`${c}__${s}`] || { count: 0, critical: 0 };
                  return (
                    <td key={s} className="p-0.5">
                      <div
                        className="w-9 h-7 flex items-center justify-center border border-hair"
                        style={{ background: heat(cell.count) }}
                        title={`${c} · ${s}: ${cell.count} (${cell.critical} critical)`}
                      >
                        {cell.count > 0 && (
                          <span className="font-display text-[10px]" style={{ color: cell.count / max > 0.45 ? "#fff" : "var(--text-primary)" }}>
                            {cell.count}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AnalysisTab() {
  const { filters, patchFilters } = useApp();

  return (
    <div
      className="space-y-3 lg:space-y-0 lg:h-[calc(100vh-220px)] lg:min-h-[520px] lg:overflow-hidden lg:grid lg:gap-3 lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)]"
      data-testid="analysis-tab"
    >
      {/* Row 1 — Filter header */}
      <div className="panel p-3 flex items-center justify-between flex-wrap gap-2 lg:col-span-8 lg:row-start-1">
        <div>
          <div className="label-micro">Strategic Intelligence</div>
          <h3 className="font-display text-base lg:text-lg">Venture Risk & Site Intelligence</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="label-micro">From</span>
          <input
            data-testid="analysis-start-date"
            type="date"
            value={filters.start}
            onChange={(e) => patchFilters({ start: e.target.value })}
            className="bg-transparent border border-hair px-2 py-1 text-xs"
          />
          <span className="label-micro">To</span>
          <input
            data-testid="analysis-end-date"
            type="date"
            value={filters.end}
            onChange={(e) => patchFilters({ end: e.target.value })}
            className="bg-transparent border border-hair px-2 py-1 text-xs"
          />
        </div>
      </div>

      {/* Row 1 — Risk Index Gauge */}
      <div className="lg:col-span-4 lg:row-start-1 min-h-0">
        <RiskIndexGauge />
      </div>

      {/* Row 2 */}
      <div className="lg:col-span-3 lg:row-start-2 min-h-0">
        <VentureBreakdown />
      </div>
      <div className="lg:col-span-5 lg:row-start-2 min-h-0">
        <TopCriticalSites />
      </div>
      <div className="lg:col-span-4 lg:row-start-2 min-h-0">
        <VolumeTrend />
      </div>

      {/* Row 3 */}
      <div className="lg:col-span-3 lg:row-start-3 min-h-0">
        <RiskConcentration />
      </div>
      <div className="lg:col-span-3 lg:row-start-3 min-h-0">
        <SentimentRiskQuadrant />
      </div>
      <div className="lg:col-span-3 lg:row-start-3 min-h-0">
        <EmergingHotspots />
      </div>
      <div className="lg:col-span-3 lg:row-start-3 min-h-0">
        <CategoryStateHeatmap />
      </div>
    </div>
  );
}
