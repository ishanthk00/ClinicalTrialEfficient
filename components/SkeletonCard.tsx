/** Placeholder shaped like a loaded `.v4-row` — hairline border, 12px radius,
 *  full-width row rather than a grid tile. */
export default function SkeletonCard() {
  return (
    <div
      className="v4-card p-5 sm:p-6 overflow-hidden"
      aria-hidden="true"
    >
      {/* Meta line */}
      <div className="flex items-center" style={{ gap: 12, marginBottom: 8 }}>
        <div className="skeleton-line h-6 w-32" style={{ borderRadius: "var(--radius)" }} />
        <div className="skeleton-line h-4 w-16 rounded" />
        <div className="skeleton-line h-4 w-24 rounded" />
      </div>

      {/* Title */}
      <div className="skeleton-line h-5 w-11/12 rounded" style={{ marginBottom: 10 }} />

      {/* Snippet */}
      <div className="skeleton-line h-4 w-full rounded" style={{ marginBottom: 6, maxWidth: "62ch" }} />
      <div className="skeleton-line h-4 w-4/5 rounded" style={{ maxWidth: "62ch" }} />

      {/* Site line */}
      <div className="skeleton-line h-3 w-64 rounded" style={{ marginTop: 12 }} />
    </div>
  );
}
