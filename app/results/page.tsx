import { Suspense, type ReactNode } from "react";
import { searchTrials, type Trial } from "@/lib/clinicaltrials";
import { geocodeOrigin } from "@/lib/geocode";
import {
  enrichTrialsWithDistance,
  buildTrialMarkers,
} from "@/lib/distance";
import TrialCard from "@/components/TrialCard";
import FilterPanel from "@/components/FilterPanel";
import SearchBar from "@/components/SearchBar";
import SkeletonCard from "@/components/SkeletonCard";
import MapPanel from "@/components/MapPanel";
import Link from "next/link";

interface SearchParams {
  condition?: string;
  location?: string;
  distance?: string;
  status?: string;
  recruitingOnly?: string;
  recent?: string;
  sort?: string;
  phase?: string;
  ageGroup?: string;
  pageToken?: string;
}

/** v4 caps emphasis at weight 500 — never `<strong>`'s default 700. */
function Mark({ children }: { children: ReactNode }) {
  return <strong style={{ fontWeight: 500, color: "var(--text)" }}>{children}</strong>;
}

/** Quiet notice card used for the empty / error / no-query states. */
function QuietCard({
  heading,
  children,
  actions,
}: {
  heading: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="v4-card p-6 sm:p-8" style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: "var(--fs-h4)", fontWeight: 500, marginBottom: 10 }}>
        {heading}
      </h2>
      <p
        className="measure"
        style={{ fontSize: 16, lineHeight: 1.6, color: "var(--text-secondary)" }}
      >
        {children}
      </p>
      {actions && <div className="flex flex-wrap items-center gap-3 mt-6">{actions}</div>}
    </div>
  );
}

/**
 * "updated 3 days ago" derived from the freshest `lastUpdatePostDate` in the
 * result set. Returns null when no study carries a date — we say nothing
 * rather than invent a number.
 */
function formatUpdatedClause(trials: Trial[]): string | null {
  const stamps = trials
    .map((t) => (t.lastUpdatePostDate ? Date.parse(t.lastUpdatePostDate) : NaN))
    .filter((n) => !Number.isNaN(n));
  if (stamps.length === 0) return null;

  const days = Math.max(
    0,
    Math.round((Date.now() - Math.max(...stamps)) / 86_400_000)
  );
  if (days === 0) return "updated today";
  if (days === 1) return "updated yesterday";
  if (days < 30) return `updated ${days} days ago`;

  const months = Math.round(days / 30);
  if (months < 12) return `updated ${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.round(days / 365);
  return `updated ${years} year${years === 1 ? "" : "s"} ago`;
}

async function ResultsContent({ searchParams }: { searchParams: SearchParams }) {
  const {
    condition,
    location,
    distance,
    status,
    recruitingOnly,
    recent,
    sort,
    phase,
    ageGroup,
    pageToken,
  } = searchParams;

  if (!condition) {
    return (
      <QuietCard
        heading="Tell us what to look for"
        actions={
          <Link href="/" className="v4-btn-outline v4-btn-sm">
            Go back to search
          </Link>
        }
      >
        Enter a condition in the box above and we will look through the registry
        for you. Nothing is submitted anywhere on your behalf.
      </QuietCard>
    );
  }

  const radiusMiles =
    distance && distance !== "any" ? parseInt(distance, 10) : undefined;
  const sortByDistance = sort === "distance";

  // Only the origin needs geocoding (Nominatim). Trial proximity uses the
  // precise per-facility coordinates returned by the ClinicalTrials.gov API.
  const origin = location ? await geocodeOrigin(location) : null;

  let result;
  try {
    result = await searchTrials({
      condition,
      location,
      status,
      recruitingOnly: recruitingOnly === "1",
      recent: recent === "1",
      phase,
      ageGroup,
      pageToken,
      originLat: origin?.lat,
      originLon: origin?.lon,
      radiusMiles,
    });
  } catch {
    return (
      <QuietCard
        heading="We could not reach ClinicalTrials.gov"
        actions={
          <Link href="/" className="v4-btn-outline v4-btn-sm">
            Start a new search
          </Link>
        }
      >
        The registry did not answer just now. This is almost always brief —
        nothing about your search was lost, and trying again in a moment
        usually works.
      </QuietCard>
    );
  }

  const { nextPageToken, totalCount } = result;

  // Attach Haversine distances from the origin to each trial's nearest facility.
  let trials = enrichTrialsWithDistance(result.trials, origin);
  if (sortByDistance && origin) {
    trials = [...trials].sort(
      (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    );
  }
  const markers = buildTrialMarkers(trials, origin);

  if (trials.length === 0) {
    return (
      <QuietCard
        heading="Nothing matched this search yet"
        actions={
          <>
            {location && (
              <Link
                href={`/results?condition=${encodeURIComponent(condition)}`}
                className="v4-btn-outline v4-btn-sm"
              >
                Search without location
              </Link>
            )}
            <Link href="/" className="v4-btn v4-btn-sm">
              New search
            </Link>
          </>
        }
      >
        We could not find a study for <Mark>{condition}</Mark>
        {location && (
          <>
            {radiusMiles !== undefined
              ? ` within ${radiusMiles} mi of `
              : " near "}
            <Mark>{location}</Mark>
          </>
        )}
        {
          ". Clearing a filter, widening the distance, or searching without a location usually turns something up. Nothing is lost by trying again."
        }
      </QuietCard>
    );
  }

  const nextParams = new URLSearchParams();
  if (condition) nextParams.set("condition", condition);
  if (location) nextParams.set("location", location);
  if (distance) nextParams.set("distance", distance);
  if (status) nextParams.set("status", status);
  if (recruitingOnly) nextParams.set("recruitingOnly", recruitingOnly);
  if (recent) nextParams.set("recent", recent);
  if (sort) nextParams.set("sort", sort);
  if (phase) nextParams.set("phase", phase);
  if (ageGroup) nextParams.set("ageGroup", ageGroup);
  if (nextPageToken) nextParams.set("pageToken", nextPageToken);

  const sortLabel =
    sortByDistance && origin
      ? "Nearest first"
      : recent === "1"
        ? "Recently updated"
        : "Best match";
  const updatedClause = formatUpdatedClause(trials);

  const remaining =
    totalCount !== undefined ? Math.max(totalCount - trials.length, 0) : undefined;
  // The registry hands back one page at a time — the next one is the same size.
  const nextBatch = Math.max(
    1,
    remaining !== undefined ? Math.min(trials.length, remaining) : trials.length
  );

  return (
    <>
      {/* Map: markers come from precise API facility coordinates (no geocoding) */}
      <MapPanel
        markers={markers}
        center={origin ? { lat: origin.lat, lon: origin.lon } : null}
        radiusMiles={radiusMiles}
      />

      <div
        className="flex flex-wrap items-end justify-between"
        style={{ gap: 24 }}
      >
        <h2 style={{ fontSize: "var(--fs-h3)", fontWeight: 500, lineHeight: 1.2 }}>
          {trials.length} {trials.length === 1 ? "study" : "studies"} may fit
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {sortLabel}
          {updatedClause ? ` · ${updatedClause}` : ""}
        </p>
      </div>

      <p
        className="measure"
        style={{
          fontSize: 16,
          lineHeight: 1.6,
          color: "var(--text-secondary)",
          marginTop: 12,
          marginBottom: 24,
        }}
      >
        {totalCount !== undefined
          ? `Narrowed from ${totalCount.toLocaleString()} records for `
          : "Results for "}
        <Mark>{condition}</Mark>
        {location && (
          <>
            {" near "}
            <Mark>{location}</Mark>
          </>
        )}
        {". Select a study to read it in plain language."}
      </p>

      <div className="flex flex-col gap-3">
        {trials.map((trial, index) => (
          <TrialCard key={trial.nctId} trial={trial} index={index} />
        ))}
      </div>

      {nextPageToken && (
        <div className="mt-8 flex flex-col items-center" style={{ gap: 12 }}>
          <Link href={`/results?${nextParams.toString()}`} className="v4-btn-outline">
            Show {nextBatch} more
          </Link>
          {remaining !== undefined && remaining > 0 && (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                textAlign: "center",
              }}
            >
              {remaining.toLocaleString()} more records match — no rush, they
              will still be here later
            </p>
          )}
        </div>
      )}
    </>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const { condition, location, distance } = resolvedParams;

  return (
    <div className="shell py-10">
      <div className="mb-8">
        <SearchBar
          initialCondition={condition}
          initialLocation={location}
          initialDistance={distance}
          compact
        />
      </div>

      {/* Filters live outside the results boundary so they stay reachable
          even when a search comes back empty. */}
      <div className="mb-8">
        <Suspense>
          <FilterPanel />
        </Suspense>
      </div>

      <Suspense fallback={<SkeletonList />}>
        <ResultsContent searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
