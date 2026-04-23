import React from "react";
import { useApp } from "@/contexts/AppContext";
import { META } from "@/lib/mockData";
import { X } from "lucide-react";

function FilterField({ label, value, onChange, options, testid }) {
  return (
    <div className="flex flex-col min-w-[110px]">
      <span className="label-micro leading-none mb-0.5">{label}</span>
      <select
        data-testid={testid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-0 border-b border-[var(--border-default)] hover:border-[var(--border-strong)] focus:border-[var(--text-primary)] text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer py-0.5 pr-4 appearance-none"
        style={{ backgroundImage: "linear-gradient(45deg, transparent 50%, rgba(0,0,0,0.4) 50%), linear-gradient(135deg, rgba(0,0,0,0.4) 50%, transparent 50%)", backgroundPosition: "calc(100% - 7px) 55%, calc(100% - 3px) 55%", backgroundSize: "4px 4px", backgroundRepeat: "no-repeat" }}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function DateField({ label, value, onChange, testid }) {
  return (
    <div className="flex flex-col min-w-[110px]">
      <span className="label-micro leading-none mb-0.5">{label}</span>
      <input
        data-testid={testid}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-0 border-b border-[var(--border-default)] hover:border-[var(--border-strong)] focus:border-[var(--text-primary)] text-xs text-[var(--text-primary)] focus:outline-none py-0.5"
      />
    </div>
  );
}

export default function FiltersRow() {
  const { filters, patchFilters, clearFilters } = useApp();
  const hasActive = Object.entries(filters).some(([k, v]) => v && !["window"].includes(k));

  return (
    <div className="flex items-end gap-5 px-3 py-2 overflow-x-auto border-b border-hair bg-[var(--bg-surface)]" data-testid="filters-row">
      <FilterField testid="filter-venture" label="Venture" value={filters.venture} onChange={(v) => patchFilters({ venture: v })} options={META.VENTURES} />
      <FilterField testid="filter-category" label="Category" value={filters.category} onChange={(v) => patchFilters({ category: v, subcategory: "" })} options={META.CATEGORIES} />
      <FilterField testid="filter-subcategory" label="Sub-cat" value={filters.subcategory} onChange={(v) => patchFilters({ subcategory: v })} options={filters.category ? (META.SUBCATEGORIES[filters.category] || []) : []} />
      <FilterField testid="filter-severity" label="Severity" value={filters.severity} onChange={(v) => patchFilters({ severity: v })} options={META.SEVERITIES} />
      <FilterField testid="filter-state" label="State" value={filters.state} onChange={(v) => patchFilters({ state: v })} options={META.STATES} />
      <FilterField testid="filter-platform" label="Platform" value={filters.platform} onChange={(v) => patchFilters({ platform: v })} options={META.PLATFORMS} />

      <div className="flex flex-col min-w-[80px]">
        <span className="label-micro leading-none mb-0.5">Range</span>
        <select
          data-testid="filter-window"
          value={filters.window}
          onChange={(e) => patchFilters({ window: e.target.value })}
          className="bg-transparent border-0 border-b border-[var(--border-default)] text-xs focus:outline-none py-0.5 appearance-none cursor-pointer"
        >
          {["24h", "48h", "7d", "30d"].map((w) => (<option key={w} value={w}>{w}</option>))}
        </select>
      </div>

      <DateField testid="filter-start-date" label="From" value={filters.start} onChange={(v) => patchFilters({ start: v })} />
      <DateField testid="filter-end-date" label="To" value={filters.end} onChange={(v) => patchFilters({ end: v })} />

      <div className="ml-auto self-center">
        {hasActive && (
          <button
            data-testid="clear-filters-btn"
            onClick={clearFilters}
            className="flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] hover:text-[var(--sev-critical)] transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
