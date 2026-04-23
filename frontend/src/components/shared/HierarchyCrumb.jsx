import React from "react";
import { ChevronRight } from "lucide-react";

const SEV_COLOR = { critical: "var(--sev-critical)", high: "var(--sev-high)", medium: "var(--sev-medium)", low: "var(--sev-low)" };

/**
 * Full hierarchy breadcrumb:
 *   Venture → Site → Category → Sub-cat → Severity → State → Platform
 * Any falsy node is rendered as a dash placeholder for consistency.
 */
export default function HierarchyCrumb({ venture, site, category, subcategory, severity, state, platform, testid = "hierarchy-crumb" }) {
  const nodes = [
    { label: "VEN", value: venture },
    { label: "SITE", value: site },
    { label: "CAT", value: category },
    { label: "SUB", value: subcategory },
    { label: "SEV", value: severity, isSeverity: true },
    { label: "STATE", value: state },
    { label: "PLAT", value: platform },
  ];
  return (
    <div
      data-testid={testid}
      className="flex items-center gap-1 flex-wrap mt-2 px-2 py-1.5 border border-hair bg-[var(--bg-panel)]"
    >
      {nodes.map((n, i) => (
        <React.Fragment key={n.label}>
          <div className="flex items-center gap-1">
            <span className="label-micro">{n.label}</span>
            {n.isSeverity && n.value ? (
              <span
                className="text-[10px] uppercase font-semibold px-1"
                style={{ color: SEV_COLOR[n.value] }}
              >
                {n.value}
              </span>
            ) : (
              <span className="text-[11px] text-[var(--text-primary)]">{n.value || "—"}</span>
            )}
          </div>
          {i < nodes.length - 1 && <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />}
        </React.Fragment>
      ))}
    </div>
  );
}
