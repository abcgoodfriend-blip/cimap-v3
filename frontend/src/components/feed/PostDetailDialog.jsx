import React, { useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import HierarchyCrumb from "@/components/shared/HierarchyCrumb";
import { Video, ExternalLink } from "lucide-react";

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

export default function PostDetailDialog() {
  const { selectedPost, setSelectedPost, posts } = useApp();
  const open = !!selectedPost;
  const p = selectedPost || {};

  const related = useMemo(() => {
    if (!p.id) return [];
    return posts.filter((x) => x.id !== p.id && (x.site === p.site || x.subcategory === p.subcategory)).slice(0, 6);
  }, [p, posts]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setSelectedPost(null)}>
      <DialogContent
        data-testid="post-detail-dialog"
        className="max-w-3xl rounded-none bg-[var(--bg-app)] border border-hair text-[var(--text-primary)] p-0 max-h-[90vh] overflow-y-auto z-[95]"
      >
        <DialogHeader className="p-4 border-b border-hair bg-[var(--bg-surface)]">
          <DialogTitle className="text-[var(--text-primary)] font-display text-lg tracking-tight text-left">
            Signal Inspection · {p.site}
          </DialogTitle>
          <HierarchyCrumb
            venture={p.venture}
            site={p.site}
            category={p.category}
            subcategory={p.subcategory}
            severity={p.severity}
            state={p.state}
            platform={p.platform}
          />
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Gauge testid="gauge-risk" label="RISK" value={p.risk_score || 0} color="var(--sev-critical)" />
            <Gauge testid="gauge-sentiment" label="SENTIMENT" value={(p.sentiment || 0) + 1} max={2} color={(p.sentiment || 0) < 0 ? "var(--sev-high)" : "var(--sev-low)"} />
          </div>

          <div className="panel p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="label-micro">Content</div>
              <a className="flex items-center gap-1 label-micro hover:text-[var(--text-primary)]" href={p.url || "#"} target="_blank" rel="noreferrer">
                <ExternalLink className="w-3 h-3" /> Source
              </a>
            </div>
            <div className="text-sm leading-relaxed">{p.content}</div>
            {p.has_video && (
              <div className="mt-3 aspect-video bg-[var(--bg-inset)] border border-hair flex items-center justify-center">
                <Video className="w-8 h-8 text-[var(--text-muted)]" />
                <span className="label-micro ml-3">Video preview unavailable offline</span>
              </div>
            )}
            <div className="grid grid-cols-4 gap-px bg-[var(--border-default)] mt-3">
              <div className="bg-[var(--bg-surface)] p-2"><div className="label-micro">Author</div><div className="text-xs truncate">{p.author}</div></div>
              <div className="bg-[var(--bg-surface)] p-2"><div className="label-micro">Handle</div><div className="text-xs truncate">{p.handle}</div></div>
              <div className="bg-[var(--bg-surface)] p-2"><div className="label-micro">Platform</div><div className="text-xs capitalize">{p.platform}</div></div>
              <div className="bg-[var(--bg-surface)] p-2"><div className="label-micro">When</div><div className="text-xs">{p.timestamp ? new Date(p.timestamp).toLocaleString() : "—"}</div></div>
            </div>
          </div>

          <div className="panel p-3">
            <div className="label-micro mb-2">Related Signals</div>
            <div className="divide-y divide-[var(--border-default)]">
              {related.map((r) => (
                <button
                  key={r.id}
                  data-testid={`related-${r.id}`}
                  onClick={() => setSelectedPost(r)}
                  className="w-full text-left py-2 px-1 hover:bg-black/[0.03]"
                >
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
