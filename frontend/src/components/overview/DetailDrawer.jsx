import React, { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import SeverityBar from "@/components/shared/SeverityBar";
import HierarchyCrumb from "@/components/shared/HierarchyCrumb";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Zap, Radar, Users } from "lucide-react";

const SEV_COLOR = {
  critical: "var(--sev-critical)", high: "var(--sev-high)", medium: "var(--sev-medium)", low: "var(--sev-low)",
};

export default function DetailDrawer() {
  const { selectedDetail, setSelectedDetail, posts, setSelectedPost } = useApp();
  const open = !!selectedDetail;
  const d = selectedDetail?.payload || {};
  const type = selectedDetail?.type;
  const title = d.name || d.category || d.site || d.venture || d.state || "Detail";

  const filtered = useMemo(() => {
    if (!selectedDetail) return [];
    return (posts || []).filter((p) => {
      if (type === "venture") return p.venture === d.name;
      if (type === "site") return p.site === d.name;
      if (type === "category") return p.category === d.category;
      if (type === "category-site") return p.site === d.site && p.category === d.name;
      if (type === "subpoint") return p.subcategory === d.name;
      if (type === "state") return p.state === d.state;
      return true;
    });
  }, [selectedDetail, posts, d, type]);

  const stats = useMemo(() => {
    const crit = filtered.filter((p) => p.severity === "critical").length;
    const high = filtered.filter((p) => p.severity === "high").length;
    const avgRisk = filtered.length ? filtered.reduce((a, p) => a + p.risk_score, 0) / filtered.length : 0;
    const avgSent = filtered.length ? filtered.reduce((a, p) => a + p.sentiment, 0) / filtered.length : 0;
    const pos = filtered.filter((p) => p.sentiment > 0.15).length;
    const neg = filtered.filter((p) => p.sentiment < -0.15).length;
    const neu = filtered.length - pos - neg;
    return { signals: filtered.length, critical: crit, high, avgRisk, avgSent, pos, neu, neg };
  }, [filtered]);

  const severity = useMemo(() => {
    const m = { critical: 0, high: 0, medium: 0, low: 0 };
    filtered.forEach((p) => { m[p.severity]++; });
    const total = filtered.length || 1;
    return ["critical", "high", "medium", "low"].map((s) => ({ severity: s, count: m[s], percent: Math.round((m[s] / total) * 100) }));
  }, [filtered]);

  const topCritical = useMemo(() => {
    return [...filtered].sort((a, b) => b.risk_score - a.risk_score).slice(0, 8);
  }, [filtered]);

  const topNarratives = useMemo(() => {
    const m = {};
    filtered.forEach((p) => {
      const key = p.subcategory;
      if (!m[key]) m[key] = { key, count: 0, critical: 0, risk: 0 };
      m[key].count++;
      if (p.severity === "critical") m[key].critical++;
      m[key].risk += p.risk_score;
    });
    return Object.values(m)
      .map((x) => ({ ...x, risk: x.risk / x.count }))
      .sort((a, b) => b.critical * 2 + b.risk - (a.critical * 2 + a.risk))
      .slice(0, 5);
  }, [filtered]);

  const topAuthors = useMemo(() => {
    const m = {};
    filtered.forEach((p) => {
      if (!m[p.handle]) m[p.handle] = { handle: p.handle, name: p.author, posts: 0, critical: 0 };
      m[p.handle].posts++;
      if (p.severity === "critical") m[p.handle].critical++;
    });
    return Object.values(m).sort((a, b) => b.critical - a.critical || b.posts - a.posts).slice(0, 5);
  }, [filtered]);

  // Velocity: last 14 days buckets
  const velocity = useMemo(() => {
    const out = [];
    const DAY = 86400 * 1000;
    for (let i = 13; i >= 0; i--) {
      const start = Date.now() - i * DAY;
      const end = start + DAY;
      const count = filtered.filter((p) => {
        const t = new Date(p.timestamp).getTime();
        return t >= start && t < end;
      }).length;
      out.push({ d: `D-${i}`, count });
    }
    const recent = out.slice(-3).reduce((a, x) => a + x.count, 0);
    const prior = out.slice(-7, -3).reduce((a, x) => a + x.count, 0) / 1.33;
    const delta = prior > 0 ? ((recent - prior) / prior) * 100 : recent > 0 ? 100 : 0;
    return { series: out, delta };
  }, [filtered]);

  const platformAmp = useMemo(() => {
    const m = {};
    filtered.forEach((p) => {
      if (!m[p.platform]) m[p.platform] = { platform: p.platform, total: 0, critical: 0 };
      m[p.platform].total++;
      if (p.severity === "critical") m[p.platform].critical++;
    });
    return Object.values(m).sort((a, b) => b.critical - a.critical).slice(0, 5);
  }, [filtered]);

  const statesInvolved = useMemo(() => {
    const m = {};
    filtered.forEach((p) => {
      if (!m[p.state]) m[p.state] = { state: p.state, count: 0, critical: 0 };
      m[p.state].count++;
      if (p.severity === "critical") m[p.state].critical++;
    });
    return Object.values(m).sort((a, b) => b.critical - a.critical).slice(0, 5);
  }, [filtered]);

  const sentTotal = Math.max(1, stats.pos + stats.neu + stats.neg);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && setSelectedDetail(null)}>
      <SheetContent
        side="right"
        data-testid="detail-drawer"
        className="w-full sm:max-w-2xl rounded-none bg-[var(--bg-app)] border-l border-hair text-[var(--text-primary)] p-0 overflow-y-auto z-[90]"
      >
        <SheetHeader className="p-4 border-b border-hair bg-[var(--bg-surface)] text-left">
          <div className="flex items-center justify-between">
            <div className="label-micro">{(type || "detail").toUpperCase()}</div>
            <div className="flex items-center gap-2 label-micro">
              {velocity.delta >= 0 ? (
                <span className="flex items-center gap-1 text-[var(--sev-critical)]"><TrendingUp className="w-3 h-3" /> +{Math.round(velocity.delta)}%</span>
              ) : (
                <span className="flex items-center gap-1 text-[var(--sev-low)]"><TrendingDown className="w-3 h-3" /> {Math.round(velocity.delta)}%</span>
              )}
              <span>· 3d vs 4d</span>
            </div>
          </div>
          <SheetTitle className="text-[var(--text-primary)] font-display text-xl tracking-tight mt-1">{title}</SheetTitle>

          {/* Hierarchy breadcrumb */}
          <HierarchyCrumb
            venture={d.venture || title}
            site={d.site || (type === "site" ? d.name : null)}
            category={d.category || (type === "category" ? d.category : null)}
            subcategory={type === "subpoint" ? d.name : null}
            severity={null}
            state={d.state}
            platform={null}
          />

          <div className="grid grid-cols-4 gap-px bg-[var(--border-default)] mt-3">
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
          <section>
            <SeverityBar data={severity} />
          </section>

          {/* Velocity & Sentiment Distribution */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
            <div className="panel p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="label-micro flex items-center gap-1.5"><Zap className="w-3 h-3 text-[var(--sev-high)]" /> Signal Velocity · 14d</div>
                <div className="label-micro">{stats.signals} signals</div>
              </div>
              <div className="h-[100px] -mx-2">
                <ResponsiveContainer>
                  <LineChart data={velocity.series}>
                    <XAxis dataKey="d" hide />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 0, fontSize: 11, fontFamily: "JetBrains Mono" }} />
                    <Line type="monotone" dataKey="count" stroke="var(--sev-critical)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel p-3">
              <div className="label-micro mb-2">Sentiment Distribution</div>
              <div className="flex h-4 border border-hair">
                <div className="bg-[var(--sev-critical)]" style={{ width: `${(stats.neg / sentTotal) * 100}%` }} title={`Negative: ${stats.neg}`} />
                <div className="bg-[var(--sev-medium)]" style={{ width: `${(stats.neu / sentTotal) * 100}%` }} title={`Neutral: ${stats.neu}`} />
                <div className="bg-[var(--sev-low)]" style={{ width: `${(stats.pos / sentTotal) * 100}%` }} title={`Positive: ${stats.pos}`} />
              </div>
              <div className="grid grid-cols-3 gap-px mt-2 bg-[var(--border-default)]">
                <div className="bg-[var(--bg-surface)] p-1.5 text-center">
                  <div className="label-micro">NEG</div><div className="font-display text-sm sev-critical">{stats.neg}</div>
                </div>
                <div className="bg-[var(--bg-surface)] p-1.5 text-center">
                  <div className="label-micro">NEU</div><div className="font-display text-sm sev-medium">{stats.neu}</div>
                </div>
                <div className="bg-[var(--bg-surface)] p-1.5 text-center">
                  <div className="label-micro">POS</div><div className="font-display text-sm sev-low">{stats.pos}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Narrative themes + Platform amplification */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="panel p-3">
              <div className="label-micro mb-2 flex items-center gap-1.5"><Radar className="w-3 h-3" /> Narrative Themes (top sub-categories)</div>
              <div className="space-y-1.5">
                {topNarratives.map((n) => (
                  <div key={n.key} className="flex items-center gap-2">
                    <div className="text-[11px] w-44 truncate">{n.key}</div>
                    <div className="flex-1 h-1.5 bg-black/5 relative">
                      <div className="h-full bg-[var(--sev-critical)]" style={{ width: `${Math.min(100, (n.count / Math.max(1, filtered.length)) * 100 * 3)}%` }} />
                    </div>
                    <div className="label-micro w-14 text-right">{n.critical}/{n.count}</div>
                  </div>
                ))}
                {!topNarratives.length && <div className="label-micro">No narratives in scope.</div>}
              </div>
            </div>

            <div className="panel p-3">
              <div className="label-micro mb-2 flex items-center gap-1.5"><Users className="w-3 h-3" /> Top Amplifiers</div>
              <div className="space-y-1.5">
                {topAuthors.map((a) => (
                  <div key={a.handle} className="flex items-center gap-2 text-[11px]">
                    <div className="flex-1 min-w-0 truncate">
                      <span className="text-[var(--text-primary)]">{a.name}</span>
                      <span className="text-[var(--text-muted)] ml-1.5">{a.handle}</span>
                    </div>
                    <span className="label-micro">crit</span>
                    <span className="font-display sev-critical w-6 text-right">{a.critical}</span>
                    <span className="font-display w-8 text-right">{a.posts}</span>
                  </div>
                ))}
              </div>

              <div className="label-micro mt-4 mb-2">Platform Amplification</div>
              <div className="space-y-1">
                {platformAmp.map((p) => (
                  <div key={p.platform} className="flex items-center gap-2 text-[11px]">
                    <span className="w-20 truncate capitalize">{p.platform}</span>
                    <div className="flex-1 h-1.5 bg-black/5">
                      <div className="h-full bg-[var(--sev-high)]" style={{ width: `${Math.min(100, (p.critical / Math.max(1, stats.critical || p.total)) * 100)}%` }} />
                    </div>
                    <span className="font-display w-10 text-right">{p.critical}/{p.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Top critical signals + states */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
            <div className="panel p-3">
              <div className="label-micro mb-2">Top Critical Signals</div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-default)]">
                {topCritical.map((p) => (
                  <button
                    key={p.id}
                    data-testid={`critical-signal-${p.id}`}
                    onClick={() => setSelectedPost(p)}
                    className="w-full text-left py-2 px-1 hover:bg-black/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5" style={{ background: SEV_COLOR[p.severity] }} />
                      <span className="label-micro">{p.platform} · {p.state}</span>
                      <span className="font-display text-[10px] ml-auto sev-critical">{p.risk_score}</span>
                    </div>
                    <div className="text-xs mt-1 line-clamp-2">{p.content}</div>
                  </button>
                ))}
                {!topCritical.length && <div className="label-micro py-3">No signals in scope.</div>}
              </div>
            </div>

            <div className="panel p-3">
              <div className="label-micro mb-2">Geographic Spread</div>
              <div className="space-y-1.5">
                {statesInvolved.map((s) => (
                  <div key={s.state} className="flex items-center gap-2 text-[11px]">
                    <span className="w-28 truncate">{s.state}</span>
                    <div className="flex-1 h-1.5 bg-black/5">
                      <div className="h-full bg-[var(--sev-critical)]" style={{ width: `${Math.min(100, (s.critical / Math.max(1, stats.critical)) * 100)}%` }} />
                    </div>
                    <span className="font-display w-10 text-right">{s.critical}/{s.count}</span>
                  </div>
                ))}
                {!statesInvolved.length && <div className="label-micro">No states involved.</div>}
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
