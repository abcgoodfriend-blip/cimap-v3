import React from "react";
import { useApp } from "@/contexts/AppContext";
import RiskDialGauge from "./RiskDialGauge";
import HierarchyTree from "./HierarchyTree";

export default function OverviewTab() {
  const { categoryDist } = useApp();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4" data-testid="overview-tab">
      <section className="panel p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="label-micro">Risk Dial · By Category</div>
            <h3 className="font-display text-lg">Category Risk Landscape</h3>
          </div>
          <div className="label-micro">{categoryDist.length} categories</div>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-px bg-white/10">
          {categoryDist.map((c) => (
            <div key={c.category} className="bg-[var(--bg-surface)]">
              <RiskDialGauge item={c} />
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="label-micro">Hierarchical Drilldown</div>
            <h3 className="font-display text-lg">Venture → Site → Category → Sub-point</h3>
          </div>
          <div className="label-micro">Sorted by severity</div>
        </div>
        <HierarchyTree />
      </section>
    </div>
  );
}
