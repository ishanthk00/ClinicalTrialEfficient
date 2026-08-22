"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getBookmarks, subscribeBookmarks } from "@/lib/bookmark";

type NavItem = {
  label: string;
  href: string;
  /** Route prefix that marks this link as the current page. Omitted for
   *  in-page anchors, which never claim `aria-current`. */
  match?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Search", href: "/results", match: "/results" },
  { label: "About", href: "/about", match: "/about" },
  { label: "How matching works", href: "/#matching" },
  { label: "Reviews", href: "/reviews", match: "/reviews" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const path = pathname ?? "";

  // Saved-trial count lives in localStorage, so it can only be read on the
  // client. Stay at `null` until mounted so SSR and first client render match.
  const [savedCount, setSavedCount] = useState<number | null>(null);

  // `path` is an intentional trigger, not a value the effect reads: re-running
  // on navigation refreshes the count after a trial is saved on another page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const read = () => setSavedCount(getBookmarks().length);
    read();
    // Live updates: same-tab toggles emit a custom event, other tabs emit
    // `storage`; both are handled by subscribeBookmarks.
    const unsubscribe = subscribeBookmarks(read);
    window.addEventListener("focus", read);
    return () => {
      unsubscribe();
      window.removeEventListener("focus", read);
    };
  }, [path]);

  const isCurrent = (match?: string) =>
    !!match && (path === match || path.startsWith(`${match}/`));

  return (
    <header className="site-header">
      <div
        className="shell flex items-center"
        style={{ minHeight: 72, gap: "clamp(20px, 3vw, 48px)" }}
      >
        <Link
          href="/"
          className="shrink-0"
          style={{
            fontSize: "var(--fs-h5)",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--accent)",
          }}
        >
          TrialFind
        </Link>

        {/* Centre links. Shrinks and scrolls horizontally on narrow screens
            rather than pushing the row past the viewport. */}
        <nav
          aria-label="Main"
          className="flex items-center min-w-0 overflow-x-auto"
          style={{ gap: "clamp(16px, 2.2vw, 32px)", scrollbarWidth: "none" }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link whitespace-nowrap"
              aria-current={isCurrent(item.match) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/saved"
          className="v4-btn-accent-outline shrink-0 whitespace-nowrap"
          style={{ marginLeft: "auto" }}
          aria-current={isCurrent("/saved") ? "page" : undefined}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          Saved trials
          {savedCount !== null && (
            <span style={{ color: "var(--text-secondary)" }}>{savedCount}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
