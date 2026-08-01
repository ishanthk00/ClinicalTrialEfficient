import type { Trial } from "./clinicaltrials";
import type { MapMarker } from "@/components/TrialsMap";

export interface LatLon {
  lat: number;
  lon: number;
}

const EARTH_RADIUS_KM = 6371;
const KM_PER_MILE = 1.60934;

/**
 * Great-circle distance between two points using the Haversine formula.
 * Returns kilometres.
 */
export function haversineKm(a: LatLon, b: LatLon): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function kmToMiles(km: number): number {
  return km / KM_PER_MILE;
}

export function milesToKm(miles: number): number {
  return miles * KM_PER_MILE;
}

/** Human-friendly miles label: "8.4 mi" when close, "34 mi" when farther. */
export function formatMiles(km: number): string {
  const mi = kmToMiles(km);
  return mi < 10 ? `${mi.toFixed(1)} mi` : `${Math.round(mi)} mi`;
}

/**
 * Nearest-facility distance (km) from an origin to a trial, using the precise
 * per-facility coordinates the ClinicalTrials.gov API returns (`geoPoint`).
 * No geocoding round-trip required. Returns undefined when the trial has no
 * geolocated facility.
 */
export function trialDistanceKm(
  trial: Trial,
  origin: LatLon
): number | undefined {
  let best: number | undefined;
  for (const loc of trial.locations) {
    if (!loc.geoPoint) continue;
    const d = haversineKm(origin, loc.geoPoint);
    if (best === undefined || d < best) best = d;
  }
  return best;
}

/** Attach `distanceKm` to each trial. No-op when there is no origin. */
export function enrichTrialsWithDistance(
  trials: Trial[],
  origin: LatLon | null | undefined
): Trial[] {
  if (!origin) return trials;
  return trials.map((t) => {
    const distanceKm = trialDistanceKm(t, origin);
    return distanceKm === undefined ? t : { ...t, distanceKm };
  });
}

/**
 * Build map markers from trial facilities, grouping trials that share a
 * coordinate. Uses `geoPoint` directly, so markers land on the actual facility
 * rather than a geocoded city centroid.
 */
export function buildTrialMarkers(
  trials: Trial[],
  origin: LatLon | null | undefined
): MapMarker[] {
  const byCoord = new Map<string, MapMarker>();
  for (const trial of trials) {
    for (const loc of trial.locations) {
      if (!loc.geoPoint) continue;
      const { lat, lon } = loc.geoPoint;
      const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
      if (!byCoord.has(key)) {
        byCoord.set(key, {
          key,
          lat,
          lon,
          distanceKm: origin ? haversineKm(origin, loc.geoPoint) : undefined,
          trials: [],
        });
      }
      const marker = byCoord.get(key)!;
      if (!marker.trials.find((t) => t.nctId === trial.nctId)) {
        marker.trials.push({
          nctId: trial.nctId,
          title: trial.title,
          status: trial.status,
        });
      }
    }
  }
  return [...byCoord.values()];
}
