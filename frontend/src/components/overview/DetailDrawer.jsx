import React, { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import SeverityBar from "@/components/shared/SeverityBar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, Zap, Activity } from "lucide-react";

const PLATFORM_COLORS = ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#ffffff", "#A5A5A5"];

function MiniKPI({ label, value, color, testid }) {
  return (
    <div data-testid={testid} className="panel-dark p-2.5">
      <div className="label-micro">{label}</div>
      <div className="font-display text-lg mt-0.5" style={{ color: color || "#fff" }}>{value}</div>
    </div>
  );
}

export default function DetailDrawer() {
  const { selectedDetail, setSelectedDetail, posts, platformDist, ventureBreakdown } = useApp();
  const open = !!selectedDetail;
  const d = selectedDetail?.payload || {};
  const title = d.name || d.category || d.site || d.venture || "Detail";

  const filtered = useMemo(() => {
    if (!selectedDetail) return [];
    return (posts || []).filter((p) => {
      if (selectedDetail.type === "venture") return p.venture === d.name;
      if (selectedDetail.type === "site") return p.site === d.name;
      if (selectedDetail.type === "category") return p.category === d.category;
      if (selectedDetail.type === "category-site") return p.site === d.site && p.category === d.name;
      if (selectedDetail.type === "subpoint") return p.subcategory === d.name;
      if (selectedDetail.type === "state") return p.state === d.state;
      return true;
    });
  }, [selectedDetail, posts, d]);

  const stats = useMemo(() => {
    const crit = filtered.filter((p) => p.severity === "critical").length;
    const avgRisk = filtered.length ? filtered.reduce((a, p) => a + p.risk_score, 0) / filtered.length : 0;
    const avgSent = filtered.length ? filtered.reduce((a, p) => a + p.sentiment, 0) / filtered.length : 0;
    return { signals: filtered.length, critical: crit, avgRisk, avgSent };
  }, [filtered]);

  const severity = useMemo(() => {
    const out = { critical: 0, high: 0, medium: 0, low: 0 };
    filtered.forEach((p) => { out[p.severity]++; });
    const total = filtered.length || 1;
    return ["critical", "high", "medium", "low"].map((s) => ({ severity: s, count: out[s], percent: Math.round((out[s] / total) * 100) }));
  }, [filtered]);

  const plat = useMemo(() => {
    const m = {};
    filtered.forEach((p) => { m[p.platform] = (m[p.platform] || 0) + 1; });
    return Object.entries(m).map(([k, v]) => ({ name: k, value: v }));
  }, [filtered]);

  const topCritical = useMemo(() => {
    return [...filtered]
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 8);
  }, [filtered]);

  const verticalContrib = useMemo(() => {
    if (!selectedDetail) return [];
    return ventureBreakdown.slice(0, 6);
  }, [selectedDetail, ventureBreakdown]);

  const { setSelectedPost } = useApp();

  return (
    <Sheet open={open} onOpenChange={(o) => !o && setSelectedDetail(null)}>
      <SheetContent
        side="right"
        data-testid="detail-drawer"
        className="w-full sm:max-w-2xl rounded-none bg-[var(--bg-app)] border-l border-white/10 text-white p-0 overflow-y-auto"
      >
        <SheetHeader className="p-4 border-b border-white/10 bg-[var(--bg-surface)] text-left">
          <div className="label-micro">{(selectedDetail?.type || "detail").toUpperCase()}</div>
          <SheetTitle className="text-white font-display text-xl tracking-tight">{title}</SheetTitle>
          <div className="grid grid-cols-4 gap-px bg-white/10 mt-3">
            <div className="bg-[var(--bg-surface)] p-2.5">
              <div className="label-micro">Signals</div>
              <div className="font-display text-lg">{stats.signals}</div>
            </div>
            <div className="bg-[var(--bg-surface)] p-2.5">
              <div className="label-micro">Critical</div>
              <div className="font-display text-lg sev-critical">{stats.critical}</div>
            </div>
            <div className="bg-[var(--bg-surface)] p-2.5">
              <div className="label-micro">Avg Risk</div>
              <div className="font-display text-lg sev-high">{stats.avgRisk.toFixed(2)}</div>
            </div>
            <div className="bg-[var(--bg-surface)] p-2.5">
              <div className="label-micro">Avg Sentiment</div>
              <div className="font-display text-lg" style={{ color: stats.avgSent < 0 ? "var(--sev-high)" : "var(--sev-low)" }}>
                {stats.avgSent.toFixed(2)}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="p-4 space-y-4">
          {/* Row: Severity bar full width */}
          <section>
            <SeverityBar data={severity} />
          </section>

          {/* Row: Risk drivers + Platform distribution */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
            <div className="panel p-3">
              <div className="label-micro mb-2">Risk Drivers (Top Categories)</div>
              <div className="space-y-1">
                {filteredCategories(filtered).slice(0, 5).map((c) => (
                  <div key={c.category} className="flex items-center gap-2">
                    <div className="text-xs truncate w-40">{c.category}</div>
                    <div className="flex-1 h-1.5 bg-white/5 relative">
                      <div className="h-full bg-[var(--sev-high)]" style={{ width: `${Math.min(100, c.pct)}%` }} />
                    </div>
                    <div className="label-micro w-12 text-right">{c.count}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-px bg-white/10 mt-4">
                <div className="bg-[var(--bg-surface)] p-2.5 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--sev-high)]" />
                  <div>
                    <div className="label-micro">Trend</div>
                    <div className="text-xs">{stats.signals > 15 ? "Rising" : "Stable"}</div>
                  </div>
                </div>
                <div className="bg-[var(--bg-surface)] p-2.5 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[var(--sev-critical)]" />
                  <div>
                    <div className="label-micro">Velocity</div>
                    <div className="text-xs">{stats.critical > 3 ? "High" : "Low"}</div>
                  </div>
                </div>
                <div className="bg-[var(--bg-surface)] p-2.5 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-white" />
                  <div>
                    <div className="label-micro">Narrative</div>
                    <div className="text-xs">Active</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel p-3">
              <div className="label-micro mb-2">Platform Distribution</div>
              <div className="h-40">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={plat} dataKey="value" nameKey="name" outerRadius={60} innerRadius={30} stroke="#0A0A0A" strokeWidth={1}>
                      {plat.map((_, i) => (
                        <Cell key={i} fill={PLATFORM_COLORS[i % PLATFORM_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#121212", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 0, fontFamily: "JetBrains Mono", fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {plat.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-[11px] text-white/80">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2" style={{ background: PLATFORM_COLORS[i % PLATFORM_COLORS.length] }} />
                      {p.name}
                    </span>
                    <span className="text-white/60 font-display">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Row: Top critical + Vertical contribution */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
            <div className="panel p-3">
              <div className="label-micro mb-2">Top Critical Signals</div>
              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {topCritical.map((p) => (
                  <button
                    key={p.id}
                    data-testid={`critical-signal-${p.id}`}
                    onClick={() => setSelectedPost(p)}
                    className="w-full text-left py-2 px-1 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5" style={{ background: p.severity === "critical" ? "var(--sev-critical)" : "var(--sev-high)" }} />
                      <span className="label-micro">{p.platform} · {p.state}</span>
                      <span className="label-micro text-white/40 ml-auto">{new Date(p.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="text-xs mt-1 line-clamp-2">{p.content}</div>
                  </button>
                ))}
                {!topCritical.length && <div className="text-xs text-white/40 py-3">No signals in scope.</div>}
              </div>
            </div>

            <div className="panel p-3">
              <div className="label-micro mb-2">Verticals · Risk Contribution</div>
              <div className="space-y-2">
                {verticalContrib.map((v) => {
                  const pct = Math.round((v.critical / Math.max(1, stats.critical || v.total)) * 100);
                  return (
                    <div key={v.venture} className="flex items-center gap-2">
                      <div className="text-[11px] w-36 truncate">{v.venture}</div>
                      <div className="flex-1 h-1.5 bg-white/5">
                        <div className="h-full bg-[var(--sev-critical)]" style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <div className="label-micro w-10 text-right">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function filteredCategories(list) {
  const m = {};
  list.forEach((p) => { m[p.category] = (m[p.category] || 0) + 1; });
  const total = list.length || 1;
  return Object.entries(m).map(([category, count]) => ({
    category,
    count,
    pct: (count / total) * 100,
  })).sort((a, b) => b.count - a.count);
}
