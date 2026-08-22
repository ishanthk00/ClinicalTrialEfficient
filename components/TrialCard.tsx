"use client";

import Link from "next/link";
import type { Trial } from "@/lib/clinicaltrials";
import StatusBadge from "./StatusBadge";
import BookmarkButton from "./BookmarkButton";

/** "Boston, Massachusetts" — the country is dropped when a state is present
 *  so the line stays short without assuming any one country. */
function formatPlace(trial: Trial): string {
  const loc = trial.locations[0];
  if (!loc) return "";
  const region = loc.state || loc.country;
  return [loc.city, region].filter(Boolean).join(", ");
}

function getSnippet(text?: string): string {
  if (!text) return "";
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, 2).join(" ").slice(0, 240);
}

export default function TrialCard({ trial, index = 0 }: { trial: Trial; index?: number }) {
  const place = formatPlace(trial);
  const facility = trial.locations[0]?.facility?.trim();
  const snippet = getSnippet(trial.briefSummary);
  const delay = `${Math.min(index, 9) * 45}ms`;

  // "Massachusetts General Hospital · Boston, Massachusetts and 3 other sites"
  const head = [facility, place].filter(Boolean).join(" · ");
  const otherSites = Math.max(trial.locations.length - 1, 0);
  const siteLine = head
    ? otherSites > 0
      ? `${head} and ${otherSites} other site${otherSites === 1 ? "" : "s"}`
      : head
    : "";

  const distanceMi =
    trial.distanceKm !== undefined ? trial.distanceKm / 1.60934 : undefined;
  const distanceLabel =
    distanceMi !== undefined
      ? distanceMi < 10
        ? `${distanceMi.toFixed(1)} mi`
        : `${Math.round(distanceMi)} mi`
      : undefined;

  // Right-hand meta: distance when we know it, otherwise how many sites there are.
  const siteCount = trial.locations.length;
  const rightMeta = distanceLabel
    ? `${distanceLabel} · to the nearest site`
    : siteCount > 0
      ? `${siteCount} · site${siteCount === 1 ? "" : "s"}`
      : "";

  return (
    <div
      className="v4-row card-anim relative p-5 sm:p-6"
      style={{ animationDelay: delay }}
    >
      {/* Whole-row link. Kept as an overlay sibling so the bookmark <button>
          never nests inside an <a>. */}
      <Link
        href={`/trial/${trial.nctId}`}
        aria-label={trial.title}
        className="absolute inset-0"
        style={{ borderRadius: "inherit" }}
      />

      {/* Meta line */}
      <div
        className="flex flex-wrap items-center"
        style={{ gap: 12, marginBottom: 8 }}
      >
        <StatusBadge status={trial.status} />

        {trial.phases.length > 0 && (
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {trial.phases.join(" and ")}
          </span>
        )}

        <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
          {trial.nctId}
        </span>

        <span
          className="flex items-center"
          style={{ gap: 12, marginLeft: "auto" }}
        >
          {rightMeta && (
            <span
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                whiteSpace: "nowrap",
              }}
            >
              {rightMeta}
            </span>
          )}
          {/* Lifted above the link overlay so it stays clickable. */}
          <span className="relative z-10">
            <BookmarkButton trial={trial} />
          </span>
        </span>
      </div>

      {/* Title */}
      <h3
        className="line-clamp-2"
        style={{
          fontSize: 20,
          fontWeight: 500,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          marginBottom: 8,
          color: "var(--text)",
        }}
      >
        {trial.title}
      </h3>

      {/* Plain-language snippet */}
      {snippet && (
        <p
          className="line-clamp-2"
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            maxWidth: "62ch",
          }}
        >
          {snippet}
        </p>
      )}

      {/* Where it runs */}
      {siteLine && (
        <p
          style={{
            marginTop: 12,
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          {siteLine}
        </p>
      )}
    </div>
  );
}
