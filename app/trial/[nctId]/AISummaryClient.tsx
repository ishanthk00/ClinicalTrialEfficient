"use client";

import { useState, useEffect } from "react";
import { Loader2, Bookmark, ExternalLink } from "lucide-react";
import EligibilitySection from "@/components/EligibilitySection";
import TrialTabs, { type TrialTab } from "@/components/TrialTabs";
import { isBookmarked, toggleBookmark } from "@/lib/bookmark";
import { formatMiles } from "@/lib/distance";
import type { Trial } from "@/lib/clinicaltrials";
import type { AISummary } from "@/lib/summarize";

/* ── shared type styles ── */

const BODY: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1.7,
  color: "var(--text-body)",
  maxWidth: "62ch",
  margin: 0,
};

const NOTE: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.6,
  color: "var(--text-secondary)",
  maxWidth: "62ch",
  margin: 0,
};

/** SCREAMING_SNAKE_CASE → Title Case. */
function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** "DRUG: Pembrolizumab" → "Drug: Pembrolizumab". */
function formatIntervention(raw: string): string {
  const text = raw.trim();
  const split = text.indexOf(":");
  if (split === -1) return text;
  const type = titleCase(text.slice(0, split));
  const name = text.slice(split + 1).trim();
  if (!type) return name;
  if (!name) return type;
  return `${type}: ${name}`;
}

/** Strip an extension and any punctuation so `tel:` dials cleanly. */
function telHref(phone: string): string {
  const [main] = phone.split(/\s*(?:ext\.?|x)\s*/i);
  return `tel:${main.replace(/[^\d+]/g, "")}`;
}

/** One hairline-separated fact row inside the study `<dl>`. */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        paddingBlock: 10,
      }}
    >
      <dt style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</dt>
      <dd style={{ fontSize: 16, color: "var(--text)", margin: 0, overflowWrap: "anywhere" }}>
        {children}
      </dd>
    </div>
  );
}

/** Quiet disclosure for the verbatim protocol text the summaries are drawn from. */
function SourceText({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details style={{ marginTop: 24 }}>
      <summary
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          cursor: "pointer",
          listStyle: "revert",
        }}
      >
        {label}
      </summary>
      <div
        style={{
          marginTop: 12,
          padding: 16,
          borderRadius: "var(--radius)",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          maxHeight: 340,
          overflow: "auto",
        }}
      >
        {children}
      </div>
    </details>
  );
}

const SITES_SHOWN = 8;

export default function AISummaryClient({ trial }: { trial: Trial }) {
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  const [allSites, setAllSites] = useState(false);

  useEffect(() => {
    const cacheKey = `trialfind_summary_${trial.nctId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setSummary(JSON.parse(cached));
        setLoading(false);
        return;
      } catch {
        // fall through to fetch
      }
    }

    fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: trial.title,
        briefSummary: trial.briefSummary,
        eligibilityCriteria: trial.eligibilityCriteria,
        studyType: trial.studyType,
        enrollment: trial.enrollment,
        phases: trial.phases,
        interventions: trial.interventions,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data: AISummary) => {
        setSummary(data);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      })
      .catch(() => setError("Failed to generate summary"))
      .finally(() => setLoading(false));
  }, [trial]);

  useEffect(() => {
    setSaved(isBookmarked(trial.nctId));
  }, [trial.nctId]);

  /* ── action block ── */

  const recordUrl = `https://clinicaltrials.gov/study/${trial.nctId}`;
  const contact = trial.contacts.find((c) => c.email || c.phone) ?? trial.contacts[0];
  const askByEmail = contact?.email
    ? `mailto:${contact.email}?subject=${encodeURIComponent(
        `Question about study ${trial.nctId}`
      )}`
    : undefined;
  const askByPhone = contact?.phone ? telHref(contact.phone) : undefined;
  const askHref = askByEmail ?? askByPhone ?? recordUrl;
  const askIsExternal = askHref === recordUrl;

  /* ── tab 1: what it involves ── */

  const plain = summary?.plainSummary?.trim();
  const involved = summary?.involved?.trim();
  const interventions = (trial.interventions ?? [])
    .map(formatIntervention)
    .filter((i) => i.length > 1);
  const studyTypeLabel = trial.studyType ? titleCase(trial.studyType) : undefined;

  const involvesPanel = (
    <div>
      {plain ? (
        <p style={BODY}>{plain}</p>
      ) : trial.briefSummary ? (
        <p style={BODY}>{trial.briefSummary}</p>
      ) : loading ? (
        <p style={{ ...NOTE, display: "flex", alignItems: "center", gap: 8 }}>
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          Reading the study description&hellip;
        </p>
      ) : (
        <p style={NOTE}>This record does not include a description of the study.</p>
      )}

      {involved && <p style={{ ...BODY, marginTop: 16 }}>{involved}</p>}

      {plain && (
        <p style={{ ...NOTE, marginTop: 12, color: "var(--text-tertiary)" }}>
          Put into plain language from the study record.
        </p>
      )}

      <dl
        className="v4-divide"
        style={{
          margin: "28px 0 0",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        {trial.startDate && <Fact label="Starts">{trial.startDate}</Fact>}
        {trial.enrollment !== undefined && (
          <Fact label="People enrolled">{trial.enrollment.toLocaleString("en-US")}</Fact>
        )}
        {trial.sponsor && <Fact label="Run by">{trial.sponsor}</Fact>}
        {trial.primaryPurpose && <Fact label="Purpose">{titleCase(trial.primaryPurpose)}</Fact>}
        {(studyTypeLabel || interventions.length > 0) && (
          <Fact label="Design">
            {studyTypeLabel}
            {interventions.length > 0 && (
              <span
                style={{
                  display: "block",
                  marginTop: studyTypeLabel ? 4 : 0,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                }}
              >
                {interventions.join(" · ")}
              </span>
            )}
          </Fact>
        )}
        {trial.officialTitle && trial.officialTitle !== trial.title && (
          <Fact label="Official title">{trial.officialTitle}</Fact>
        )}
      </dl>

      {plain && trial.briefSummary && (
        <SourceText label="Read the description exactly as the study wrote it">
          <p style={{ ...BODY, maxWidth: "70ch", color: "var(--text-secondary)" }}>
            {trial.briefSummary}
          </p>
        </SourceText>
      )}
    </div>
  );

  /* ── tab 2: who it is for ── */

  const whoPanel = (
    <div>
      <EligibilitySection summary={summary} loading={loading} error={error} />
      <p style={{ ...NOTE, marginTop: 28 }}>
        These are summaries of the protocol text, not a decision. Plenty of people who read a line
        here and assume they are ruled out turn out to be eligible &mdash; the study team confirms.
      </p>
      {trial.eligibilityCriteria && (
        <SourceText label="Read the eligibility criteria exactly as the protocol states them">
          <p
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              fontSize: 13,
              lineHeight: 1.7,
              color: "var(--text-secondary)",
            }}
          >
            {trial.eligibilityCriteria}
          </p>
        </SourceText>
      )}
    </div>
  );

  /* ── tab 3: where ── */

  const sites = allSites ? trial.locations : trial.locations.slice(0, SITES_SHOWN);
  const hiddenSites = trial.locations.length - sites.length;

  const wherePanel = (
    <div>
      {trial.locations.length === 0 ? (
        <p style={NOTE}>
          This record does not list study sites yet. The study team can tell you where taking part
          would happen.
        </p>
      ) : (
        <ul
          className="v4-divide"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          {sites.map((loc, i) => {
            const place = [loc.city, loc.state, loc.country].filter(Boolean).join(", ");
            const heading = loc.facility ?? place;
            // `distanceKm` is the distance to the *nearest* facility, so it is only
            // truthful against the first row — never repeated down the list.
            const distance =
              i === 0 && trial.distanceKm !== undefined
                ? formatMiles(trial.distanceKm)
                : undefined;
            return (
              <li
                key={`${loc.facility ?? ""}-${place}-${i}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "baseline",
                  gap: 16,
                  paddingBlock: 12,
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: 16,
                      lineHeight: 1.4,
                      color: "var(--text)",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {heading || "Site not named"}
                  </span>
                  {loc.facility && place && (
                    <span
                      style={{
                        display: "block",
                        marginTop: 2,
                        fontSize: 13,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {place}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{distance}</span>
              </li>
            );
          })}
        </ul>
      )}

      {hiddenSites > 0 && (
        <button type="button" className="v4-link-quiet" onClick={() => setAllSites(true)}>
          Show all {trial.locations.length} locations
        </button>
      )}

      <p style={{ ...NOTE, marginTop: 20 }}>
        Many studies cover travel costs to the nearest site. It is a fair question to ask before
        you agree to screening.
        {trial.lastUpdatePostDate ? ` Record last updated ${trial.lastUpdatePostDate}.` : ""}
      </p>
    </div>
  );

  const tabs: TrialTab[] = [
    { id: "involves", label: "What it involves", panel: involvesPanel },
    { id: "who", label: "Who it is for", panel: whoPanel },
    { id: "where", label: "Where", panel: wherePanel },
  ];

  return (
    <div>
      {/* ── Action block ── */}
      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
        <a
          className="v4-btn"
          href={askHref}
          style={{ width: "100%" }}
          {...(askIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          Ask the study team a question
        </a>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button
            type="button"
            className="v4-btn-outline"
            aria-pressed={saved}
            onClick={() => setSaved(toggleBookmark(trial))}
            style={{ flex: "1 1 200px" }}
          >
            <Bookmark
              size={16}
              strokeWidth={2}
              fill={saved ? "currentColor" : "none"}
              aria-hidden="true"
            />
            {saved ? "Saved for later" : "Save for later"}
          </button>

          <a
            className="v4-btn-outline"
            href={recordUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: "1 1 200px" }}
          >
            Full record
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>

        <p style={{ ...NOTE, marginTop: 4 }}>
          Asking a question is not a commitment. A coordinator answers by phone or email, and you
          can stop at any point.
        </p>

        {contact && (contact.name || contact.phone || contact.email) && (
          <p style={NOTE}>
            {contact.name && <span>{contact.name}</span>}
            {contact.name && (contact.phone || contact.email) && <span> &middot; </span>}
            {contact.phone && <a href={telHref(contact.phone)}>{contact.phone}</a>}
            {contact.phone && contact.email && <span> &middot; </span>}
            {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
          </p>
        )}
      </div>

      {/* ── Tabbed detail ── */}
      <div style={{ marginTop: 40 }}>
        <TrialTabs tabs={tabs} label="About this study" />
      </div>
    </div>
  );
}
