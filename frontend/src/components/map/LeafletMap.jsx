import React, { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from "react-leaflet";
import { useApp } from "@/contexts/AppContext";

function sevColor(risk, critical) {
  if (critical > 3 || risk >= 0.75) return "#FF3B30";
  if (risk >= 0.55) return "#FF9500";
  if (risk >= 0.35) return "#FFCC00";
  return "#34C759";
}

export default function LeafletMap() {
  const { locations, setSelectedDetail } = useApp();
  const center = useMemo(() => [22.5, 79.5], []);
  const sites = locations.sites || [];

  return (
    <div data-testid="leaflet-map" className="h-full w-full">
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
      zoomControl
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap · CARTO'
      />
      {sites.map((s) => {
        const radius = Math.max(6, Math.min(22, 4 + (s.signals || 0) / 3));
        const color = sevColor(s.avg_risk || 0, s.critical || 0);
        return (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.35,
              weight: 1.5,
            }}
            eventHandlers={{
              click: () => setSelectedDetail({ type: "site", payload: { name: s.site, state: s.state, venture: s.venture, signals: s.signals, critical: s.critical } }),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent={false}>
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
                <div>Critical: <b style={{ color: "#FF3B30" }}>{s.critical}</b></div>
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
