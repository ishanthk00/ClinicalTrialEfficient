export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

const cache = new Map<string, GeocodeResult | null>();

function normalizeKey(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function geocodeLocation(
  query: string
): Promise<GeocodeResult | null> {
  const key = normalizeKey(query);
  if (!key) return null;
  if (cache.has(key)) return cache.get(key)!;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    query
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "TrialFind/1.0 (clinical trial finder)",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    const first = data[0];
    const result: GeocodeResult | null = first
      ? {
          lat: parseFloat(first.lat),
          lon: parseFloat(first.lon),
          displayName: first.display_name,
        }
      : null;
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}

/**
 * Geocode the user's search origin. Origin strings are the most ambiguous input
 * (bare city names), so this fetches several candidates and picks the most
 * prominent one by Nominatim's `importance` score instead of blindly taking the
 * first hit. Results are cached under a dedicated key namespace.
 */
export async function geocodeOrigin(
  query: string
): Promise<GeocodeResult | null> {
  const base = normalizeKey(query);
  if (!base) return null;
  const key = `origin:${base}`;
  if (cache.has(key)) return cache.get(key)!;

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(
    query
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "TrialFind/1.0 (clinical trial finder)",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
      importance?: number;
    }>;
    if (data.length === 0) {
      cache.set(key, null);
      return null;
    }
    const best = data.reduce((a, b) =>
      (b.importance ?? 0) > (a.importance ?? 0) ? b : a
    );
    const result: GeocodeResult = {
      lat: parseFloat(best.lat),
      lon: parseFloat(best.lon),
      displayName: best.display_name,
    };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}

export async function geocodeMany(
  queries: string[]
): Promise<Map<string, GeocodeResult | null>> {
  const unique = [...new Set(queries.map(normalizeKey))].filter(Boolean);
  const results = new Map<string, GeocodeResult | null>();

  for (const key of unique) {
    const alreadyCached = cache.has(key);
    const result = await geocodeLocation(key);
    results.set(key, result);
    if (!alreadyCached) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
