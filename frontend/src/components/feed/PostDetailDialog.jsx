import React, { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import HierarchyCrumb from "@/components/shared/HierarchyCrumb";
import { Video, ExternalLink, TrendingUp, Share2, Radio, Target, AlertOctagon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { getAllPosts } from "@/lib/mockData";

const SEV_COLOR = { critical: "var(--sev-critical)", high: "var(--sev-high)", medium: "var(--sev-medium)", low: "var(--sev-low)" };

function Gauge({ label, value, max = 1, color, testid }) {
  const pct = Math.round((value / max) * 100);
  const R = 50, C = Math.PI * R, dash = C * (value / max);
  return (
    <div data-testid={testid} className="panel-dark p-3 text-center">
      <div className="relative w-[130px] h-[72px] mx-auto">
        <svg viewBox="0 0 130 72" className="w-full h-full">
          <path d="M 15 65 A 50 50 0 0 1 115 65" stroke="rgba(0,0,0,0.06)" strokeWidth="9" fill="none" />
          <path d="M 15 65 A 50 50 0 0 1 115 65" stroke={color} strokeWidth="9" fill="none" strokeDasharray={`${dash} ${C}`} />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <div className="font-display text-2xl leading-none" style={{ color }}>{pct}</div>
          <div className="label-micro">{label}</div>
        </div>
      </div>
    </div>
  );
}

function fmt(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

export default function PostDetailDialog() {
  const { selectedPost, setSelectedPost, posts } = useApp();
  const open = !!selectedPost;
  const p = selectedPost || {};

  const allPosts = useMemo(() => getAllPosts(), []);

  const siteTrend = useMemo(() => {
    if (!p.site) return [];
    const DAY = 86400 * 1000, out = [];
    for (let i = 29; i >= 0; i--) {
      const s = Date.now() - i * DAY, e = s + DAY;
      const list = allPosts.filter((x) => x.site === p.site && new Date(x.timestamp).getTime() >= s && new Date(x.timestamp).getTime() < e);
      const avg = list.length ? list.reduce((a, x) => a + x.sentiment, 0) / list.length : 0;
      out.push({ d: new Date(s).toISOString().slice(5, 10), sent: Number(avg.toFixed(2)), count: list.length });
    }
    return out;
  }, [p.site, allPosts]);

  const similar = useMemo(() => {
    if (!p.subcategory) return [];
    const DAY = 86400 * 1000, out = [];
    for (let i = 29; i >= 0; i--) {
      const s = Date.now() - i * DAY, e = s + DAY;
      const count = allPosts.filter((x) => x.subcategory === p.subcategory && new Date(x.timestamp).getTime() >= s && new Date(x.timestamp).getTime() < e).length;
      out.push({ d: i, count });
    }
    return out;
  }, [p.subcategory, allPosts]);

  const related = useMemo(() => {
    if (!p.id) return [];
    return posts.filter((x) => x.id !== p.id && (x.site === p.site || x.subcategory === p.subcategory)).slice(0, 6);
  }, [p, posts]);

  const virality = useMemo(() => {
    const base = (p.shares || 0) + (p.reach || 0) / 10;
    return Math.min(100, Math.round(Math.sqrt(base) * 2));
  }, [p]);

  const influence = useMemo(() => {
    const f = p.author_followers || 0;
    return Math.min(100, Math.round(Math.log10(Math.max(10, f)) * 14));
  }, [p]);

  const actions = useMemo(() => {
    const a = [];
    if (p.severity === "critical") a.push({ c: "var(--sev-critical)", t: "Escalate to Crisis Comms within 2 hours" });
    if (p.sentiment < -0.3) a.push({ c: "var(--sev-high)", t: "Draft factual rebuttal; cite third-party audits" });
    if ((p.reach || 0) > 1_000_000) a.push({ c: "var(--sev-high)", t: "Engage platform trust-&-safety for moderation review" });
    if (p.category === "Legal & Litigation") a.push({ c: "var(--text-primary)", t: "Loop in General Counsel; hold press statements" });
    if (p.category === "Environment & Resource Conflicts") a.push({ c: "var(--text-primary)", t: "Publish latest ESIA summary and community-engagement log" });
    if (!a.length) a.push({ c: "var(--sev-low)", t: "Monitor for 24h; no immediate action required" });
    return a.slice(0, 3);
  }, [p]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setSelectedPost(null)}>
      <DialogContent
        data-testid="post-detail-dialog"
        className="max-w-5xl rounded-none bg-[var(--bg-app)] border border-hair text-[var(--text-primary)] p-0 max-h-[92vh] overflow-y-auto z-[95]"
      >
        <DialogHeader className="p-4 border-b border-hair bg-[var(--bg-surface)]">
          <DialogTitle className="text-[var(--text-primary)] font-display text-lg tracking-tight text-left">
            Signal Inspection · {p.site}
          </DialogTitle>
          <HierarchyCrumb
            venture={p.venture} site={p.site} category={p.category}
            subcategory={p.subcategory} severity={p.severity}
            state={p.state} platform={p.platform}
          />
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Gauge testid="gauge-risk" label="RISK" value={p.risk_score || 0} color="var(--sev-critical)" />
            <Gauge testid="gauge-sentiment" label="SENTIMENT" value={(p.sentiment || 0) + 1} max={2} color={(p.sentiment || 0) < 0 ? "var(--sev-high)" : "var(--sev-low)"} />
            <Gauge testid="gauge-virality" label="VIRALITY" value={virality / 100} color="var(--sev-high)" />
            <Gauge testid="gauge-influence" label="INFLUENCE" value={influence / 100} color="var(--text-primary)" />
          </div>

          {/* Amplifier / Reach / Velocity trio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--border-default)]">
            <div className="bg-[var(--bg-surface)] p-3">
              <div className="flex items-center gap-1.5 label-micro mb-1"><Radio className="w-3 h-3" /> Author Reach</div>
              <div className="font-display text-xl">{fmt(p.reach)}</div>
              <div className="label-micro mt-0.5">of {fmt(p.author_followers)} followers</div>
            </div>
            <div className="bg-[var(--bg-surface)] p-3">
              <div className="flex items-center gap-1.5 label-micro mb-1"><Share2 className="w-3 h-3" /> Shares / Amplification</div>
              <div className="font-display text-xl">{fmt(p.shares)}</div>
              <div className="label-micro mt-0.5">cross-platform signal echo</div>
            </div>
            <div className="bg-[var(--bg-surface)] p-3">
              <div className="flex items-center gap-1.5 label-micro mb-1"><TrendingUp className="w-3 h-3" /> Narrative Age</div>
              <div className="font-display text-xl">{p.timestamp ? Math.max(0, Math.round((Date.now() - new Date(p.timestamp).getTime()) / 3600000)) : 0}h</div>
              <div className="label-micro mt-0.5">since first observed</div>
            </div>
          </div>

          <div className="panel p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="label-micro">Content</div>
              <a className="flex items-center gap-1 label-micro hover:text-[var(--text-primary)]" href={p.url || "#"} target="_blank" rel="noreferrer">
                <ExternalLink className="w-3 h-3" /> Source
              </a>
            </div>
            <div className="text-sm leading-relaxed">{p.content}</div>

            {p.has_video && p.video_url && (
              <video src={p.video_url} controls autoPlay muted loop className="mt-3 w-full aspect-video bg-black" />
            )}
            {!p.has_video && p.image_url && (
              <img src={p.image_url} alt="" className="mt-3 w-full aspect-video object-cover" />
            )}
            {!p.has_video && !p.image_url && (
              <div className="mt-3 aspect-video bg-[var(--bg-inset)] border border-hair flex items-center justify-center">
                <Video className="w-8 h-8 text-[var(--text-muted)]" />
                <span className="label-micro ml-3">No media available</span>
              </div>
            )}
            <div className="grid grid-cols-4 gap-px bg-[var(--border-default)] mt-3">
              <div className="bg-[var(--bg-surface)] p-2"><div className="label-micro">Author</div><div className="text-xs truncate">{p.author}</div></div>
              <div className="bg-[var(--bg-surface)] p-2"><div className="label-micro">Handle</div><div className="text-xs truncate">{p.handle}</div></div>
              <div className="bg-[var(--bg-surface)] p-2"><div className="label-micro">Platform</div><div className="text-xs capitalize">{p.platform}</div></div>
              <div className="bg-[var(--bg-surface)] p-2"><div className="label-micro">When</div><div className="text-xs">{p.timestamp ? new Date(p.timestamp).toLocaleString() : "—"}</div></div>
            </div>
          </div>

          {/* Trend analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="panel p-3">
              <div className="label-micro mb-1">Sentiment Trajectory · {p.site} · 30d</div>
              <div className="h-[140px]">
                <ResponsiveContainer>
                  <LineChart data={siteTrend}>
                    <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="2 2" />
                    <XAxis dataKey="d" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} stroke="rgba(0,0,0,0.3)" />
                    <YAxis domain={[-1, 1]} tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} stroke="rgba(0,0,0,0.3)" />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 0, fontSize: 11 }} />
                    <Line type="monotone" dataKey="sent" stroke="var(--sev-high)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="panel p-3">
              <div className="label-micro mb-1">Similar Signals Frequency · {p.subcategory} · 30d</div>
              <div className="h-[140px]">
                <ResponsiveContainer>
                  <LineChart data={similar}>
                    <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="2 2" />
                    <XAxis dataKey="d" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} stroke="rgba(0,0,0,0.3)" reversed />
                    <YAxis tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} stroke="rgba(0,0,0,0.3)" />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 0, fontSize: 11 }} />
                    <Line type="monotone" dataKey="count" stroke="var(--sev-critical)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="panel p-3">
            <div className="label-micro flex items-center gap-1.5 mb-2"><Target className="w-3 h-3" /> Recommended Actions</div>
            <div className="space-y-1.5">
              {actions.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] border-l-2 pl-2.5 py-0.5" style={{ borderColor: a.c }}>
                  <AlertOctagon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: a.c }} />
                  <span>{a.t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-3">
            <div className="label-micro mb-2">Related Signals</div>
            <div className="divide-y divide-[var(--border-default)]">
              {related.map((r) => (
                <button key={r.id} data-testid={`related-${r.id}`} onClick={() => setSelectedPost(r)} className="w-full text-left py-2 px-1 hover:bg-black/[0.03]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5" style={{ background: SEV_COLOR[r.severity] }} />
                    <span className="label-micro">{r.platform} · {r.state}</span>
                    <span className="label-micro ml-auto">{new Date(r.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs mt-1 line-clamp-2">{r.content}</div>
                </button>
              ))}
              {!related.length && <div className="label-micro py-3">No related signals.</div>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
