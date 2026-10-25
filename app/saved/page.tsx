"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getBookmarks,
  subscribeBookmarks,
  syncBookmarksWithBackend,
} from "@/lib/bookmark";
import TrialCard from "@/components/TrialCard";
import type { Trial } from "@/lib/clinicaltrials";

export default function SavedPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTrials(getBookmarks());
    setLoaded(true);

    void syncBookmarksWithBackend().then((synced) => {
      setTrials(synced);
    });

    return subscribeBookmarks(() => {
      setTrials(getBookmarks());
    });
  }, []);

  return (
    <main className="shell" style={{ paddingTop: 64, paddingBottom: 96 }}>
      <span className="overline" style={{ marginBottom: 12 }}>
        Saved trials
      </span>

      <h1
        style={{
          margin: 0,
          fontSize: "var(--fs-h3)",
          fontWeight: 500,
          lineHeight: 1.15,
          letterSpacing: "-0.015em",
        }}
      >
        Studies you set aside
      </h1>

      <p
        className="measure"
        style={{
          margin: "12px 0 0",
          fontSize: "var(--fs-body)",
          lineHeight: 1.6,
          color: "var(--text-secondary)",
        }}
      >
        Saved studies stay in this browser only — nothing is sent to a study team
        and nothing is tied to an account. Bring them to your own doctor, or come
        back to them whenever you are ready.
      </p>

      {!loaded ? (
        <div
          className="flex flex-col gap-3"
          style={{ marginTop: 32 }}
          aria-hidden="true"
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              className="v4-card"
              style={{ padding: 24, display: "grid", gap: 12 }}
            >
              <div className="skeleton-line" style={{ height: 13, width: "34%", borderRadius: 4 }} />
              <div className="skeleton-line" style={{ height: 20, width: "76%", borderRadius: 4 }} />
              <div className="skeleton-line" style={{ height: 16, width: "58%", borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : trials.length === 0 ? (
        <div className="v4-card" style={{ marginTop: 32, padding: 40 }}>
          <h2 style={{ margin: 0, fontSize: "var(--fs-h5)", fontWeight: 500 }}>
            Nothing saved yet
          </h2>
          <p
            className="measure"
            style={{
              margin: "8px 0 24px",
              fontSize: "var(--fs-body)",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
            }}
          >
            When a study looks worth a second read, save it from the results list.
            There is no rush, and saving one commits you to nothing.
          </p>
          <Link href="/results" className="v4-btn">
            Browse trials
          </Link>
        </div>
      ) : (
        <>
          <p
            style={{
              margin: "32px 0 16px",
              fontSize: "var(--fs-small)",
              color: "var(--text-secondary)",
            }}
          >
            {trials.length} {trials.length === 1 ? "study" : "studies"} saved
          </p>
          <div className="flex flex-col gap-3">
            {trials.map((trial, index) => (
              <TrialCard key={trial.nctId} trial={trial} index={index} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
