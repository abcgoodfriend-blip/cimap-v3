import React from "react";
import { useApp } from "@/contexts/AppContext";
import { AlertTriangle, Radio } from "lucide-react";

const SEV_COLOR = { critical: "var(--sev-critical)", high: "var(--sev-high)", medium: "var(--sev-medium)", low: "var(--sev-low)" };

export default function LiveSignalTicker() {
  const { tickerSignals, wsStatus, setSelectedPost } = useApp();
  const items = tickerSignals.length ? tickerSignals : [];
  const doubled = [...items, ...items];

  return (
    <div
      data-testid="live-signal-ticker"
      className="ticker-pause border-b border-hair bg-[var(--bg-surface)] overflow-hidden"
    >
      <div className="flex items-stretch">
        <div
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--sev-critical)] font-display tracking-widest text-[10px] uppercase"
          style={{ color: "#fff" }}
        >
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#fff" }} />
          Live
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 border-r border-hair label-micro">
          <Radio className={`w-3 h-3 ${wsStatus.connected ? "text-[var(--sev-low)]" : "text-[var(--sev-medium)]"}`} />
          <span>{wsStatus.connected ? (wsStatus.mock ? "DEMO STREAM" : "UPLINK") : "RECONNECTING"}</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="ticker-track py-1.5">
            {doubled.map((s, i) => (
              <button
                key={`${s.id || i}-${i}`}
                type="button"
                onClick={() => s?.id && setSelectedPost(s)}
                data-testid={`ticker-item-${i}`}
                className="inline-flex items-center gap-2 text-[11px] hover:bg-black/5 rounded-sm px-1 py-0.5 transition-colors cursor-pointer pointer-events-auto"
                style={{ color: s._alert ? "var(--sev-critical)" : "var(--text-secondary)" }}
              >
                {s._alert && <AlertTriangle className="w-3 h-3" />}
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: SEV_COLOR[s.severity] || "rgba(0,0,0,0.3)" }}
                />
                <span className="uppercase tracking-wide text-[var(--text-muted)]">{s.platform || "—"}</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="uppercase text-[var(--text-secondary)]">{s.state || s.venture || "GLOBAL"}</span>
                <span className="text-[var(--text-muted)]">›</span>
                <span className={s._alert ? "font-semibold" : ""}>
                  {(s.content || "Signal detected").slice(0, 110)}
                </span>
              </button>
            ))}
            {!items.length && (
              <span className="label-micro">Awaiting live signals…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
