import React, { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { useApp } from "@/contexts/AppContext";

function sevColor(risk, critical) {
  if (critical > 3 || risk >= 0.75) return "#DC2626";
  if (risk >= 0.55) return "#EA8200";
  if (risk >= 0.35) return "#D1A400";
  return "#16A34A";
}

function HeatLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const layer = L.heatLayer(points, {
      radius: 32, blur: 24, maxZoom: 11, minOpacity: 0.35,
      gradient: { 0.2: "#16A34A", 0.4: "#D1A400", 0.6: "#EA8200", 0.85: "#DC2626" },
    }).addTo(map);
    return () => { map.removeLayer(layer); };
  }, [map, points]);
  return null;
}

export default function LeafletMap({ mode = "pins" }) {
  const { locations, setSelectedDetail } = useApp();
  const center = useMemo(() => [22.5, 79.5], []);
  const sites = locations.sites || [];

  const heatPoints = useMemo(() => sites.map((s) => {
    const intensity = Math.min(1, (s.avg_risk || 0) * 0.6 + (s.critical || 0) * 0.08);
    return [s.lat, s.lng, intensity];
  }), [sites]);

  return (
    <div data-testid="leaflet-map" className="h-full w-full relative">
      <MapContainer center={center} zoom={5} style={{ height: "100%", width: "100%" }} scrollWheelZoom zoomControl>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap · CARTO'
        />
        {mode === "heatmap" && <HeatLayer points={heatPoints} />}
        {(mode === "pins" || mode === "both") && sites.map((s) => {
          const radius = Math.max(6, Math.min(22, 4 + (s.signals || 0) / 3));
          const color = sevColor(s.avg_risk || 0, s.critical || 0);
          return (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              radius={radius}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.4, weight: 1.5 }}
              eventHandlers={{
                click: () => setSelectedDetail({ type: "site", payload: { name: s.site, state: s.state, venture: s.venture, signals: s.signals, critical: s.critical } }),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <div className="text-[11px]">
                  <div className="font-semibold">{s.site}</div>
                  <div>{s.state} · {s.venture}</div>
                  <div>Signals: {s.signals} · Critical: {s.critical}</div>
                  <div>Avg Risk: {s.avg_risk}</div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold">{s.site}</div>
                  <div>{s.state} · {s.venture}</div>
                  <div className="mt-1">Signals: <b>{s.signals}</b></div>
                  <div>Critical: <b style={{ color: "#DC2626" }}>{s.critical}</b></div>
                  <div>Avg Risk: <b>{s.avg_risk}</b></div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
