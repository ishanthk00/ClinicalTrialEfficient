"use client";

import { useId } from "react";

/**
 * The v4 star outline, drawn on a 24×24 viewBox. Exported so the review
 * form can reuse the exact same silhouette for its interactive rating
 * buttons instead of keeping a second copy of the path in sync.
 */
export const STAR_PATH =
  "M12 3.2l2.7 5.6 6.1.8-4.4 4.3 1.1 6.1L12 17.1l-5.5 2.9 1.1-6.1L3.2 9.6l6.1-.8z";

/** Unfilled portion of a star. */
const EMPTY_FILL = "rgba(0,43,62,.14)";

type StarsProps = {
  /** Rating out of 5. Fractional values render a partially filled star. */
  value: number;
  /** Edge length of a single star in px. */
  size?: number;
};

/**
 * Read-only star rating with true fractional fill.
 *
 * The partial star is drawn with a two-stop `<linearGradient>` whose stops sit
 * at the same offset, giving a hard vertical edge at exactly `value % 1`. The
 * gradient id is derived from `useId()` so several ratings can sit on one page
 * without colliding (SVG paint references are resolved document-wide, so a
 * shared id would make every rating adopt the first one's fill).
 */
export default function Stars({ value, size = 14 }: StarsProps) {
  // useId() emits characters that are awkward inside a url(#…) reference, so
  // reduce it to a plain alphanumeric token.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const clamped = Math.min(5, Math.max(0, value));
  const rounded = Math.round(clamped * 10) / 10;

  return (
    <span
      role="img"
      aria-label={`${rounded} out of 5 stars`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.max(2, Math.round(size * 0.1)),
        lineHeight: 0,
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fraction = Math.min(1, Math.max(0, clamped - i));
        const isPartial = fraction > 0 && fraction < 1;
        const gradientId = `${uid}star${i}`;

        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            {isPartial && (
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset={fraction} stopColor="var(--accent)" />
                  <stop offset={fraction} stopColor={EMPTY_FILL} />
                </linearGradient>
              </defs>
            )}
            <path
              d={STAR_PATH}
              fill={
                isPartial
                  ? `url(#${gradientId})`
                  : fraction >= 1
                    ? "var(--accent)"
                    : EMPTY_FILL
              }
            />
          </svg>
        );
      })}
    </span>
  );
}
