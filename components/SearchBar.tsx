"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";
import Button3D from "@/components/Button3D";

const DISTANCE_OPTIONS = [
  { value: "25",  label: "25 mi" },
  { value: "50",  label: "50 mi" },
  { value: "100", label: "100 mi" },
  { value: "250", label: "250 mi" },
  { value: "any", label: "Any distance" },
];

interface SearchBarProps {
  initialCondition?: string;
  initialLocation?: string;
  initialDistance?: string;
  compact?: boolean;
}

export default function SearchBar({
  initialCondition = "",
  initialLocation = "",
  initialDistance = "any",
  compact = false,
}: SearchBarProps) {
  const router = useRouter();
  const [condition, setCondition] = useState(initialCondition);
  const [location, setLocation]   = useState(initialLocation);
  const [distance, setDistance]   = useState(initialDistance);
  const locationRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!condition.trim()) return;
    const params = new URLSearchParams();
    if (condition.trim()) params.set("condition", condition.trim());
    if (location.trim()) params.set("location", location.trim());
    if (location.trim() && distance !== "any") params.set("distance", distance);
    router.push(`/results?${params.toString()}`);
  }

  /* ── Compact variant (results page top bar) ── */
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
        <div className="search-card flex flex-1 items-center rounded-xl overflow-hidden">
          <span className="pl-3" style={{ color: "var(--text-tertiary)" }}>
            <Search size={15} />
          </span>
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="Condition"
            className="input-field flex-1 px-2 py-2 text-sm min-w-0"
          />
          <div className="h-5 w-px mx-1" style={{ background: "var(--border)" }} />
          <span className="pl-2" style={{ color: "var(--text-tertiary)" }}>
            <MapPin size={15} />
          </span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="input-field flex-1 px-2 py-2 text-sm min-w-0"
          />
          {location && (
            <>
              <div className="h-5 w-px mx-1" style={{ background: "var(--border)" }} />
              <div className="relative flex items-center">
                <select
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="appearance-none pl-2 pr-6 py-2 text-xs bg-transparent outline-none cursor-pointer"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {DISTANCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-1 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
              </div>
            </>
          )}
        </div>
        <Button3D type="submit" size="sm">Search</Button3D>
      </form>
    );
  }

  /* ── Full hero variant ── */
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="search-card rounded-2xl">
        {/* Condition */}
        <div className="flex items-center px-5 pt-4 pb-2 gap-3">
          <Search size={18} className="shrink-0" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab") { e.preventDefault(); locationRef.current?.focus(); }
            }}
            placeholder="Condition or disease (e.g. Alzheimer's, breast cancer)"
            className="input-field flex-1 text-base"
            autoFocus
          />
        </div>

        {/* Divider */}
        <div className="mx-5 h-px" style={{ background: "var(--border-subtle)" }} />

        {/* Location */}
        <div className="flex items-center px-5 pt-2 pb-4 gap-3">
          <MapPin size={18} className="shrink-0" style={{ color: "var(--text-tertiary)" }} />
          <input
            ref={locationRef}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location — city, state, or country (optional)"
            className="input-field flex-1 text-base"
          />
          {location && (
            <div className="relative flex items-center shrink-0">
              <select
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="appearance-none pl-2 pr-6 py-1 text-sm rounded-lg outline-none cursor-pointer"
                style={{
                  background: "var(--accent-bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {DISTANCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-1.5 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
            </div>
          )}
        </div>
      </div>

      <Button3D
        type="submit"
        disabled={!condition.trim()}
        className="mt-4 w-full"
      >
        Search clinical trials
      </Button3D>
    </form>
  );
}
