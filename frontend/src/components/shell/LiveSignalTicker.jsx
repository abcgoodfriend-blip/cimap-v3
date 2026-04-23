import React from "react";
import { useApp } from "@/contexts/AppContext";
import { AlertTriangle, Radio } from "lucide-react";

const SEV_COLOR = { critical: "var(--sev-critical)", high: "var(--sev-high)", medium: "var(--sev-medium)", low: "var(--sev-low)" };

export default function LiveSignalTicker() {
  const { tickerSignals, wsStatus } = useApp();
  const items = tickerSignals.length ? tickerSignals : [];
  const doubled = [...items, ...items];

  return (
    <div
      data-testid="live-signal-ticker"
      className="ticker-pause border-b border-white/10 bg-[var(--bg-app)] overflow-hidden"
    >
      <div className="flex items-stretch">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--sev-critical)] text-black font-display tracking-widest text-[10px] uppercase">
          <span className="w-1.5 h-1.5 bg-black rounded-full pulse-dot" />
          Live
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 border-r border-white/10 label-micro">
          <Radio className={`w-3 h-3 ${wsStatus.connected ? "text-[var(--sev-low)]" : "text-[var(--sev-medium)]"}`} />
          <span>{wsStatus.connected ? (wsStatus.mock ? "DEMO STREAM" : "UPLINK") : "RECONNECTING"}</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="ticker-track py-1.5">
            {doubled.map((s, i) => (
              <span
                key={`${s.id || i}-${i}`}
                className="inline-flex items-center gap-2 text-[11px]"
                style={{ color: s._alert ? "var(--sev-critical)" : "rgba(255,255,255,0.75)" }}
              >
                {s._alert && <AlertTriangle className="w-3 h-3" />}
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: SEV_COLOR[s.severity] || "rgba(255,255,255,0.4)" }}
                />
                <span className="uppercase tracking-wide text-white/50">{s.platform || "—"}</span>
                <span className="text-white/40">·</span>
                <span className="uppercase text-white/60">{s.state || s.venture || "GLOBAL"}</span>
                <span className="text-white/40">›</span>
                <span className={s._alert ? "font-semibold" : ""}>
                  {(s.content || "Signal detected").slice(0, 110)}
                </span>
              </span>
            ))}
            {!items.length && (
              <span className="text-white/40 text-[11px]">Awaiting live signals…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
