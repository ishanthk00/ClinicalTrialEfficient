import { Suspense } from "react";
import { searchTrials } from "@/lib/clinicaltrials";
import { geocodeLocation, geocodeMany } from "@/lib/geocode";
import TrialCard from "@/components/TrialCard";
import FilterPanel from "@/components/FilterPanel";
import SearchBar from "@/components/SearchBar";
import SkeletonCard from "@/components/SkeletonCard";
import MapPanel from "@/components/MapPanel";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { MapMarker } from "@/components/TrialsMap";

interface SearchParams {
  condition?: string;
  location?: string;
  distance?: string;
  status?: string;
  recruitingOnly?: string;
  recent?: string;
  phase?: string;
  ageGroup?: string;
  pageToken?: string;
}

async function MapSection({
  trials,
  location,
  distance,
}: {
  trials: Awaited<ReturnType<typeof searchTrials>>["trials"];
  location?: string;
  distance?: string;
}) {
  // Build unique "city, state, country" keys from all trial locations on this page
  const locationKeys = [
    ...new Set(
      trials.flatMap((t) =>
        t.locations.map((l) =>
          [l.city, l.state, l.country].filter(Boolean).join(", ")
        )
      ).filter(Boolean)
    ),
  ];

  const geocodeMap = await geocodeMany(locationKeys);

  // Group trials by geocoded location key
  const markerMap = new Map<string, MapMarker>();
  for (const trial of trials) {
    for (const loc of trial.locations) {
      const key = [loc.city, loc.state, loc.country].filter(Boolean).join(", ");
      if (!key) continue;
      const coords = geocodeMap.get(key.trim().toLowerCase().replace(/\s+/g, " "));
      if (!coords) continue;
      if (!markerMap.has(key)) {
        markerMap.set(key, { key, lat: coords.lat, lon: coords.lon, trials: [] });
      }
      const marker = markerMap.get(key)!;
      if (!marker.trials.find((t) => t.nctId === trial.nctId)) {
        marker.trials.push({ nctId: trial.nctId, title: trial.title, status: trial.status });
      }
    }
  }

  const markers = [...markerMap.values()];

  const center = location ? await geocodeLocation(location) : null;
  const radiusMiles =
    distance && distance !== "any" ? parseInt(distance, 10) : undefined;

  return (
    <MapPanel
      markers={markers}
      center={center ? { lat: center.lat, lon: center.lon } : null}
      radiusMiles={radiusMiles}
    />
  );
}

async function ResultsContent({ searchParams }: { searchParams: SearchParams }) {
  const {
    condition,
    location,
    distance,
    status,
    recruitingOnly,
    recent,
    phase,
    ageGroup,
    pageToken,
  } = searchParams;

  if (!condition) {
    return (
      <div className="text-center py-16">
        <p className="text-[#6B7280]">Enter a condition to search for trials.</p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-[#2563EB] hover:underline"
        >
          Go back to search
        </Link>
      </div>
    );
  }

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
    });
  } catch {
    return (
      <div className="text-center py-16">
        <p className="text-[#111827] font-medium mb-2">Something went wrong</p>
        <p className="text-sm text-[#6B7280]">
          We couldn&apos;t reach ClinicalTrials.gov. Please try again in a moment.
        </p>
      </div>
    );
  }

  const { trials, nextPageToken, totalCount } = result;

  if (trials.length === 0) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="w-12 h-12 bg-gray-100 dark:bg-[#181820] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
          🔍
        </div>
        <h3 className="font-semibold text-[#111827] dark:text-[#EAEAF5] mb-2">No trials found</h3>
        <p className="text-sm text-[#6B7280] dark:text-[#8686A8] leading-relaxed">
          No trials found for{" "}
          <span className="font-medium text-[#111827] dark:text-[#EAEAF5]">{condition}</span>
          {location && (
            <>
              {" "}near{" "}
              <span className="font-medium text-[#111827] dark:text-[#EAEAF5]">{location}</span>
            </>
          )}
          . Try broadening your search by removing filters or searching without a location.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Link
            href={`/results?condition=${encodeURIComponent(condition)}`}
            className="text-sm px-4 py-2 bg-white dark:bg-[#111118] border border-[#E5E7EB] dark:border-[#222232] rounded-full hover:border-[#2563EB] dark:hover:border-[#5B9BFF] text-[#374151] dark:text-[#CDCDE4] transition-colors"
          >
            Search without location
          </Link>
          <Link
            href="/"
            className="text-sm px-4 py-2 bg-[#2563EB] dark:bg-[#5B9BFF] text-white rounded-full hover:bg-[#1D4ED8] dark:hover:bg-[#7DB2FF] transition-colors"
          >
            New search
          </Link>
        </div>
      </div>
    );
  }

  const nextParams = new URLSearchParams();
  if (condition) nextParams.set("condition", condition);
  if (location) nextParams.set("location", location);
  if (distance) nextParams.set("distance", distance);
  if (status) nextParams.set("status", status);
  if (recruitingOnly) nextParams.set("recruitingOnly", recruitingOnly);
  if (recent) nextParams.set("recent", recent);
  if (phase) nextParams.set("phase", phase);
  if (ageGroup) nextParams.set("ageGroup", ageGroup);
  if (nextPageToken) nextParams.set("pageToken", nextPageToken);

  return (
    <>
      {/* Map panel — streams in independently so trial cards render immediately */}
      <Suspense fallback={null}>
        <MapSection trials={trials} location={location} distance={distance} />
      </Suspense>

      {totalCount !== undefined && (
        <p className="text-sm text-[#6B7280] dark:text-[#8686A8] mb-5">
          Showing {trials.length} of {totalCount.toLocaleString()} trials
          {condition && (
            <>
              {" "}for{" "}
              <span className="font-medium text-[#111827] dark:text-[#EAEAF5]">{condition}</span>
            </>
          )}
          {location && (
            <>
              {" "}near{" "}
              <span className="font-medium text-[#111827] dark:text-[#EAEAF5]">{location}</span>
            </>
          )}
          {recent === "1" && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent-bg)", color: "var(--text-secondary)" }}>
              Recently updated
            </span>
          )}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trials.map((trial, index) => (
          <TrialCard key={trial.nctId} trial={trial} index={index} />
        ))}
      </div>

      {nextPageToken && (
        <div className="mt-8 text-center">
          <Link href={`/results?${nextParams.toString()}`} className="btn-3d btn-3d--sm">
            <span className="btn-3d__shadow" aria-hidden="true" />
            <span className="btn-3d__edge" aria-hidden="true" />
            <span className="btn-3d__front">
              Load more trials
              <ChevronRight size={14} aria-hidden="true" />
            </span>
          </Link>
        </div>
      )}
    </>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar
          initialCondition={condition}
          initialLocation={location}
          initialDistance={distance}
          compact
        />
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block w-52 shrink-0">
          <Suspense>
            <FilterPanel />
          </Suspense>
        </div>

        <div className="flex-1 min-w-0">
          <Suspense fallback={<SkeletonGrid />}>
            <ResultsContent searchParams={resolvedParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
