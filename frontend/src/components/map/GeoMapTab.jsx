import React from "react";
import { useApp } from "@/contexts/AppContext";
import LeafletMap from "./LeafletMap";
import StateSummaryTable from "./StateSummaryTable";

export default function GeoMapTab() {
  const { locations } = useApp();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="geo-map-tab">
      <section className="panel p-0 h-[660px] relative overflow-hidden">
        <div className="absolute top-3 left-3 z-[400] panel-dark px-2 py-1 label-micro">
          Geospatial Intelligence · {locations.sites?.length || 0} sites
        </div>
        <LeafletMap />
      </section>
      <section className="panel p-0 h-[660px] overflow-hidden flex flex-col">
        <div className="p-3 border-b border-white/10">
          <div className="label-micro">State Summary</div>
          <h3 className="font-display text-lg">Regional Risk Breakdown</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <StateSummaryTable />
        </div>
      </section>
    </div>
  );
}
