import React, { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import PostCard from "./PostCard";
import { Input } from "@/components/ui/input";
import { Search, Twitter, Instagram, Facebook, Linkedin, Newspaper, MessageCircle } from "lucide-react";

const ICONS = { twitter: Twitter, instagram: Instagram, facebook: Facebook, linkedin: Linkedin, news: Newspaper, reddit: MessageCircle };

function PlatformBadge({ platform, count }) {
  const Icon = ICONS[platform] || Newspaper;
  return (
    <div data-testid={`platform-badge-${platform}`} className="flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-[var(--bg-surface)]">
      <Icon className="w-3.5 h-3.5 text-white/70" />
      <span className="label-micro">{platform}</span>
      <span className="text-xs font-display">{count}</span>
    </div>
  );
}

export default function LiveFeedTab() {
  const { livePosts, platformDist } = useApp();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return livePosts;
    const q = query.toLowerCase();
    return livePosts.filter((p) =>
      (p.content || "").toLowerCase().includes(q) ||
      (p.author || "").toLowerCase().includes(q) ||
      (p.site || "").toLowerCase().includes(q)
    );
  }, [livePosts, query]);

  const neg = filtered.filter((p) => p.sentiment < -0.15);
  const neu = filtered.filter((p) => p.sentiment >= -0.15 && p.sentiment <= 0.15);
  const pos = filtered.filter((p) => p.sentiment > 0.15);

  return (
    <div data-testid="live-feed-tab" className="space-y-3">
      <div className="panel p-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {platformDist.map((p) => (
            <PlatformBadge key={p.platform} platform={p.platform} count={p.count} />
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <Input
            data-testid="feed-search"
            placeholder="Search posts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 pl-8 w-80 rounded-none bg-[var(--bg-surface)] border-white/15 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Column title="Negative" count={neg.length} color="var(--sev-critical)" testid="feed-col-negative">
          {neg.map((p) => <PostCard key={p.id} post={p} />)}
          {!neg.length && <Empty label="No negative signals" />}
        </Column>
        <Column title="Neutral" count={neu.length} color="var(--sev-medium)" testid="feed-col-neutral">
          {neu.map((p) => <PostCard key={p.id} post={p} />)}
          {!neu.length && <Empty label="No neutral signals" />}
        </Column>
        <Column title="Positive" count={pos.length} color="var(--sev-low)" testid="feed-col-positive">
          {pos.map((p) => <PostCard key={p.id} post={p} />)}
          {!pos.length && <Empty label="No positive signals" />}
        </Column>
      </div>
    </div>
  );
}

function Column({ title, count, color, children, testid }) {
  return (
    <div data-testid={testid} className="panel p-0 flex flex-col max-h-[700px]">
      <div className="p-2.5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[var(--bg-surface)] z-10">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4" style={{ background: color }} />
          <span className="label-micro">{title}</span>
        </div>
        <span className="font-display text-sm">{count}</span>
      </div>
      <div className="overflow-y-auto p-2 space-y-2 flex-1">
        {children}
      </div>
    </div>
  );
}

function Empty({ label }) {
  return <div className="text-center py-6 text-xs text-white/40">{label}</div>;
}
