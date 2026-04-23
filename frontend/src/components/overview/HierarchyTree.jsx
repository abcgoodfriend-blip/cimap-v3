import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { ChevronRight, ChevronDown } from "lucide-react";

function SevBadge({ sev = 0, total = 0 }) {
  return (
    <span className="text-[10px] text-white/60 flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-[var(--sev-critical)]" />
      <span className="font-display">{sev}</span>
      <span className="text-white/30">/ {total}</span>
    </span>
  );
}

function Row({ label, signals, critical, indent, onClick, children, openable, testid, sub }) {
  const [open, setOpen] = useState(indent === 0);
  const pct = total(critical, signals);
  return (
    <div data-testid={testid}>
      <div
        className="flex items-center gap-2 py-1.5 pr-2 hover:bg-white/5 cursor-pointer border-b border-white/5"
        style={{ paddingLeft: 8 + indent * 14 }}
        onClick={() => {
          if (openable) setOpen(!open);
          onClick?.();
        }}
      >
        {openable ? (
          open ? <ChevronDown className="w-3 h-3 text-white/50" /> : <ChevronRight className="w-3 h-3 text-white/50" />
        ) : <span className="w-3" />}
        <div className="flex-1 min-w-0">
          <div className="text-xs truncate">{label}</div>
          {sub && <div className="label-micro truncate">{sub}</div>}
        </div>
        <div className="w-16 h-1 bg-white/5 rounded-none relative overflow-hidden">
          <div className="h-full bg-[var(--sev-critical)]" style={{ width: `${pct}%` }} />
        </div>
        <SevBadge sev={critical} total={signals} />
      </div>
      {open && children}
    </div>
  );
}
const total = (c, t) => (t > 0 ? Math.min(100, (c / t) * 100) : 0);

export default function HierarchyTree() {
  const { hierarchy, setSelectedDetail } = useApp();

  return (
    <div data-testid="hierarchy-tree" className="max-h-[560px] overflow-y-auto">
      {(!hierarchy || hierarchy.length === 0) && (
        <div className="text-xs text-white/50 p-3">No hierarchy data.</div>
      )}
      {hierarchy.map((v) => (
        <Row
          key={v.name}
          testid={`hier-venture-${v.name}`}
          label={v.name}
          signals={v.signals}
          critical={v.critical}
          indent={0}
          openable
          onClick={() => setSelectedDetail({ type: "venture", payload: v })}
        >
          {v.sites.map((s) => (
            <Row
              key={`${v.name}-${s.name}`}
              testid={`hier-site-${s.name}`}
              label={s.name}
              sub={s.state}
              signals={s.signals}
              critical={s.critical}
              indent={1}
              openable
              onClick={() => setSelectedDetail({ type: "site", payload: { ...s, venture: v.name } })}
            >
              {s.categories.map((c) => (
                <Row
                  key={`${v.name}-${s.name}-${c.name}`}
                  testid={`hier-cat-${c.name}`}
                  label={c.name}
                  signals={c.signals}
                  critical={c.critical}
                  indent={2}
                  openable
                  onClick={() => setSelectedDetail({ type: "category-site", payload: { ...c, venture: v.name, site: s.name } })}
                >
                  {c.subpoints.map((sp) => (
                    <Row
                      key={`${v.name}-${s.name}-${c.name}-${sp.name}`}
                      testid={`hier-sub-${sp.name}`}
                      label={sp.name}
                      signals={sp.signals}
                      critical={sp.critical}
                      indent={3}
                      onClick={() => setSelectedDetail({ type: "subpoint", payload: { ...sp, venture: v.name, site: s.name, category: c.name } })}
                    />
                  ))}
                </Row>
              ))}
            </Row>
          ))}
        </Row>
      ))}
    </div>
  );
}
