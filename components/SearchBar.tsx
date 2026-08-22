"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";

const DISTANCE_OPTIONS = [
  { value: "25",  label: "25 mi" },
  { value: "50",  label: "50 mi" },
  { value: "100", label: "100 mi" },
  { value: "250", label: "250 mi" },
  { value: "any", label: "Any distance" },
];

export interface SearchBarProps {
  /** Seed values for the uncontrolled fields (the results page passes these). */
  initialCondition?: string;
  initialLocation?: string;
  initialDistance?: string;
  /** Slim single-row variant that sits above the results list. */
  compact?: boolean;
  /**
   * Optional controlled condition. Pass it together with `onConditionChange`
   * to drive the field from outside — the home page's condition chips use this.
   * Leave both undefined and the field stays uncontrolled, seeded by
   * `initialCondition`.
   */
  condition?: string;
  onConditionChange?: (value: string) => void;
}

export default function SearchBar({
  initialCondition = "",
  initialLocation = "",
  initialDistance = "any",
  compact = false,
  condition: conditionProp,
  onConditionChange,
}: SearchBarProps) {
  const router = useRouter();
  const fieldId = useId();
  const [conditionState, setConditionState] = useState(initialCondition);
  const [location, setLocation] = useState(initialLocation);
  const [distance, setDistance] = useState(initialDistance);

  const isControlled = conditionProp !== undefined;
  const condition = conditionProp ?? conditionState;

  function updateCondition(value: string) {
    if (!isControlled) setConditionState(value);
    onConditionChange?.(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!condition.trim()) return;
    const params = new URLSearchParams();
    if (condition.trim()) params.set("condition", condition.trim());
    if (location.trim()) params.set("location", location.trim());
    if (location.trim() && distance !== "any") params.set("distance", distance);
    router.push(`/results?${params.toString()}`);
  }

  // The radius only means anything once there is a place to measure from, so
  // the control stays out of the way until a location is typed.
  const showDistance = location.trim().length > 0;

  /* ── Compact variant (results page top bar) ── */
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full">
        <div className="search-card flex flex-1 min-w-0 items-center overflow-hidden">
          <span className="pl-3 shrink-0" style={{ color: "var(--text-tertiary)" }}>
            <Search size={15} aria-hidden="true" />
          </span>
          <input
            type="text"
            value={condition}
            onChange={(e) => updateCondition(e.target.value)}
            placeholder="Condition"
            aria-label="Condition, drug or trial ID"
            autoComplete="off"
            className="input-field flex-1 min-w-0 px-2 py-2.5 text-sm"
          />
          <span className="h-5 w-px mx-1 shrink-0" style={{ background: "var(--border)" }} />
          <span className="pl-2 shrink-0" style={{ color: "var(--text-tertiary)" }}>
            <MapPin size={15} aria-hidden="true" />
          </span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            aria-label="Where you can travel"
            autoComplete="off"
            className="input-field flex-1 min-w-0 px-2 py-2.5 text-sm"
          />
          {showDistance && (
            <>
              <span className="h-5 w-px mx-1 shrink-0" style={{ background: "var(--border)" }} />
              <div className="relative flex shrink-0 items-center">
                <select
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  aria-label="Distance from your location"
                  className="appearance-none cursor-pointer bg-transparent pl-2 pr-6 py-2.5 text-xs outline-none"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {DISTANCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown
                  size={11}
                  aria-hidden="true"
                  className="absolute right-1 pointer-events-none"
                  style={{ color: "var(--text-tertiary)" }}
                />
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          className="v4-btn v4-btn-sm shrink-0"
          style={{ paddingBlock: 12, paddingInline: 22, fontSize: "var(--fs-small)" }}
        >
          Search
        </button>
      </form>
    );
  }

  /* ── Full variant ──
     4fr / 3fr / auto on wide screens, one column below `md`. The distance
     select claims a fourth column only once it is revealed, so the default
     state keeps the two-field proportions the design calls for. */
  const columns = showDistance
    ? "md:grid-cols-[4fr_3fr_auto_auto]"
    : "md:grid-cols-[4fr_3fr_auto]";

  return (
    <form onSubmit={handleSubmit} className={`grid grid-cols-1 items-end gap-4 ${columns}`}>
      <div>
        <label className="v4-label" htmlFor={`${fieldId}-condition`}>
          Condition, drug or trial ID
        </label>
        <input
          id={`${fieldId}-condition`}
          type="text"
          className="v4-input"
          value={condition}
          onChange={(e) => updateCondition(e.target.value)}
          placeholder="Alzheimer's, lecanemab, NCT05221619"
          autoComplete="off"
        />
      </div>

      <div>
        <label className="v4-label" htmlFor={`${fieldId}-location`}>
          Where you can travel
        </label>
        <input
          id={`${fieldId}-location`}
          type="text"
          className="v4-input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, state or country"
          autoComplete="off"
        />
      </div>

      {showDistance && (
        <div style={{ minWidth: 156 }}>
          <label className="v4-label" htmlFor={`${fieldId}-distance`}>
            Distance
          </label>
          <select
            id={`${fieldId}-distance`}
            className="v4-input"
            style={{ cursor: "pointer" }}
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          >
            {DISTANCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        className="v4-btn"
        style={{ paddingBlock: 13 }}
        disabled={!condition.trim()}
      >
        Show matches
      </button>
    </form>
  );
}
