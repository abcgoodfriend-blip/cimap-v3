import React, { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import SeverityBar from "@/components/shared/SeverityBar";
import HierarchyCrumb from "@/components/shared/HierarchyCrumb";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Zap, Radar, Users, ChevronRight, ChevronDown } from "lucide-react";
import { getAllPosts } from "@/lib/mockData";

const SEV_COLOR = { critical: "var(--sev-critical)", high: "var(--sev-high)", medium: "var(--sev-medium)", low: "var(--sev-low)" };

function bandColor(r) {
  if (r >= 0.75) return "var(--sev-critical)";
  if (r >= 0.5) return "var(--sev-high)";
  if (r >= 0.25) return "var(--sev-medium)";
  return "var(--sev-low)";
}

function MiniDial({ value, color }) {
  const cx = 36, cy = 36, r = 28;
  const polar = (d) => { const a = (d * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const arc = (f, t) => { const [x1, y1] = polar(f); const [x2, y2] = polar(t); return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`; };
  const ang = 180 + value * 180;
  const rad = (ang * Math.PI) / 180;
  const nx = cx + (r - 4) * Math.cos(rad);
  const ny = cy + (r - 4) * Math.sin(rad);
  return (
    <svg viewBox="0 0 72 44" className="w-[64px] h-[40px]">
      <path d={arc(180, 360)} stroke="rgba(0,0,0,0.08)" strokeWidth="6" fill="none" />
      <path d={arc(180, 180 + value * 180)} stroke={color} strokeWidth="6" fill="none" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--text-primary)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="2" fill="var(--text-primary)" />
    </svg>
  );
}

/* Severity tree: ven→site→subcategory rows with risk bars */
function SeverityTree({ severity }) {
  const { setSelectedPost } = useApp();
  const all = getAllPosts();
  const posts = all.filter((p) => p.severity === severity);

  const tree = useMemo(() => {
    const t = {};
    posts.forEach((p) => {
      if (!t[p.venture]) t[p.venture] = { name: p.venture, signals: 0, risk: 0, sites: {} };
      t[p.venture].signals++; t[p.venture].risk += p.risk_score;
      if (!t[p.venture].sites[p.site]) t[p.venture].sites[p.site] = { name: p.site, state: p.state, signals: 0, risk: 0, subs: {} };
      const st = t[p.venture].sites[p.site];
      st.signals++; st.risk += p.risk_score;
      if (!st.subs[p.subcategory]) st.subs[p.subcategory] = { name: p.subcategory, category: p.category, signals: 0, risk: 0, examples: [] };
      const sub = st.subs[p.subcategory];
      sub.signals++; sub.risk += p.risk_score;
      if (sub.examples.length < 3) sub.examples.push(p);
    });
    return Object.values(t).map((v) => ({
      ...v, avg_risk: v.risk / Math.max(1, v.signals),
      sites: Object.values(v.sites).map((s) => ({
        ...s, avg_risk: s.risk / Math.max(1, s.signals),
        subs: Object.values(s.subs).map((sb) => ({ ...sb, avg_risk: sb.risk / Math.max(1, sb.signals) })).sort((a, b) => b.avg_risk - a.avg_risk),
      })).sort((a, b) => b.avg_risk - a.avg_risk),
    })).sort((a, b) => b.avg_risk - a.avg_risk);
  }, [posts]);

  const [openV, setOpenV] = React.useState(() => new Set(tree.slice(0, 1).map((x) => x.name)));
  const [openS, setOpenS] = React.useState(new Set());
  const toggle = (set, key) => {
    const n = new Set(set); n.has(key) ? n.delete(key) : n.add(key); return n;
  };

  return (
    <div data-testid={`severity-tree-${severity}`} className="panel h-full overflow-y-auto border-0">
      {tree.map((v) => {
        const vOpen = openV.has(v.name);
        return (
          <div key={v.name} className="border-b border-hair">
            <button
              type="button"
              onClick={() => setOpenV(toggle(openV, v.name))}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-black/[0.03]"
            >
              {vOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span className="font-display text-sm flex-1 text-left">{v.name}</span>
              <span className="flex-1 max-w-[160px] h-1.5 bg-black/5 hidden md:block">
                <span className="block h-full" style={{ background: bandColor(v.avg_risk), width: `${Math.min(100, v.avg_risk * 100)}%` }} />
              </span>
              <span className="label-micro w-10 text-right" style={{ color: bandColor(v.avg_risk) }}>{(v.avg_risk * 100).toFixed(0)}</span>
              <span className="label-micro w-12 text-right">{v.signals}</span>
            </button>

            {vOpen && v.sites.map((s) => {
              const sKey = `${v.name}__${s.name}`;
              const sOpen = openS.has(sKey);
              return (
                <div key={sKey}>
                  <button
                    type="button"
                    onClick={() => setOpenS(toggle(openS, sKey))}
                    className="w-full flex items-center gap-2 px-3 py-1.5 pl-8 hover:bg-black/[0.03] border-t border-hair"
                  >
                    {sOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span className="text-xs flex-1 text-left">{s.name} <span className="label-micro ml-1.5">{s.state}</span></span>
                    <span className="flex-1 max-w-[160px] h-1 bg-black/5 hidden md:block">
                      <span className="block h-full" style={{ background: bandColor(s.avg_risk), width: `${Math.min(100, s.avg_risk * 100)}%` }} />
                    </span>
                    <span className="label-micro w-10 text-right">{(s.avg_risk * 100).toFixed(0)}</span>
                    <span className="label-micro w-12 text-right">{s.signals}</span>
                  </button>
                  {sOpen && s.subs.map((sub) => (
                    <div key={sub.name} className="pl-14 pr-3 py-1.5 border-t border-hair hover:bg-black/[0.03]">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5" style={{ background: SEV_COLOR[severity] }} />
                        <span className="text-xs flex-1 truncate">{sub.name}</span>
                        <span className="label-micro">{sub.category}</span>
                        <span className="label-micro w-10 text-right" style={{ color: bandColor(sub.avg_risk) }}>{(sub.avg_risk * 100).toFixed(0)}</span>
                        <span className="label-micro w-8 text-right">{sub.signals}</span>
                      </div>
                      <div className="mt-1 pl-3 space-y-0.5">
                        {sub.examples.map((ex) => (
                          <button key={ex.id} onClick={() => setSelectedPost(ex)} className="block text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left w-full truncate">
                            · {ex.content}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
      {!tree.length && <div className="p-4 label-micro">No {severity} signals.</div>}
    </div>
  );
}

export default function DetailDrawer() {
  const { selectedDetail, setSelectedDetail, posts, setSelectedPost } = useApp();
  const open = !!selectedDetail;
  const d = selectedDetail?.payload || {};
  const type = selectedDetail?.type;
  const title = d.name || d.category || d.site || d.venture || d.state || (d.severity ? `${d.severity.toUpperCase()} Signals` : "Detail");

  const filtered = useMemo(() => {
    if (!selectedDetail) return [];
    const source = type === "severity" ? getAllPosts() : (posts || []);
    return source.filter((p) => {
      if (type === "severity") return p.severity === d.severity;
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
    const avgRisk = filtered.length ? filtered.reduce((a, p) => a + p.risk_score, 0) / filtered.length : 0;
    const avgSent = filtered.length ? filtered.reduce((a, p) => a + p.sentiment, 0) / filtered.length : 0;
    const pos = filtered.filter((p) => p.sentiment > 0.15).length;
    const neg = filtered.filter((p) => p.sentiment < -0.15).length;
    const neu = filtered.length - pos - neg;
    return { signals: filtered.length, critical: crit, avgRisk, avgSent, pos, neu, neg };
  }, [filtered]);

  const severity = useMemo(() => {
    const m = { critical: 0, high: 0, medium: 0, low: 0 };
    filtered.forEach((p) => { m[p.severity]++; });
    const t = filtered.length || 1;
    return ["critical", "high", "medium", "low"].map((s) => ({ severity: s, count: m[s], percent: Math.round((m[s] / t) * 100) }));
  }, [filtered]);

  const topNarratives = useMemo(() => {
    const m = {};
    filtered.forEach((p) => {
      if (!m[p.subcategory]) m[p.subcategory] = { key: p.subcategory, count: 0, critical: 0, risk: 0 };
      m[p.subcategory].count++;
      if (p.severity === "critical") m[p.subcategory].critical++;
      m[p.subcategory].risk += p.risk_score;
    });
    return Object.values(m).map((x) => ({ ...x, risk: x.risk / Math.max(1, x.count) }))
      .sort((a, b) => b.critical * 2 + b.risk - (a.critical * 2 + a.risk))
      .slice(0, 8);
  }, [filtered]);

  const topAuthors = useMemo(() => {
    const m = {};
    filtered.forEach((p) => {
      if (!m[p.handle]) m[p.handle] = { handle: p.handle, name: p.author, posts: 0, critical: 0, reach: 0 };
      m[p.handle].posts++;
      if (p.severity === "critical") m[p.handle].critical++;
      m[p.handle].reach += p.reach || 0;
    });
    return Object.values(m).sort((a, b) => b.critical - a.critical || b.reach - a.reach).slice(0, 6);
  }, [filtered]);

  const velocity = useMemo(() => {
    const out = [], DAY = 86400 * 1000;
    for (let i = 13; i >= 0; i--) {
      const start = Date.now() - i * DAY, end = start + DAY;
      const count = filtered.filter((p) => { const t = new Date(p.timestamp).getTime(); return t >= start && t < end; }).length;
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
    return Object.values(m).sort((a, b) => b.critical - a.critical);
  }, [filtered]);

  const statesInvolved = useMemo(() => {
    const m = {};
    filtered.forEach((p) => {
      if (!m[p.state]) m[p.state] = { state: p.state, count: 0, critical: 0 };
      m[p.state].count++;
      if (p.severity === "critical") m[p.state].critical++;
    });
    return Object.values(m).sort((a, b) => b.critical - a.critical).slice(0, 8);
  }, [filtered]);

  const sentTotal = Math.max(1, stats.pos + stats.neu + stats.neg);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && setSelectedDetail(null)}>
      <SheetContent
        side="right"
        data-testid="detail-drawer"
        className="w-screen sm:max-w-none h-screen max-h-screen rounded-none bg-[var(--bg-app)] border-l border-hair text-[var(--text-primary)] p-0 overflow-hidden z-[90] flex flex-col"
      >
        <SheetHeader className="px-3 py-2 border-b border-hair bg-[var(--bg-surface)] text-left flex-shrink-0 space-y-0">
          <div className="flex items-center justify-between">
            <div className="label-micro">{(type || "detail").toUpperCase()}</div>
            <div className="flex items-center gap-2 label-micro">
              {velocity.delta >= 0
                ? <span className="flex items-center gap-1 text-[var(--sev-critical)]"><TrendingUp className="w-3 h-3" /> +{Math.round(velocity.delta)}%</span>
                : <span className="flex items-center gap-1 text-[var(--sev-low)]"><TrendingDown className="w-3 h-3" /> {Math.round(velocity.delta)}%</span>
              }
              <span>· 3d vs 4d</span>
            </div>
          </div>
          <SheetTitle className="text-[var(--text-primary)] font-display text-base lg:text-lg tracking-tight mt-0.5">{title}</SheetTitle>
          <HierarchyCrumb
            venture={d.venture || (type === "venture" ? d.name : null)}
            site={d.site || (type === "site" ? d.name : null)}
            category={type === "category" ? d.category : d.category}
            subcategory={type === "subpoint" ? d.name : null}
            severity={type === "severity" ? d.severity : null}
            state={d.state}
            platform={null}
          />
          <div className="grid grid-cols-4 gap-px bg-[var(--border-default)] mt-2">
            <div className="bg-[var(--bg-surface)] px-2 py-1"><div className="label-micro">Signals</div><div className="font-display text-sm">{stats.signals}</div></div>
            <div className="bg-[var(--bg-surface)] px-2 py-1"><div className="label-micro">Critical</div><div className="font-display text-sm sev-critical">{stats.critical}</div></div>
            <div className="bg-[var(--bg-surface)] px-2 py-1"><div className="label-micro">Avg Risk</div><div className="font-display text-sm sev-high">{stats.avgRisk.toFixed(2)}</div></div>
            <div className="bg-[var(--bg-surface)] px-2 py-1"><div className="label-micro">Avg Sentiment</div>
              <div className="font-display text-sm" style={{ color: stats.avgSent < 0 ? "var(--sev-high)" : "var(--sev-low)" }}>{stats.avgSent.toFixed(2)}</div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden p-3">
         <div className="lg:h-full grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)]">

          {/* Row 1 — SeverityBar */}
          <div className="md:col-span-2 lg:col-span-3 lg:row-start-1 min-h-0 flex flex-col justify-center">
            <SeverityBar data={severity} />
          </div>

          {/* Row 1 — Executive Brief */}
          <section className="panel md:col-span-2 lg:col-span-9 lg:row-start-1 min-h-0 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-hair label-micro flex-shrink-0">Executive Brief · At-a-glance</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[var(--border-default)] flex-1 min-h-0 overflow-y-auto">
              <div className="bg-[var(--bg-surface)] px-2 py-1.5">
                <div className="label-micro">Total Reach</div>
                {(() => {
                  const r = filtered.reduce((a, x) => a + (x.reach || 0), 0);
                  const txt = r >= 1e6 ? (r / 1e6).toFixed(1) + "M" : r >= 1e3 ? (r / 1e3).toFixed(1) + "K" : String(r);
                  return <div className="font-display text-sm">{txt}</div>;
                })()}
                <div className="label-micro">aggregate eyeballs</div>
              </div>
              <div className="bg-[var(--bg-surface)] px-2 py-1.5">
                <div className="label-micro">Unique Voices</div>
                <div className="font-display text-sm">{new Set(filtered.map((x) => x.handle)).size}</div>
                <div className="label-micro">distinct authors</div>
              </div>
              <div className="bg-[var(--bg-surface)] px-2 py-1.5">
                <div className="label-micro">Amplification</div>
                {(() => {
                  const s = filtered.reduce((a, x) => a + (x.shares || 0), 0);
                  const txt = s >= 1e6 ? (s / 1e6).toFixed(1) + "M" : s >= 1e3 ? (s / 1e3).toFixed(1) + "K" : String(s);
                  return <div className="font-display text-sm">{txt}</div>;
                })()}
                <div className="label-micro">total shares</div>
              </div>
              <div className="bg-[var(--bg-surface)] px-2 py-1.5">
                <div className="label-micro">Risk Trend · 7d vs 30d</div>
                {(() => {
                  const DAY = 86400 * 1000, now = Date.now();
                  const r7 = filtered.filter((x) => now - new Date(x.timestamp).getTime() <= 7 * DAY);
                  const r30 = filtered.filter((x) => now - new Date(x.timestamp).getTime() <= 30 * DAY);
                  const a7 = r7.length ? r7.reduce((a, x) => a + x.risk_score, 0) / r7.length : 0;
                  const a30 = r30.length ? r30.reduce((a, x) => a + x.risk_score, 0) / r30.length : 0;
                  const delta = a30 > 0 ? ((a7 - a30) / a30) * 100 : 0;
                  const up = delta >= 0;
                  return (
                    <>
                      <div className="font-display text-sm" style={{ color: up ? "var(--sev-critical)" : "var(--sev-low)" }}>
                        {up ? "+" : ""}{delta.toFixed(0)}%
                      </div>
                      <div className="label-micro">risk drift</div>
                    </>
                  );
                })()}
              </div>
              <div className="bg-[var(--bg-surface)] px-2 py-1.5">
                <div className="label-micro">Peak Hour · IST</div>
                {(() => {
                  const h = new Array(24).fill(0);
                  filtered.forEach((x) => { h[new Date(x.timestamp).getHours()]++; });
                  const peak = h.indexOf(Math.max(...h));
                  return <div className="font-display text-sm">{String(peak).padStart(2, "0")}:00</div>;
                })()}
                <div className="label-micro">most-active window</div>
              </div>
              <div className="bg-[var(--bg-surface)] px-2 py-1.5">
                <div className="label-micro">Coordination Score</div>
                {(() => {
                  const DAY = 86400 * 1000;
                  let clustered = 0;
                  for (let i = 0; i < filtered.length; i++) {
                    const t = new Date(filtered[i].timestamp).getTime();
                    if (filtered.some((q, j) => j !== i && q.subcategory === filtered[i].subcategory && Math.abs(new Date(q.timestamp).getTime() - t) <= DAY)) clustered++;
                  }
                  const pct = filtered.length ? Math.round((clustered / filtered.length) * 100) : 0;
                  const c = pct >= 60 ? "var(--sev-critical)" : pct >= 30 ? "var(--sev-high)" : "var(--sev-low)";
                  const label = pct >= 60 ? "likely campaign" : pct >= 30 ? "mixed" : "organic";
                  return (
                    <>
                      <div className="font-display text-sm" style={{ color: c }}>{pct}%</div>
                      <div className="label-micro">{label}</div>
                    </>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* Row 2 — Stakeholder Tiers */}
          <section className="panel lg:col-span-3 min-h-0 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-hair label-micro flex-shrink-0">Stakeholder Tiers · by follower influence</div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3">
              {(() => {
                const tiers = { "Celebrity / Major Media": 0, "Influencer / Mid-Media": 0, "Activist / Niche": 0, "Grassroots": 0 };
                const colors = { "Celebrity / Major Media": "var(--sev-critical)", "Influencer / Mid-Media": "var(--sev-high)", "Activist / Niche": "var(--sev-medium)", "Grassroots": "var(--sev-low)" };
                filtered.forEach((x) => {
                  const f = x.author_followers || 0;
                  if (f >= 1e6) tiers["Celebrity / Major Media"]++;
                  else if (f >= 1e5) tiers["Influencer / Mid-Media"]++;
                  else if (f >= 1e4) tiers["Activist / Niche"]++;
                  else tiers["Grassroots"]++;
                });
                const max = Math.max(1, ...Object.values(tiers));
                return (
                  <div className="space-y-1.5">
                    {Object.entries(tiers).map(([t, n]) => (
                      <div key={t} className="flex items-center gap-2 text-[11px]">
                        <span className="w-32 truncate">{t}</span>
                        <div className="flex-1 h-1.5 bg-black/5">
                          <div className="h-full" style={{ background: colors[t], width: `${(n / max) * 100}%` }} />
                        </div>
                        <span className="font-display w-10 text-right">{n}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                {(() => {
                  const legal = filtered.some((x) => x.category === "Legal & Litigation");
                  const fin = filtered.some((x) => x.category === "Financial Irregularities");
                  const needsBoard = stats.critical >= 10 || (stats.signals > 0 && stats.critical / Math.max(1, stats.signals) > 0.4);
                  const chips = [];
                  if (legal) chips.push({ t: "LEGAL PROXIMITY", c: "var(--sev-critical)" });
                  if (fin) chips.push({ t: "FINANCIAL EXPOSURE", c: "var(--sev-critical)" });
                  if (needsBoard) chips.push({ t: "BOARD-ESCALATION LIKELY", c: "var(--sev-high)" });
                  if (!chips.length) chips.push({ t: "NO IMMEDIATE ESCALATION", c: "var(--sev-low)" });
                  return chips.map((c) => (
                    <span key={c.t} className="label-micro px-1.5 py-0.5 border" style={{ color: c.c, borderColor: c.c }}>{c.t}</span>
                  ));
                })()}
              </div>
            </div>
          </section>

          {/* Row 2 — Verbatim Quotes */}
          <section className="panel lg:col-span-3 min-h-0 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-hair label-micro flex-shrink-0">Verbatim Signal Quotes · Top-amplified</div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
              {[...filtered].sort((a, b) => (b.shares || 0) - (a.shares || 0)).slice(0, 5).map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setSelectedPost(x)}
                  className="w-full text-left border-l-2 pl-2.5 py-1 hover:bg-black/[0.03]"
                  style={{ borderColor: SEV_COLOR[x.severity] }}
                >
                  <div className="text-[11px] italic leading-snug text-[var(--text-primary)]">"{(x.content || "").slice(0, 170)}"</div>
                  <div className="label-micro mt-1 truncate">— {x.author} · {x.handle} · {((x.shares || 0) / 1000).toFixed(1)}K shares · {x.platform}</div>
                </button>
              ))}
              {!filtered.length && <div className="label-micro">No quotes available.</div>}
            </div>
          </section>

          {/* Row 2 — Velocity + Sentiment Distribution (combined) */}
          <section className="panel lg:col-span-3 min-h-0 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-hair label-micro flex-shrink-0 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-[var(--sev-high)]" /> Velocity · 14d</span>
              <span>{stats.signals} signals</span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3">
              <div className="h-[90px] -mx-2">
                <ResponsiveContainer>
                  <LineChart data={velocity.series}>
                    <XAxis dataKey="d" hide />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 0, fontSize: 11, fontFamily: "JetBrains Mono" }} />
                    <Line type="monotone" dataKey="count" stroke="var(--sev-critical)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="label-micro mt-3 mb-1.5">Sentiment Distribution</div>
              <div className="flex h-4 border border-hair">
                <div className="bg-[var(--sev-critical)]" style={{ width: `${(stats.neg / sentTotal) * 100}%` }} />
                <div className="bg-[var(--sev-medium)]" style={{ width: `${(stats.neu / sentTotal) * 100}%` }} />
                <div className="bg-[var(--sev-low)]" style={{ width: `${(stats.pos / sentTotal) * 100}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-px mt-2 bg-[var(--border-default)]">
                <div className="bg-[var(--bg-surface)] p-1.5 text-center"><div className="label-micro">NEG</div><div className="font-display text-sm sev-critical">{stats.neg}</div></div>
                <div className="bg-[var(--bg-surface)] p-1.5 text-center"><div className="label-micro">NEU</div><div className="font-display text-sm sev-medium">{stats.neu}</div></div>
                <div className="bg-[var(--bg-surface)] p-1.5 text-center"><div className="label-micro">POS</div><div className="font-display text-sm sev-low">{stats.pos}</div></div>
              </div>
            </div>
          </section>

          {/* Row 2 — Narrative Themes */}
          <section className="panel lg:col-span-3 min-h-0 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-hair label-micro flex-shrink-0 flex items-center gap-1.5"><Radar className="w-3 h-3" /> Narrative Themes</div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1.5">
              {topNarratives.map((n) => (
                <div key={n.key} className="flex items-center gap-2">
                  <div className="text-[11px] flex-1 min-w-0 truncate">{n.key}</div>
                  <div className="w-20 h-1.5 bg-black/5"><div className="h-full bg-[var(--sev-critical)]" style={{ width: `${Math.min(100, (n.count / Math.max(1, filtered.length)) * 100 * 3)}%` }} /></div>
                  <div className="label-micro w-14 text-right">{n.critical}/{n.count}</div>
                </div>
              ))}
              {!topNarratives.length && <div className="label-micro">No narrative themes.</div>}
            </div>
          </section>

          {/* Row 3 — Top Amplifiers + Platform */}
          <section className="panel lg:col-span-3 min-h-0 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-hair label-micro flex-shrink-0 flex items-center gap-1.5"><Users className="w-3 h-3" /> Top Amplifiers</div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3">
              <div className="space-y-1.5">
                {topAuthors.map((a) => (
                  <div key={a.handle} className="flex items-center gap-2 text-[11px]">
                    <div className="flex-1 min-w-0 truncate">
                      <span className="text-[var(--text-primary)]">{a.name}</span>
                      <span className="text-[var(--text-muted)] ml-1.5">{a.handle}</span>
                    </div>
                    <span className="label-micro">{Math.round(a.reach / 1000)}K</span>
                    <span className="font-display sev-critical w-6 text-right">{a.critical}</span>
                    <span className="font-display w-8 text-right">{a.posts}</span>
                  </div>
                ))}
              </div>
              <div className="label-micro mt-3 mb-2">Platform Amplification</div>
              <div className="space-y-1">
                {platformAmp.map((p) => (
                  <div key={p.platform} className="flex items-center gap-2 text-[11px]">
                    <span className="w-20 truncate capitalize">{p.platform}</span>
                    <div className="flex-1 h-1.5 bg-black/5"><div className="h-full bg-[var(--sev-high)]" style={{ width: `${Math.min(100, (p.critical / Math.max(1, stats.critical || p.total)) * 100)}%` }} /></div>
                    <span className="font-display w-10 text-right">{p.critical}/{p.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Row 3 — Top Critical Signals */}
          <section className="panel lg:col-span-3 min-h-0 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-hair label-micro flex-shrink-0">Top Critical Signals</div>
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[var(--border-default)]">
              {[...filtered].sort((a, b) => b.risk_score - a.risk_score).slice(0, 12).map((p) => (
                <button
                  key={p.id}
                  data-testid={`critical-signal-${p.id}`}
                  onClick={() => setSelectedPost(p)}
                  className="w-full text-left py-2 px-3 hover:bg-black/[0.03]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5" style={{ background: SEV_COLOR[p.severity] }} />
                    <span className="label-micro">{p.platform} · {p.state}</span>
                    <span className="font-display text-[10px] ml-auto sev-critical">{p.risk_score}</span>
                  </div>
                  <div className="text-xs mt-1 line-clamp-2">{p.content}</div>
                </button>
              ))}
              {!filtered.length && <div className="label-micro p-3">No critical signals.</div>}
            </div>
          </section>

          {/* Row 3 — Geographic Spread */}
          <section className="panel lg:col-span-3 min-h-0 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-hair label-micro flex-shrink-0">Geographic Spread</div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1.5">
              {statesInvolved.map((s) => (
                <div key={s.state} className="flex items-center gap-2 text-[11px]">
                  <span className="w-28 truncate">{s.state}</span>
                  <div className="flex-1 h-1.5 bg-black/5"><div className="h-full bg-[var(--sev-critical)]" style={{ width: `${Math.min(100, (s.critical / Math.max(1, stats.critical)) * 100)}%` }} /></div>
                  <span className="font-display w-10 text-right">{s.critical}/{s.count}</span>
                </div>
              ))}
              {!statesInvolved.length && <div className="label-micro">No geographic data.</div>}
            </div>
          </section>

          {/* Row 3 — Conditional: Severity tree OR Sub-category dials (fills 8th tile) */}
          {type === "severity" && (
            <section className="panel lg:col-span-3 min-h-0 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-hair label-micro flex-shrink-0">Signal Tree · VEN → SITE → SUB</div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <SeverityTree severity={d.severity} />
              </div>
            </section>
          )}
          {type === "category" && Array.isArray(d.subcategories) && d.subcategories.length > 0 && (
            <section className="panel lg:col-span-3 min-h-0 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-hair label-micro flex-shrink-0">Sub-category Risk · {d.category}</div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="grid grid-cols-1 gap-px bg-[var(--border-default)]">
                  {d.subcategories.map((sc) => (
                    <div key={sc.name} className="bg-[var(--bg-surface)] p-2.5 flex items-center gap-3">
                      <MiniDial value={sc.avg_risk} color={bandColor(sc.avg_risk)} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-display truncate">{sc.name}</div>
                        <div className="flex items-center gap-3 label-micro mt-0.5">
                          <span className="sev-critical">● {sc.critical}</span>
                          <span>{sc.signals} sig</span>
                        </div>
                      </div>
                      <div className="font-display text-lg" style={{ color: bandColor(sc.avg_risk) }}>
                        {Math.round(sc.avg_risk * 100)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
         </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
