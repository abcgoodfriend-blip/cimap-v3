import React from "react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert, Search, Download, Bell, LogOut, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { exportPosts } from "@/lib/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

const TABS = [
  { k: "overview", label: "Overview" },
  { k: "map", label: "Geospatial Map" },
  { k: "analysis", label: "Analysis" },
  { k: "feed", label: "Live Feed" },
];

export default function NavigationRow() {
  const { activeTab, setActiveTab, filters, patchFilters, alerts, source } = useApp();
  const { user, role, switchRole, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5" data-testid="navigation-row">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-3 border-r border-white/10">
          <div className="w-6 h-6 bg-[var(--sev-critical)] flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-black" />
          </div>
          <div className="font-display text-xs tracking-[0.25em] uppercase">CIMAP</div>
          <span
            data-testid="data-source-indicator"
            className={`label-micro px-1.5 py-0.5 border ${source === "live" ? "border-[var(--sev-low)] text-[var(--sev-low)]" : "border-white/20 text-white/50"}`}
          >
            {source === "live" ? "LIVE" : "DEMO"}
          </span>
        </div>
        <nav className="flex" data-testid="nav-tabs">
          {TABS.map((t) => (
            <button
              key={t.k}
              data-testid={`nav-tab-${t.k}`}
              onClick={() => setActiveTab(t.k)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border-r border-white/10 first:border-l transition-colors ${
                activeTab === t.k
                  ? "bg-white text-black"
                  : "bg-transparent text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <Input
            data-testid="search-input"
            placeholder="Search signals, sites, handles…"
            value={filters.q}
            onChange={(e) => patchFilters({ q: e.target.value })}
            className="h-8 pl-8 w-64 rounded-none bg-[var(--bg-surface)] border-white/15 text-xs"
          />
        </div>
        <button
          data-testid="export-btn"
          onClick={() => exportPosts(filters)}
          className="flex items-center gap-1.5 px-2.5 h-8 text-xs border border-white/15 hover:border-white/30 hover:bg-white/5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button data-testid="notifications-btn" className="relative flex items-center gap-1.5 px-2.5 h-8 text-xs border border-white/15 hover:border-white/30 hover:bg-white/5">
              <Bell className="w-3.5 h-3.5" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-semibold bg-[var(--sev-critical)] text-black flex items-center justify-center">
                  {alerts.length > 9 ? "9+" : alerts.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 p-0 rounded-none bg-[var(--bg-surface)] border-white/15 text-white"
          >
            <div className="p-3 border-b border-white/10">
              <div className="label-micro">High-Risk Alerts</div>
              <div className="font-display text-sm mt-0.5">{alerts.length} active</div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {alerts.length === 0 && (
                <div className="p-4 text-xs text-white/50">No alerts currently.</div>
              )}
              {alerts.map((a) => (
                <div key={a.id} className="p-3 border-b border-white/5 hover:bg-white/5">
                  <div className="flex items-center gap-2 text-[10px] uppercase text-[var(--sev-critical)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--sev-critical)] pulse-dot" />
                    {a.venture || "Signal"} · {a.state || "—"}
                  </div>
                  <div className="text-xs mt-1 text-white/80 line-clamp-2">{a.content}</div>
                  <div className="label-micro mt-1">{new Date(a.at).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-testid="role-switcher-btn"
              className="flex items-center gap-1.5 px-2.5 h-8 text-xs border border-white/15 hover:border-white/30 hover:bg-white/5"
            >
              <span className="uppercase tracking-[0.15em]">{role}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none bg-[var(--bg-surface)] border-white/15 text-white">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.15em] text-white/50">Switch Role</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            {["executive", "analyst", "pr"].map((r) => (
              <DropdownMenuItem
                key={r}
                data-testid={`role-option-${r}`}
                onClick={() => switchRole(r)}
                className={`text-xs rounded-none ${role === r ? "bg-white/10" : ""}`}
              >
                {r === "pr" ? "PR Team" : r}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button data-testid="user-menu-btn" className="flex items-center gap-2 px-2 h-8 border border-white/15 hover:border-white/30">
              <div className="w-5 h-5 bg-white/10 flex items-center justify-center text-[10px] font-semibold">
                {(user?.name || "U").slice(0, 1)}
              </div>
              <span className="text-xs">{user?.name || "User"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none bg-[var(--bg-surface)] border-white/15 text-white">
            <DropdownMenuLabel className="text-xs">
              <div className="font-display">{user?.name}</div>
              <div className="text-white/50 text-[10px]">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              data-testid="logout-btn"
              onClick={() => { logout(); nav("/login"); }}
              className="text-xs rounded-none"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
