import React from "react";
import { useApp } from "@/contexts/AppContext";
import { META } from "@/lib/mockData";
import { X } from "lucide-react";

function FilterSelect({ label, value, onChange, options, testid }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-r border-white/10">
      <span className="label-micro">{label}</span>
      <select
        data-testid={testid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs text-white/90 focus:outline-none cursor-pointer min-w-[80px]"
      >
        <option value="" className="bg-[var(--bg-surface)]">All</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-[var(--bg-surface)]">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function FiltersRow() {
  const { filters, patchFilters, clearFilters } = useApp();

  const hasActive = Object.entries(filters).some(([k, v]) => v && !["window"].includes(k));

  return (
    <div className="flex items-center overflow-x-auto border-b border-white/10 bg-[var(--bg-app)]" data-testid="filters-row">
      <FilterSelect
        testid="filter-venture"
        label="Venture"
        value={filters.venture}
        onChange={(v) => patchFilters({ venture: v })}
        options={META.VENTURES}
      />
      <FilterSelect
        testid="filter-category"
        label="Category"
        value={filters.category}
        onChange={(v) => patchFilters({ category: v, subcategory: "" })}
        options={META.CATEGORIES}
      />
      <FilterSelect
        testid="filter-subcategory"
        label="Subcategory"
        value={filters.subcategory}
        onChange={(v) => patchFilters({ subcategory: v })}
        options={filters.category ? (META.SUBCATEGORIES[filters.category] || []) : []}
      />
      <FilterSelect
        testid="filter-severity"
        label="Severity"
        value={filters.severity}
        onChange={(v) => patchFilters({ severity: v })}
        options={META.SEVERITIES}
      />
      <FilterSelect
        testid="filter-state"
        label="State"
        value={filters.state}
        onChange={(v) => patchFilters({ state: v })}
        options={META.STATES}
      />
      <FilterSelect
        testid="filter-platform"
        label="Platform"
        value={filters.platform}
        onChange={(v) => patchFilters({ platform: v })}
        options={META.PLATFORMS}
      />
      <div className="flex items-center gap-2 px-3 py-1.5 border-r border-white/10">
        <span className="label-micro">Range</span>
        <select
          data-testid="filter-window"
          value={filters.window}
          onChange={(e) => patchFilters({ window: e.target.value })}
          className="bg-transparent text-xs text-white/90 focus:outline-none cursor-pointer"
        >
          {["24h", "48h", "7d", "30d"].map((w) => (
            <option key={w} value={w} className="bg-[var(--bg-surface)]">
              {w}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5">
        <input
          data-testid="filter-start-date"
          type="date"
          value={filters.start}
          onChange={(e) => patchFilters({ start: e.target.value })}
          className="bg-transparent text-xs text-white/80 focus:outline-none border border-white/10 px-1.5 py-0.5"
        />
        <span className="text-white/30 text-xs">→</span>
        <input
          data-testid="filter-end-date"
          type="date"
          value={filters.end}
          onChange={(e) => patchFilters({ end: e.target.value })}
          className="bg-transparent text-xs text-white/80 focus:outline-none border border-white/10 px-1.5 py-0.5"
        />
      </div>
      <div className="ml-auto pr-3">
        {hasActive && (
          <button
            data-testid="clear-filters-btn"
            onClick={clearFilters}
            className="flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-white/60 hover:text-[var(--sev-critical)] transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
