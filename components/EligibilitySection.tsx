"use client";

import { Loader2 } from "lucide-react";
import type { AISummary } from "@/lib/summarize";

interface Props {
  summary: AISummary | null;
  loading: boolean;
  error?: string;
}

const NOTE: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.6,
  color: "var(--text-secondary)",
  maxWidth: "62ch",
  margin: 0,
};

const HEADING: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  lineHeight: 1.4,
  margin: 0,
};

const ROW: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "20px 1fr",
  gap: 12,
  paddingBlock: 10,
  borderTop: "1px solid var(--border-subtle)",
};

const LIST: React.CSSProperties = {
  listStyle: "none",
  margin: "8px 0 0",
  padding: 0,
};

/** Thin check — the v4 mark for an inclusion criterion. */
function CheckMark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ marginTop: 5 }}
    >
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

/** Thin minus — the v4 mark for an exclusion criterion. Quiet, never red. */
function MinusMark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--text-tertiary)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ marginTop: 5 }}
    >
      <path d="M5 12h14" />
    </svg>
  );
}

export default function EligibilitySection({ summary, loading, error }: Props) {
  if (loading) {
    return (
      <p style={{ ...NOTE, display: "flex", alignItems: "center", gap: 8 }}>
        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
        Reading this study&rsquo;s eligibility criteria&hellip;
      </p>
    );
  }

  if (error) {
    return (
      <p style={NOTE}>
        We could not put this study&rsquo;s eligibility criteria into plain language. The full
        criteria are on the study record.
      </p>
    );
  }

  if (!summary || (summary.qualify.length === 0 && summary.notQualify.length === 0)) {
    return (
      <p style={NOTE}>
        This record does not list eligibility criteria in a form we can summarise. The study team
        can tell you who they are looking for.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {summary.qualify.length > 0 && (
        <section>
          <h3 style={{ ...HEADING, color: "var(--text)" }}>You may qualify if</h3>
          <ul style={LIST}>
            {summary.qualify.map((item, i) => (
              <li key={i} style={ROW}>
                <CheckMark />
                <span
                  style={{
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "var(--text-body)",
                    maxWidth: "62ch",
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {summary.notQualify.length > 0 && (
        <section>
          <h3 style={{ ...HEADING, color: "var(--text-secondary)" }}>
            This study may not be a fit if
          </h3>
          <ul style={LIST}>
            {summary.notQualify.map((item, i) => (
              <li key={i} style={ROW}>
                <MinusMark />
                <span
                  style={{
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: "var(--text-secondary)",
                    maxWidth: "62ch",
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
