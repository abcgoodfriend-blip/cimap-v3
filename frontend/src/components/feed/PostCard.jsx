import React, { useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Video, Image as ImageIcon } from "lucide-react";
import { createPortal } from "react-dom";

const SEV_COLOR = { critical: "var(--sev-critical)", high: "var(--sev-high)", medium: "var(--sev-medium)", low: "var(--sev-low)" };

function HoverPreview({ post, pos }) {
  if (!pos) return null;
  const W = 320, H = 360, margin = 16;
  const vw = window.innerWidth, vh = window.innerHeight;
  let left = pos.x + margin;
  let top = pos.y + margin;
  if (left + W > vw) left = pos.x - W - margin;
  if (top + H > vh) top = vh - H - margin;
  if (top < 10) top = 10;
  return createPortal(
    <div
      className="fixed z-[120] w-[320px] panel pointer-events-none shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
      style={{ left, top }}
    >
      {post.has_video && post.video_url ? (
        <video src={post.video_url} autoPlay muted loop playsInline className="w-full aspect-video object-cover" />
      ) : post.image_url ? (
        <div className="w-full aspect-video overflow-hidden bg-[var(--bg-inset)]">
          <img src={post.image_url} alt="" className="w-full h-full object-cover" style={{ animation: "kenburns 8s ease-in-out infinite alternate" }} />
        </div>
      ) : null}
      <div className="p-3">
        <div className="flex items-center gap-2 label-micro">
          <span className="w-1.5 h-1.5" style={{ background: SEV_COLOR[post.severity] }} />
          {post.platform} · {post.state}
          <span className="ml-auto" style={{ color: SEV_COLOR[post.severity] }}>{post.severity?.toUpperCase()}</span>
        </div>
        <div className="text-xs mt-1.5 leading-snug">{post.content}</div>
        <div className="label-micro mt-2 truncate">{post.venture} · {post.site}</div>
        <div className="grid grid-cols-3 gap-px mt-2 bg-[var(--border-default)]">
          <div className="bg-[var(--bg-surface)] p-1.5 text-center"><div className="label-micro">RISK</div><div className="font-display text-sm sev-critical">{post.risk_score}</div></div>
          <div className="bg-[var(--bg-surface)] p-1.5 text-center"><div className="label-micro">SENT</div><div className="font-display text-sm">{post.sentiment}</div></div>
          <div className="bg-[var(--bg-surface)] p-1.5 text-center"><div className="label-micro">REACH</div><div className="font-display text-sm">{Math.round((post.reach || 0) / 1000)}K</div></div>
        </div>
      </div>
      <style>{`@keyframes kenburns{0%{transform:scale(1)}100%{transform:scale(1.12) translate(-2%,-1%)}}`}</style>
    </div>,
    document.body
  );
}

export default function PostCard({ post }) {
  const { setSelectedPost } = useApp();
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState(null);
  const timer = useRef(null);

  const onMove = (e) => {
    setPos({ x: e.clientX, y: e.clientY });
  };
  const onEnter = (e) => {
    setPos({ x: e.clientX, y: e.clientY });
    timer.current = setTimeout(() => setHover(true), 120);
  };
  const onLeave = () => {
    clearTimeout(timer.current);
    setHover(false);
  };

  return (
    <>
      <button
        data-testid={`post-card-${post.id}`}
        onClick={() => setSelectedPost(post)}
        onMouseEnter={onEnter}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="w-full text-left panel-dark p-2.5 border-hair hover:border-[var(--border-strong)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5" style={{ background: SEV_COLOR[post.severity] }} />
          <span className="label-micro">{post.platform}</span>
          <span className="label-micro text-[var(--text-muted)]">·</span>
          <span className="label-micro truncate flex-1">{post.state}</span>
          {post.has_video && <Video className="w-3 h-3 text-[var(--text-muted)]" />}
          {post.has_image && !post.has_video && <ImageIcon className="w-3 h-3 text-[var(--text-muted)]" />}
        </div>
        <div className="text-xs mt-1.5 line-clamp-2 leading-snug">{post.content}</div>
        <div className="flex items-center justify-between mt-2">
          <div className="label-micro truncate">{post.author}</div>
          <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
            <span className="font-display" style={{ color: post.sentiment < 0 ? "var(--sev-high)" : "var(--sev-low)" }}>{post.sentiment}</span>
            <span className="font-display sev-critical">{post.risk_score}</span>
          </div>
        </div>
      </button>
      {hover && <HoverPreview post={post} pos={pos} />}
    </>
  );
}
