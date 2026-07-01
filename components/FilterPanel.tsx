"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "RECRUITING", label: "Recruiting" },
  { value: "ACTIVE_NOT_RECRUITING", label: "Active, not recruiting" },
  { value: "COMPLETED", label: "Completed" },
  { value: "NOT_YET_RECRUITING", label: "Not yet recruiting" },
];

const PHASE_OPTIONS = [
  { value: "Phase 1", label: "Phase 1" },
  { value: "Phase 2", label: "Phase 2" },
  { value: "Phase 3", label: "Phase 3" },
  { value: "Phase 4", label: "Phase 4" },
];

const AGE_OPTIONS = [
  { value: "Child", label: "Child" },
  { value: "Adult", label: "Adult" },
  { value: "Older Adult", label: "Older Adult" },
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

function Toggle({
  label,
  checked,
  disabled,
  disabledHint,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onChange: () => void;
}) {
  return (
    <button
      onClick={disabled ? undefined : onChange}
      title={disabled ? disabledHint : undefined}
      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-[#181820]"
      } ${checked && !disabled ? "bg-[#EFF6FF] dark:bg-[#0B1828]" : ""}`}
      style={{ color: checked && !disabled ? "var(--accent,#2563EB)" : "var(--text-primary,#374151)" }}
    >
      <span className={checked && !disabled ? "font-medium" : ""}>{label}</span>
      <span
        className="relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors"
        style={{
          background: checked && !disabled ? "var(--accent,#2563EB)" : "var(--border,#E5E7EB)",
        }}
      >
        <span
          className="inline-block h-3 w-3 rounded-full bg-white shadow transition-transform"
          style={{ transform: checked && !disabled ? "translateX(13px)" : "translateX(1px)" }}
        />
      </span>
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

  // Recruiting toggle is disabled when a specific non-recruiting status is active
  const recruitingDisabled = !!currentStatus && currentStatus !== "RECRUITING";

  const activeFilters =
    FILTER_GROUPS.filter((g) => searchParams.has(g.key)).length +
    (recruitingOnly ? 1 : 0) +
    (recent ? 1 : 0);

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#111827] dark:text-[#EAEAF5]">Filters</h2>
        {activeFilters > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-[#6B7280] dark:text-[#8686A8] hover:text-[#111827] dark:hover:text-[#EAEAF5] flex items-center gap-1 transition-colors"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-xs font-medium text-[#6B7280] dark:text-[#8686A8] uppercase tracking-wide mb-2.5">
          Sort by
        </h3>
        <Toggle
          label="Recently updated"
          checked={recent}
          onChange={() => toggleBoolParam("recent")}
        />
      </div>

      {/* Quick recruitment toggle */}
      <div>
        <h3 className="text-xs font-medium text-[#6B7280] dark:text-[#8686A8] uppercase tracking-wide mb-2.5">
          Recruitment
        </h3>
        <Toggle
          label="Recruiting only"
          checked={recruitingOnly || currentStatus === "RECRUITING"}
          disabled={recruitingDisabled}
          disabledHint="Clear the Status filter first to use this toggle"
          onChange={() => toggleBoolParam("recruitingOnly")}
        />
      </div>

      {/* Existing detailed filter groups */}
      {FILTER_GROUPS.map((group) => {
        const current = searchParams.get(group.key);
        return (
          <div key={group.key}>
            <h3 className="text-xs font-medium text-[#6B7280] dark:text-[#8686A8] uppercase tracking-wide mb-2.5">
              {group.label}
            </h3>
            <div className="flex flex-col gap-1">
              {group.options.map((opt) => {
                const active = current === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter(group.key, opt.value)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      active
                        ? "bg-[#EFF6FF] dark:bg-[#0B1828] text-[#2563EB] dark:text-[#5B9BFF] font-medium"
                        : "text-[#374151] dark:text-[#EAEAF5] hover:bg-[#F9FAFB] dark:hover:bg-[#181820]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
