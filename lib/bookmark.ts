import type { Trial } from "./clinicaltrials";

const KEY = "trialfind_bookmarks";

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

export function addBookmark(trial: Trial): void {
  const current = getBookmarks().filter((t) => t.nctId !== trial.nctId);
  localStorage.setItem(KEY, JSON.stringify([trial, ...current]));
  emitChange();
}

export function removeBookmark(nctId: string): void {
  const current = getBookmarks().filter((t) => t.nctId !== nctId);
  localStorage.setItem(KEY, JSON.stringify(current));
  emitChange();
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
