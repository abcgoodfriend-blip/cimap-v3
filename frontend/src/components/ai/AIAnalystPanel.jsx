import React, { useEffect, useRef, useState } from "react";
import { aiChat } from "@/lib/api";
import { Brain, Send, X, Minus } from "lucide-react";

const STARTERS = [
  "Summarize today's most critical threats for the exec briefing.",
  "Which state is the emerging hotspot and why?",
  "Cluster the active narratives into themes.",
  "Draft a PR response for the top negative signal.",
];

export default function AIAnalystPanel() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: "Hello — I'm the CIMAP Analyst. Ask about risks, narratives, geographies, or draft executive briefs." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `s_${Date.now()}`);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, loading]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message) return;
    setMsgs((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setLoading(true);
    const res = await aiChat(message, sessionId);
    setMsgs((m) => [...m, { role: "assistant", text: res.response, source: res.source }]);
    setLoading(false);
  };

  return (
    <>
      <button
        data-testid="ai-analyst-fab"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-48 z-[60] flex items-center gap-2 px-3 py-2.5 bg-accent-strong hover:bg-accent-strong transition-colors shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
      >
        <Brain className="w-4 h-4" />
        <span className="text-xs font-semibold tracking-widest uppercase">AI Analyst</span>
      </button>

      {open && (
        <div
          data-testid="ai-analyst-panel"
          className="fixed bottom-20 right-5 z-[60] w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] glass flex flex-col"
        >
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--sev-low)] rounded-full pulse-dot" />
              <div>
                <div className="font-display text-sm">CIMAP Analyst</div>
                <div className="label-micro">Gemini 1.5 · fallback Claude 4.5</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button data-testid="ai-panel-minimize" onClick={() => setOpen(false)} className="p-1 hover:bg-white/10">
                <Minus className="w-4 h-4 text-white/70" />
              </button>
              <button data-testid="ai-panel-close" onClick={() => setOpen(false)} className="p-1 hover:bg-white/10">
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {msgs.map((m, i) => (
              <div
                key={i}
                data-testid={`chat-msg-${m.role}`}
                className={`text-xs leading-relaxed ${m.role === "user" ? "text-right" : "text-left"}`}
              >
                {m.role === "user" ? (
                  <div className="inline-block bg-accent-strong px-3 py-2 max-w-[88%] text-left">
                    {m.text}
                  </div>
                ) : (
                  <div className="inline-block bg-[var(--bg-surface)] border border-white/10 px-3 py-2 max-w-[92%]">
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    {m.source && <div className="label-micro mt-1.5 text-white/40">via {m.source}</div>}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="text-xs text-white/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[var(--sev-medium)] rounded-full pulse-dot" />
                Analyzing signals…
              </div>
            )}
            {msgs.length <= 1 && (
              <div className="pt-2">
                <div className="label-micro mb-2">Quick prompts</div>
                <div className="space-y-1">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      data-testid="ai-starter"
                      onClick={() => send(s)}
                      className="w-full text-left text-[11px] border border-white/10 hover:border-white/30 px-2 py-1.5 bg-black/40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="p-2 border-t border-white/10 flex items-center gap-2"
          >
            <input
              data-testid="ai-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the analyst…"
              className="flex-1 bg-[var(--bg-surface)] border border-white/15 px-2.5 py-2 text-xs text-white focus:outline-none focus:border-white/30"
            />
            <button
              type="submit"
              data-testid="ai-chat-send"
              disabled={loading}
              className="px-3 py-2 bg-accent-strong hover:bg-accent-strong disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
