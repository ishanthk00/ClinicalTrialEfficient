"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { isBookmarked, toggleBookmark } from "@/lib/bookmark";
import type { Trial } from "@/lib/clinicaltrials";

export default function BookmarkButton({
  trial,
  size = "sm",
}: {
  trial: Trial;
  size?: "sm" | "md";
}) {
  const [saved, setSaved] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(trial.nctId));
  }, [trial.nctId]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved(toggleBookmark(trial));
    setBouncing(true);
  }

  const iconSize = size === "md" ? 18 : 15;
  const btnSize = size === "md" ? "p-2" : "p-1.5";

  return (
    <button
      onClick={handleClick}
      onAnimationEnd={() => setBouncing(false)}
      aria-label={saved ? "Remove bookmark" : "Bookmark this trial"}
      aria-pressed={saved}
      className={`${btnSize} border transition-[background-color,border-color,color] duration-200 ease-out ${bouncing ? "bookmark-pop" : ""}`}
      style={{
        borderRadius: "var(--radius)",
        background: saved ? "var(--accent)" : "var(--bg-elevated)",
        borderColor: saved ? "var(--accent)" : "var(--border)",
        color: saved ? "#FFFFFF" : "var(--text-secondary)",
      }}
    >
      {/* Cross-fade between outline and filled — avoids hard swap */}
      <span className="relative block" style={{ width: iconSize, height: iconSize }}>
        <Bookmark
          size={iconSize}
          fill="none"
          strokeWidth={2}
          className="absolute inset-0 transition-opacity duration-200"
          style={{ opacity: saved ? 0 : 1 }}
          aria-hidden="true"
        />
        <Bookmark
          size={iconSize}
          fill="currentColor"
          strokeWidth={2}
          className="absolute inset-0 transition-opacity duration-200"
          style={{ opacity: saved ? 1 : 0 }}
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
