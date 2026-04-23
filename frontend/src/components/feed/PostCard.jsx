import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Video } from "lucide-react";

const SEV_COLOR = { critical: "var(--sev-critical)", high: "var(--sev-high)", medium: "var(--sev-medium)", low: "var(--sev-low)" };

export default function PostCard({ post }) {
  const { setSelectedPost } = useApp();
  const [hover, setHover] = useState(false);

  return (
    <div className="relative">
      <button
        data-testid={`post-card-${post.id}`}
        onClick={() => setSelectedPost(post)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="w-full text-left panel-dark p-2.5 border-hair hover:border-white/30 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5" style={{ background: SEV_COLOR[post.severity] }} />
          <span className="label-micro">{post.platform}</span>
          <span className="label-micro text-white/30">·</span>
          <span className="label-micro truncate flex-1">{post.state}</span>
          {post.has_video && <Video className="w-3 h-3 text-white/50" />}
        </div>
        <div className="text-xs mt-1.5 line-clamp-2 leading-snug">{post.content}</div>
        <div className="flex items-center justify-between mt-2">
          <div className="label-micro truncate">{post.author}</div>
          <div className="flex items-center gap-2 text-[10px] text-white/60">
            <span className="font-display" style={{ color: post.sentiment < 0 ? "var(--sev-high)" : "var(--sev-low)" }}>
              {post.sentiment}
            </span>
            <span className="font-display sev-critical">{post.risk_score}</span>
          </div>
        </div>
      </button>
      {hover && (
        <div className="hidden lg:block absolute z-50 top-0 left-full ml-2 w-80 panel-dark p-3 border border-white/20 shadow-2xl pointer-events-none">
          <div className="label-micro mb-1">{post.venture} · {post.site}</div>
          <div className="text-xs leading-relaxed">{post.content}</div>
          {post.has_video && (
            <div className="mt-2 aspect-video bg-black border border-white/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-white/30" />
              <span className="ml-2 label-micro">video preview</span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-px bg-white/10 mt-2">
            <div className="bg-[var(--bg-panel)] p-1.5"><div className="label-micro">Risk</div><div className="font-display text-sm sev-critical">{post.risk_score}</div></div>
            <div className="bg-[var(--bg-panel)] p-1.5"><div className="label-micro">Sent</div><div className="font-display text-sm">{post.sentiment}</div></div>
            <div className="bg-[var(--bg-panel)] p-1.5"><div className="label-micro">Sev</div><div className="font-display text-sm uppercase" style={{ color: SEV_COLOR[post.severity] }}>{post.severity}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
