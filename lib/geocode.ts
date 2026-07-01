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
