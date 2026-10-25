export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
  boundingBox?: [[number, number], [number, number]];
}

const cache = new Map<string, GeocodeResult | null>();

function normalizeKey(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Validates basic postal code format (supports US ZIP, ZIP+4, Canadian/UK alphanumeric, etc.)
 */
export function isValidPostalCode(code: string): boolean {
  const sanitized = code.trim();
  return /^[a-zA-Z0-9\s-]{3,10}$/.test(sanitized);
}

/**
 * Queries OpenStreetMap Nominatim API for postal code coordinates and bounding box.
 */
export async function geocodePostalCode(
  postalCode: string,
  countryCode = "us",
  signal?: AbortSignal
): Promise<GeocodeResult> {
  const trimmed = postalCode.trim();
  if (!isValidPostalCode(trimmed)) {
    throw new Error("Please enter a valid zip or postal code.");
  }

  const key = `postal:${countryCode.toLowerCase()}:${normalizeKey(trimmed)}`;
  if (cache.has(key)) {
    const cached = cache.get(key);
    if (cached) return cached;
  }

  const params = new URLSearchParams({
    postalcode: trimmed,
    format: "jsonv2",
    addressdetails: "1",
    limit: "1",
  });

  if (countryCode) {
    params.set("countrycodes", countryCode);
  }

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Geocoding service error (${response.status}). Please try again later.`
    );
  }

  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    boundingbox?: [string, string, string, string];
  }>;

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`No location found for postal code "${trimmed}".`);
  }

  const match = results[0];
  const result: GeocodeResult = {
    lat: parseFloat(match.lat),
    lon: parseFloat(match.lon),
    displayName: match.display_name,
    boundingBox: match.boundingbox
      ? [
          [parseFloat(match.boundingbox[0]), parseFloat(match.boundingbox[2])],
          [parseFloat(match.boundingbox[1]), parseFloat(match.boundingbox[3])],
        ]
      : undefined,
  };

  cache.set(key, result);
  return result;
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
