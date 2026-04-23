import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { safeFetch } from "@/lib/api";
import { connectDashboardWS } from "@/lib/websocket";
import { META } from "@/lib/mockData";
import { toast } from "sonner";

const AppCtx = createContext(null);

const EMPTY_FILTERS = {
  venture: "", category: "", subcategory: "", severity: "",
  state: "", platform: "", q: "", start: "", end: "", window: "30d",
};

const ROLE_PRESETS = {
  executive: { severity: "critical", window: "24h" },
  analyst: {},
  pr: { platform: "twitter", window: "7d" },
};

export function AppProvider({ children }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDetail, setSelectedDetail] = useState(null); // { type, payload }
  const [selectedPost, setSelectedPost] = useState(null);

  const [kpis, setKpis] = useState(null);
  const [posts, setPosts] = useState([]);
  const [livePosts, setLivePosts] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [locations, setLocations] = useState({ states: [], sites: [] });
  const [severityDist, setSeverityDist] = useState([]);
  const [platformDist, setPlatformDist] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [ventureDist, setVentureDist] = useState([]);
  const [ventureBreakdown, setVentureBreakdown] = useState([]);
  const [topSites, setTopSites] = useState([]);
  const [sentimentTrend, setSentimentTrend] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tickerSignals, setTickerSignals] = useState([]);
  const [wsStatus, setWsStatus] = useState({ connected: false, mock: false });
  const [source, setSource] = useState("loading");

  const paramsFromFilters = useMemo(() => {
    const p = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) p[k] = v; });
    return p;
  }, [filters]);

  const loadAll = useCallback(async () => {
    const [
      k, p, l, loc, hier, sev, plat, cat, vdist, vent, top, trend,
    ] = await Promise.all([
      safeFetch("/kpis", { params: paramsFromFilters, mockKey: "/kpis" }),
      safeFetch("/posts", { params: { ...paramsFromFilters, limit: 200 }, mockKey: "/posts" }),
      safeFetch("/posts/live", { params: { limit: 60 }, mockKey: "/posts/live" }),
      safeFetch("/locations", { params: paramsFromFilters, mockKey: "/locations" }),
      safeFetch("/hierarchy", { params: paramsFromFilters, mockKey: "/hierarchy" }),
      safeFetch("/reports/severity", { params: paramsFromFilters, mockKey: "severity-distribution" }),
      safeFetch("/platform-distribution", { params: paramsFromFilters, mockKey: "/platform-distribution" }),
      safeFetch("/activity-distribution", { params: paramsFromFilters, mockKey: "category-distribution" }),
      safeFetch("/activity-distribution", { params: paramsFromFilters, mockKey: "venture-distribution" }),
      safeFetch("/reports/area", { params: paramsFromFilters, mockKey: "venture-breakdown" }),
      safeFetch("/reports/area", { params: paramsFromFilters, mockKey: "top-sites" }),
      safeFetch("/sentiment-trend", { params: { bucket: "day", ...paramsFromFilters }, mockKey: "/sentiment-trend" }),
    ]);
    setKpis(k.data);
    setPosts(Array.isArray(p.data) ? p.data : []);
    setLivePosts(Array.isArray(l.data) ? l.data : []);
    setLocations(loc.data || { states: [], sites: [] });
    setHierarchy(Array.isArray(hier.data) ? hier.data : []);
    setSeverityDist(Array.isArray(sev.data) ? sev.data : []);
    setPlatformDist(Array.isArray(plat.data) ? plat.data : []);
    setCategoryDist(Array.isArray(cat.data) ? cat.data : []);
    setVentureDist(Array.isArray(vdist.data) ? vdist.data : []);
    setVentureBreakdown(Array.isArray(vent.data) ? vent.data : []);
    setTopSites(Array.isArray(top.data) ? top.data : []);
    setSentimentTrend(Array.isArray(trend.data) ? trend.data : []);
    setSource(k.source === "live" ? "live" : "mock");
    const sample = (Array.isArray(p.data) ? p.data : []).slice(0, 20);
    setTickerSignals(sample);
  }, [paramsFromFilters]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // WebSocket connection
  useEffect(() => {
    const ws = connectDashboardWS({
      onOpen: (info) => setWsStatus({ connected: true, mock: !!info.mock }),
      onClose: () => setWsStatus((s) => ({ ...s, connected: false })),
      onMessage: (msg) => {
        if (!msg || !msg.event) return;
        if (msg.event === "NEW_POSTS") {
          const arr = Array.isArray(msg.payload) ? msg.payload : [msg.payload];
          setLivePosts((prev) => [...arr, ...prev].slice(0, 80));
          setTickerSignals((prev) => [...arr, ...prev].slice(0, 24));
        } else if (msg.event === "HIGH_RISK_ALERT") {
          const alert = { id: `a_${Date.now()}`, at: new Date().toISOString(), ...msg.payload };
          setAlerts((prev) => [alert, ...prev].slice(0, 50));
          setTickerSignals((prev) => [{ ...msg.payload, _alert: true }, ...prev].slice(0, 24));
          toast.error(`HIGH RISK: ${alert.site || alert.venture || "signal"}`, {
            description: alert.content?.slice(0, 90) || "Critical signal detected",
          });
        } else if (msg.event === "MULTI_HIGH_RISK_ALERT") {
          toast.warning(`Multi-signal spike`, { description: "Correlated high-risk activity across sources" });
        }
      },
    });
    return () => ws.close();
  }, []);

  const applyRolePreset = (role) => {
    setFilters({ ...EMPTY_FILTERS, ...(ROLE_PRESETS[role] || {}) });
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);
  const patchFilters = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const value = {
    filters, setFilters, patchFilters, clearFilters, applyRolePreset,
    activeTab, setActiveTab,
    selectedDetail, setSelectedDetail,
    selectedPost, setSelectedPost,
    kpis, posts, livePosts, hierarchy, locations, severityDist,
    platformDist, categoryDist, ventureDist, ventureBreakdown, topSites, sentimentTrend,
    alerts, tickerSignals, wsStatus, source,
    META,
    refresh: loadAll,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => useContext(AppCtx);
