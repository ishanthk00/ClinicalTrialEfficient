"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Map, ChevronDown, ChevronUp } from "lucide-react";
import type { MapMarker } from "./TrialsMap";

const TrialsMap = dynamic(() => import("./TrialsMap"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-2xl flex items-center justify-center"
      style={{
        height: "420px",
        background: "var(--accent-bg)",
        border: "1px solid var(--border)",
        color: "var(--text-tertiary)",
        fontSize: "0.875rem",
      }}
    >
      Loading map…
    </div>
  ),
});

interface MapPanelProps {
  markers: MapMarker[];
  center?: { lat: number; lon: number } | null;
  radiusMiles?: number;
}

export default function MapPanel({ markers, center, radiusMiles }: MapPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium mb-3 transition-colors"
        style={{ color: "var(--text-secondary)" }}
      >
        <Map size={15} />
        {open ? "Hide map" : `Show map${markers.length > 0 ? ` (${markers.length} location${markers.length > 1 ? "s" : ""})` : ""}`}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          <TrialsMap markers={markers} center={center} radiusMiles={radiusMiles} />
        </div>
      )}
    </div>
  );
}
