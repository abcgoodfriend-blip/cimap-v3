import React from "react";
import LiveSignalTicker from "./LiveSignalTicker";
import UnifiedInsightRow from "./UnifiedInsightRow";
import NavigationRow from "./NavigationRow";
import FiltersRow from "./FiltersRow";

export default function DashboardShell({ children }) {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-white flex flex-col">
      <header className="sticky top-0 z-40 bg-[var(--bg-app)]/95 backdrop-blur border-b border-white/10">
        <LiveSignalTicker />
        <UnifiedInsightRow />
        <NavigationRow />
        <FiltersRow />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
