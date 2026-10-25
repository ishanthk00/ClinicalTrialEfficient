"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { geocodePostalCode, isValidPostalCode, type GeocodeResult } from "@/lib/geocode";

export interface MapMarker {
  key: string;
  lat: number;
  lon: number;
  /** Great-circle distance (km) from the search origin, when one is set. */
  distanceKm?: number;
  trials: { nctId: string; title: string; status: string }[];
}

function milesLabel(km: number): string {
  const mi = km / 1.60934;
  return mi < 10 ? `${mi.toFixed(1)} mi` : `${Math.round(mi)} mi`;
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
    background:var(--accent);
    border:2px solid #fff;
    border-radius:50%;
    box-shadow:0 1px 4px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
  popupAnchor: [0, -8],
});

/* Leaflet draws Circle strokes as SVG presentation attributes, which do not
   resolve CSS custom properties — this one has to be a literal. Kept in sync
   with --purple in app/globals.css (the v4 companion colour for supportive
   marks; the previous orange was off-palette). */
const ORIGIN_COLOR = "#6C5CA6";

const USER_ICON = L.divIcon({
  className: "",
  html: `<div style="
    width:14px;height:14px;
    background:${ORIGIN_COLOR};
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

function ZipcodeSearchControl({
  onLocationResolved,
}: {
  onLocationResolved: (location: GeocodeResult) => void;
}) {
  const map = useMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [zipcode, setZipcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current);
      L.DomEvent.disableScrollPropagation(containerRef.current);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const query = zipcode.trim();
    if (!isValidPostalCode(query)) {
      setError("Please enter a valid zip or postal code.");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const locationData = await geocodePostalCode(query, "us", controller.signal);

      if (locationData.boundingBox) {
        map.flyToBounds(locationData.boundingBox, {
          padding: [40, 40],
          maxZoom: 13,
          duration: 1.2,
        });
      } else {
        map.flyTo([locationData.lat, locationData.lon], 13, { duration: 1.2 });
      }

      onLocationResolved(locationData);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error
          ? err.message
          : "Unable to fetch location. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={containerRef} className="map-search-container">
      <form onSubmit={handleSubmit} className="map-search-form" noValidate>
        <input
          type="text"
          value={zipcode}
          onChange={(e) => {
            setZipcode(e.target.value);
            if (error) setError(null);
          }}
          className="map-search-input"
          placeholder="Enter Zip / Postal Code (e.g., 10001)"
          aria-label="Zip or Postal Code"
          autoComplete="postal-code"
        />
        <button type="submit" className="map-search-btn" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>
      {error && (
        <div className="map-search-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

function SearchedMarker({ location }: { location: GeocodeResult }) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [location]);

  return (
    <Marker
      ref={markerRef}
      position={[location.lat, location.lon]}
      icon={USER_ICON}
    >
      <Popup>
        <div style={{ minWidth: "160px", maxWidth: "240px" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--text)" }}>
            Resolved Location
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)", margin: 0 }}>
            {location.displayName}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function TrialsMap({ markers, center, radiusMiles }: TrialsMapProps) {
  const [searchedLocation, setSearchedLocation] = useState<GeocodeResult | null>(null);

  const defaultCenter: [number, number] = center
    ? [center.lat, center.lon]
    : markers[0]
    ? [markers[0].lat, markers[0].lon]
    : [39.5, -98.35];

  const radiusMeters =
    radiusMiles !== undefined ? radiusMiles * 1609.34 : undefined;

  return (
    <div className="map-wrapper">
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
        <ZipcodeSearchControl onLocationResolved={setSearchedLocation} />

        {center && radiusMeters !== undefined && (
          <Circle
            center={[center.lat, center.lon]}
            radius={radiusMeters}
            pathOptions={{ color: ORIGIN_COLOR, fillColor: ORIGIN_COLOR, fillOpacity: 0.07, weight: 1.5 }}
          />
        )}

        {center && (
          <Marker position={[center.lat, center.lon]} icon={USER_ICON}>
            <Popup>
              <span className="text-xs font-medium">Your search location</span>
            </Popup>
          </Marker>
        )}

        {searchedLocation && <SearchedMarker location={searchedLocation} />}

        {markers.map((m) => (
          <Marker key={m.key} position={[m.lat, m.lon]} icon={TRIAL_ICON}>
            <Popup>
              <div style={{ minWidth: "180px", maxWidth: "240px" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--text)" }}>
                  {m.trials.length} trial{m.trials.length > 1 ? "s" : ""} at this location
                </p>
                {m.distanceKm !== undefined && (
                  <p className="text-[11px] mb-1.5" style={{ color: "var(--text-tertiary)" }}>
                    ≈ {milesLabel(m.distanceKm)} from your search location
                  </p>
                )}
                <ul className="space-y-1">
                  {m.trials.map((t) => (
                    <li key={t.nctId}>
                      <Link
                        href={`/trial/${t.nctId}`}
                        className="text-xs hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        {t.title.length > 60 ? t.title.slice(0, 60) + "…" : t.title}
                      </Link>
                      <span
                        className="ml-1 text-[10px]"
                        style={{ color: "var(--text-tertiary)" }}
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
    </div>
  );
}
