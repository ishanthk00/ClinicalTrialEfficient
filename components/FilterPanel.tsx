"use client";

import { useRouter, useSearchParams } from "next/navigation";

/** Query-param values are unchanged — only the labels are v4 copy. */
const STATUS_OPTIONS = [
  { value: "RECRUITING", label: "Recruiting now" },
  { value: "NOT_YET_RECRUITING", label: "Opening soon" },
  { value: "ACTIVE_NOT_RECRUITING", label: "Enrollment closed" },
  { value: "COMPLETED", label: "Completed" },
];

const PHASE_OPTIONS = [
  { value: "Phase 1", label: "Phase 1" },
  { value: "Phase 2", label: "Phase 2" },
  { value: "Phase 3", label: "Phase 3" },
  { value: "Phase 4", label: "Phase 4" },
];

const AGE_OPTIONS = [
  { value: "Adult", label: "Adults" },
  { value: "Older Adult", label: "Older adults" },
  { value: "Child", label: "Children" },
];

interface FilterGroup {
  label: string;
  key: string;
  options: { value: string; label: string }[];
}

const FILTER_GROUPS: FilterGroup[] = [
  { label: "Status", key: "status", options: STATUS_OPTIONS },
  { label: "Phase", key: "phase", options: PHASE_OPTIONS },
  { label: "Age group", key: "ageGroup", options: AGE_OPTIONS },
];

function Chip({
  label,
  active,
  disabled,
  disabledHint,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="v4-chip"
      aria-pressed={active}
      aria-disabled={disabled || undefined}
      title={disabled ? disabledHint : undefined}
      onClick={disabled ? undefined : onClick}
      style={disabled ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
    >
      {label}
    </button>
  );
}

export default function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("pageToken");
    router.push(`/results?${params.toString()}`);
  }

  function toggleBoolParam(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === "1") {
      params.delete(key);
    } else {
      params.set(key, "1");
    }
    params.delete("pageToken");
    router.push(`/results?${params.toString()}`);
  }

  function toggleSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("sort") === value) {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("pageToken");
    router.push(`/results?${params.toString()}`);
  }

  function clearAll() {
    const params = new URLSearchParams();
    const condition = searchParams.get("condition");
    const location = searchParams.get("location");
    const distance = searchParams.get("distance");
    if (condition) params.set("condition", condition);
    if (location) params.set("location", location);
    if (distance) params.set("distance", distance);
    router.push(`/results?${params.toString()}`);
  }

  const currentStatus = searchParams.get("status");
  const recruitingOnly = searchParams.get("recruitingOnly") === "1";
  const recent = searchParams.get("recent") === "1";
  const hasLocation = !!searchParams.get("location");
  const sortByDistance = searchParams.get("sort") === "distance";

  // Recruiting toggle is disabled when a specific non-recruiting status is active
  const recruitingDisabled = !!currentStatus && currentStatus !== "RECRUITING";

  const activeFilters =
    FILTER_GROUPS.filter((g) => searchParams.has(g.key)).length +
    (recruitingOnly ? 1 : 0) +
    (recent ? 1 : 0) +
    (sortByDistance ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
      <span
        style={{
          fontSize: "var(--fs-small)",
          color: "var(--text-secondary)",
          marginRight: 4,
        }}
      >
        Narrow by
      </span>

      {FILTER_GROUPS.flatMap((group) => {
        const current = searchParams.get(group.key);
        return group.options.map((opt) => (
          <Chip
            key={`${group.key}:${opt.value}`}
            label={opt.label}
            active={current === opt.value}
            onClick={() => updateFilter(group.key, opt.value)}
          />
        ));
      })}

      <Chip
        label="Recruiting only"
        active={recruitingOnly || currentStatus === "RECRUITING"}
        disabled={recruitingDisabled}
        disabledHint="Clear the Status filter first to use this toggle"
        onClick={() => toggleBoolParam("recruitingOnly")}
      />
      <Chip
        label="Recently updated"
        active={recent}
        onClick={() => toggleBoolParam("recent")}
      />
      <Chip
        label="Nearest first"
        active={sortByDistance && hasLocation}
        disabled={!hasLocation}
        disabledHint="Add a location to sort trials by distance"
        onClick={() => toggleSort("distance")}
      />

      <button
        type="button"
        className="v4-link-quiet"
        onClick={clearAll}
        style={{ marginLeft: "auto" }}
      >
        Start over{activeFilters > 0 ? ` (${activeFilters})` : ""}
      </button>
    </div>
  );
}
