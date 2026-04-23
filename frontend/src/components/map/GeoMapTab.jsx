import React, { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import LeafletMap from "./LeafletMap";
import StateSummaryTable from "./StateSummaryTable";
import { Flame, Layers, MapPin, TrendingUp, TrendingDown } from "lucide-react";
import { getAllPosts } from "@/lib/mockData";

function EmergingStrip() {
  const { posts, setSelectedDetail } = useApp();
  const all = useMemo(() => getAllPosts(), []);

  const data = useMemo(() => {
    const now = Date.now(), DAY = 86400 * 1000;
    const recentWin = 3 * DAY, priorWin = 7 * DAY;
    const m = {};
    (all || posts).forEach((p) => {
      const t = new Date(p.timestamp).getTime();
      const age = now - t;
      if (!m[p.state]) m[p.state] = { state: p.state, recent: 0, prior: 0, critical: 0 };
      if (age <= recentWin) m[p.state].recent++;
      else if (age <= priorWin + recentWin) m[p.state].prior++;
      if (p.severity === "critical") m[p.state].critical++;
    });
    return Object.values(m)
      .map((x) => {
        const priorNorm = x.prior / 2.33;
        const delta = priorNorm > 0 ? ((x.recent - priorNorm) / priorNorm) * 100 : (x.recent > 0 ? 100 : 0);
        return { ...x, delta: Math.round(delta) };
      })
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 6);
  }, [all, posts]);

  return (
    <div data-testid="map-hotspot-strip" className="panel">
      <div className="flex items-center justify-between px-3 py-2 border-b border-hair">
        <div className="label-micro flex items-center gap-1.5"><Flame className="w-3 h-3 sev-critical" /> Emerging Hotspots · Last 3 days</div>
        <div className="label-micro">Click to drill down</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-[var(--border-default)]">
        {data.map((s) => {
          const rising = s.delta >= 0;
          return (
            <button
              key={s.state}
              data-testid={`map-hotspot-${s.state}`}
              onClick={() => setSelectedDetail({ type: "state", payload: s })}
              className="bg-[var(--bg-surface)] p-2.5 text-left hover:bg-black/[0.03]"
            >
              <div className="text-[11px] font-display truncate">{s.state}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-display text-base" style={{ color: rising ? "var(--sev-critical)" : "var(--sev-low)" }}>
                  {rising ? "+" : ""}{s.delta}%
                </span>
                {rising ? <TrendingUp className="w-3 h-3 sev-critical" /> : <TrendingDown className="w-3 h-3 sev-low" />}
              </div>
              <div className="label-micro mt-0.5">3d: {s.recent} · crit: {s.critical}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MapLegend() {
  return (
    <div className="absolute bottom-3 left-3 z-[400] panel-dark px-2.5 py-1.5 text-[10px]">
      <div className="flex items-center gap-2 mb-1"><MapPin className="w-3 h-3" /><span className="label-micro">Severity</span></div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#DC2626" }} /> Critical</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#EA8200" }} /> High</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#D1A400" }} /> Medium</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#16A34A" }} /> Low</span>
      </div>
    </div>
  );
}

export default function GeoMapTab() {
  const { locations } = useApp();
  const [mode, setMode] = useState("pins");

  return (
    <div className="space-y-3" data-testid="geo-map-tab">
      <EmergingStrip />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="panel p-0 h-[660px] relative overflow-hidden">
          <div className="absolute top-3 left-3 z-[400] panel-dark px-2 py-1 label-micro">
            Geospatial Intelligence · {locations.sites?.length || 0} sites · {locations.states?.length || 0} states
          </div>
          <div className="absolute top-3 right-3 z-[400] flex items-center gap-px bg-[var(--border-default)]">
            {[
              { k: "pins", label: "Pins" },
              { k: "heatmap", label: "Heatmap" },
              { k: "both", label: "Both" },
            ].map((x) => (
              <button
                key={x.k}
                data-testid={`map-mode-${x.k}`}
                onClick={() => setMode(x.k)}
                className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] ${mode === x.k ? "bg-accent-strong" : "bg-[var(--bg-surface)] hover:bg-[var(--bg-inset)]"}`}
              >
                <Layers className="w-3 h-3 inline mr-1" />{x.label}
              </button>
            ))}
          </div>
          <LeafletMap mode={mode} />
          <MapLegend />
        </section>

        <section className="panel p-0 h-[660px] overflow-hidden flex flex-col">
          <div className="p-3 border-b border-hair">
            <div className="label-micro">State Summary</div>
            <h3 className="font-display text-lg">Regional Risk Breakdown</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <StateSummaryTable />
          </div>
        </section>
      </div>
    </div>
  );
}
