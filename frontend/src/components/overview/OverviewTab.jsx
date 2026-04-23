import React from "react";
import { useApp } from "@/contexts/AppContext";
import RiskDialGauge from "./RiskDialGauge";
import HierarchyTree from "./HierarchyTree";

export default function OverviewTab() {
  const { categoryDist, ventureDist } = useApp();

  return (
    <div className="space-y-4" data-testid="overview-tab">
      <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-4">
        <div className="space-y-4">
          <section className="panel p-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="label-micro">Risk Dial · By Category</div>
                <h3 className="font-display text-lg">Category Risk Landscape</h3>
              </div>
              <div className="label-micro">{categoryDist.length} categories</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-px bg-[var(--border-default)]">
              {categoryDist.map((c) => (
                <div key={c.category} className="bg-[var(--bg-surface)]">
                  <RiskDialGauge item={c} type="category" />
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="label-micro">Risk Dial · By Venture</div>
                <h3 className="font-display text-lg">Venture Risk Landscape</h3>
              </div>
              <div className="label-micro">{ventureDist.length} ventures</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-px bg-[var(--border-default)]">
              {ventureDist.map((v) => (
                <div key={v.category} className="bg-[var(--bg-surface)]">
                  <RiskDialGauge item={v} type="venture" />
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="panel p-3 h-fit">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="label-micro">Hierarchical Drilldown</div>
              <h3 className="font-display text-lg">Venture → Site → Category</h3>
            </div>
            <div className="label-micro">Sorted by severity</div>
          </div>
          <HierarchyTree />
        </section>
      </div>
    </div>
  );
}
