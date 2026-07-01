"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

export interface MapMarker {
  key: string;
  lat: number;
  lon: number;
  trials: { nctId: string; title: string; status: string }[];
}

interface TrialsMapProps {
  markers: MapMarker[];
  center?: { lat: number; lon: number } | null;
  radiusMiles?: number;
}

const TRIAL_ICON = L.divIcon({
  className: "",
  html: `<div style="
    width:12px;height:12px;
    background:var(--accent,#075A7F);
    border:2px solid #fff;
    border-radius:50%;
    box-shadow:0 1px 4px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -8],
});

const USER_ICON = L.divIcon({
  className: "",
  html: `<div style="
    width:14px;height:14px;
    background:#F97316;
    border:2px solid #fff;
    border-radius:50%;
    box-shadow:0 1px 4px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -9],
});

function FitBounds({ markers, center }: { markers: MapMarker[]; center?: { lat: number; lon: number } | null }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = markers.map((m) => [m.lat, m.lon]);
    if (center) points.push([center.lat, center.lon]);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 9);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [map, markers, center]);
  return null;
}

export default function TrialsMap({ markers, center, radiusMiles }: TrialsMapProps) {
  const defaultCenter: [number, number] = center
    ? [center.lat, center.lon]
    : markers[0]
    ? [markers[0].lat, markers[0].lon]
    : [39.5, -98.35];

  const radiusMeters =
    radiusMiles !== undefined ? radiusMiles * 1609.34 : undefined;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={center ? 8 : 4}
      style={{ height: "420px", width: "100%" }}
      className="rounded-2xl z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <FitBounds markers={markers} center={center} />

      {center && radiusMeters !== undefined && (
        <Circle
          center={[center.lat, center.lon]}
          radius={radiusMeters}
          pathOptions={{ color: "#F97316", fillColor: "#F97316", fillOpacity: 0.07, weight: 1.5 }}
        />
      )}

      {center && (
        <Marker position={[center.lat, center.lon]} icon={USER_ICON}>
          <Popup>
            <span className="text-xs font-medium">Your search location</span>
          </Popup>
        </Marker>
      )}

      {markers.map((m) => (
        <Marker key={m.key} position={[m.lat, m.lon]} icon={TRIAL_ICON}>
          <Popup>
            <div style={{ minWidth: "180px", maxWidth: "240px" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-primary,#111827)" }}>
                {m.trials.length} trial{m.trials.length > 1 ? "s" : ""} at this location
              </p>
              <ul className="space-y-1">
                {m.trials.map((t) => (
                  <li key={t.nctId}>
                    <Link
                      href={`/trial/${t.nctId}`}
                      className="text-xs hover:underline"
                      style={{ color: "var(--accent,#075A7F)" }}
                    >
                      {t.title.length > 60 ? t.title.slice(0, 60) + "…" : t.title}
                    </Link>
                    <span
                      className="ml-1 text-[10px]"
                      style={{ color: "var(--text-tertiary,#9CA3AF)" }}
                    >
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
