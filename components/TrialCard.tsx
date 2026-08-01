"use client";

import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import type { Trial } from "@/lib/clinicaltrials";
import StatusBadge from "./StatusBadge";
import BookmarkButton from "./BookmarkButton";

function getFirstLocation(trial: Trial): string {
  const loc = trial.locations[0];
  if (!loc) return "";
  return [loc.city, loc.state, loc.country].filter(Boolean).join(", ");
}

function getSnippet(text?: string): string {
  if (!text) return "";
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, 2).join(" ").slice(0, 240);
}

export default function TrialCard({ trial, index = 0 }: { trial: Trial; index?: number }) {
  const location = getFirstLocation(trial);
  const snippet = getSnippet(trial.briefSummary);
  const extraLocations = trial.locations.length > 1 ? `+${trial.locations.length - 1} more` : null;
  const delay = `${Math.min(index, 9) * 45}ms`;
  const distanceMi =
    trial.distanceKm !== undefined
      ? trial.distanceKm / 1.60934
      : undefined;
  const distanceLabel =
    distanceMi !== undefined
      ? distanceMi < 10
        ? `${distanceMi.toFixed(1)} mi`
        : `${Math.round(distanceMi)} mi`
      : undefined;

  return (
    <Link href={`/trial/${trial.nctId}`} className="block group">
      <div
        className="
          card-anim
          bg-white dark:bg-[#111118]
          border border-[#E5E7EB] dark:border-[#222232]
          rounded-2xl p-5 shadow-sm
          hover:shadow-md hover:border-[#2563EB]/30 dark:hover:border-[#5B9BFF]/30
          hover:-translate-y-[3px]
          dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.7)]
          transition-[transform,box-shadow,border-color] duration-200 ease-out
        "
        style={{ animationDelay: delay }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={trial.status} />
            {trial.phases.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] dark:bg-[#0B1828] text-[#2563EB] dark:text-[#5B9BFF] border border-[#DBEAFE] dark:border-[#0B1828]">
                {trial.phases.join(" / ")}
              </span>
            )}
          </div>
          <BookmarkButton trial={trial} />
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-[#111827] dark:text-[#EAEAF5] leading-snug line-clamp-2 mb-2 group-hover:text-[#2563EB] dark:group-hover:text-[#5B9BFF] transition-colors">
          {trial.title}
        </h3>

        {/* Snippet */}
        {snippet && (
          <p className="text-sm text-[#6B7280] dark:text-[#8686A8] line-clamp-2 mb-3 leading-relaxed">
            {snippet}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F3F4F6] dark:border-[#191924]">
          <div className="flex items-center gap-2 min-w-0">
            {location ? (
              <span className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#8686A8] min-w-0">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{location}</span>
                {extraLocations && (
                  <span className="shrink-0 text-[#9CA3AF] dark:text-[#44445E]">{extraLocations}</span>
                )}
              </span>
            ) : (
              <span className="text-xs text-[#9CA3AF] dark:text-[#44445E]">Multiple locations</span>
            )}
            {distanceLabel && (
              <span
                className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{
                  background: "var(--accent-bg)",
                  color: "var(--accent)",
                  border: "1px solid var(--border)",
                }}
                title="Distance to the nearest study site"
              >
                {distanceLabel}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 shrink-0 text-xs font-medium text-[#2563EB] dark:text-[#5B9BFF] opacity-0 group-hover:opacity-100 transition-opacity">
            View details
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
