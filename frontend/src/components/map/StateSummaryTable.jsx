import React from "react";
import { useApp } from "@/contexts/AppContext";
import { ArrowUpRight } from "lucide-react";

export default function StateSummaryTable() {
  const { locations, setSelectedDetail } = useApp();
  const rows = [...(locations.states || [])].sort((a, b) => b.critical - a.critical || b.signals - a.signals);

  return (
    <table data-testid="state-summary-table" className="w-full text-xs">
      <thead>
        <tr className="border-b border-white/10 bg-[var(--bg-surface)] sticky top-0">
          <th className="text-left px-3 py-2 label-micro">State</th>
          <th className="text-right px-2 py-2 label-micro">Signals</th>
          <th className="text-right px-2 py-2 label-micro">Critical</th>
          <th className="text-right px-2 py-2 label-micro">Avg Risk</th>
          <th className="text-right px-2 py-2 label-micro">Sentiment</th>
          <th className="px-2 py-2 w-12"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const hotspot = r.critical >= 3;
          return (
            <tr
              key={r.state}
              data-testid={`state-row-${r.state}`}
              className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${i === 0 ? "bg-white/[0.02]" : ""}`}
              onClick={() => setSelectedDetail({ type: "state", payload: r })}
            >
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4" style={{ background: hotspot ? "var(--sev-critical)" : "var(--sev-medium)" }} />
                  <span>{r.state}</span>
                  {hotspot && <span className="label-micro text-[var(--sev-critical)]">HOTSPOT</span>}
                </div>
              </td>
              <td className="text-right px-2 py-2 font-display">{r.signals}</td>
              <td className="text-right px-2 py-2 font-display sev-critical">{r.critical}</td>
              <td className="text-right px-2 py-2 font-display">{r.avg_risk}</td>
              <td className="text-right px-2 py-2 font-display" style={{ color: r.sentiment < 0 ? "var(--sev-high)" : "var(--sev-low)" }}>
                {r.sentiment}
              </td>
              <td className="px-2 py-2 text-right">
                <ArrowUpRight className="w-3.5 h-3.5 inline text-white/40" />
              </td>
            </tr>
          );
        })}
        {rows.length === 0 && (
          <tr><td colSpan="6" className="text-center py-6 text-white/40">No location data.</td></tr>
        )}
      </tbody>
    </table>
  );
}
