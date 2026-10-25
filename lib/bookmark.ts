import type { Trial } from "./clinicaltrials";

const KEY = "trialfind_bookmarks";
const CLIENT_ID_KEY = "trialfind_client_id";

/**
 * Generates or retrieves a persistent anonymous client ID so bookmarks can
 * be synced with the Supabase backend without requiring a login wall.
 */
export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `tf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function getBookmarks(): Trial[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isBookmarked(nctId: string): boolean {
  return getBookmarks().some((t) => t.nctId === nctId);
}

/** Same-tab change signal. The `storage` event only fires in *other* tabs, so
 *  without this the header's saved count goes stale until a navigation. */
const EVENT = "trialfind:bookmarks";

function emitChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

/** Subscribe to bookmark changes from this tab and from other tabs.
 *  Returns an unsubscribe function. */
export function subscribeBookmarks(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Synchronizes local bookmarks with the Supabase backend (`/api/bookmarks`).
 * Merges any locally saved trials with remote rows stored in Supabase.
 */
export async function syncBookmarksWithBackend(): Promise<Trial[]> {
  if (typeof window === "undefined") return [];
  const local = getBookmarks();
  const clientId = getClientId();
  if (!clientId) return local;

  try {
    const res = await fetch(
      `/api/bookmarks?clientId=${encodeURIComponent(clientId)}`,
      { method: "GET" }
    );
    if (!res.ok) return local;

    const data = (await res.json()) as {
      configured?: boolean;
      trials?: Trial[];
    };

    if (!data.configured || !Array.isArray(data.trials)) {
      return local;
    }

    const remote = data.trials;
    const remoteIds = new Set(remote.map((t) => t.nctId));
    const unsyncedLocal = local.filter((t) => !remoteIds.has(t.nctId));

    // Push any local-only bookmarks up to Supabase
    if (unsyncedLocal.length > 0) {
      void fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, trials: unsyncedLocal }),
      }).catch(() => {});
    }

    const merged = [...unsyncedLocal, ...remote];
    localStorage.setItem(KEY, JSON.stringify(merged));
    emitChange();
    return merged;
  } catch {
    return local;
  }
}

export function addBookmark(trial: Trial): void {
  const current = getBookmarks().filter((t) => t.nctId !== trial.nctId);
  localStorage.setItem(KEY, JSON.stringify([trial, ...current]));
  emitChange();

  const clientId = getClientId();
  if (clientId) {
    void fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, trial }),
    }).catch(() => {});
  }
}

export function removeBookmark(nctId: string): void {
  const current = getBookmarks().filter((t) => t.nctId !== nctId);
  localStorage.setItem(KEY, JSON.stringify(current));
  emitChange();

  const clientId = getClientId();
  if (clientId) {
    const params = new URLSearchParams({ clientId, nctId });
    void fetch(`/api/bookmarks?${params.toString()}`, {
      method: "DELETE",
    }).catch(() => {});
  }
}

export function toggleBookmark(trial: Trial): boolean {
  if (isBookmarked(trial.nctId)) {
    removeBookmark(trial.nctId);
    return false;
  } else {
    addBookmark(trial);
    return true;
  }
}
