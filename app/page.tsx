"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import AIAgent from "@/components/AIAgent";
import PersonalizedTrials from "@/components/PersonalizedTrials";
import StatCounter from "@/components/StatCounter";
import type { Trial } from "@/lib/clinicaltrials";

/** The three-step explainer in the hero card. */
const HERO_STEPS: { title: string; note: string }[] = [
  {
    title: "Tell us the basics",
    note: "Condition, location, age. About two minutes, and every question maps to a real eligibility rule.",
  },
  {
    title: "Read your matches",
    note: "What is being tested, where it happens, and what taking part asks of you — in plain language.",
  },
  {
    title: "Decide at your own pace",
    note: "Save studies, bring them to your own doctor, or ask a coordinator a question first.",
  },
];

/** Chip label + the term actually sent to ClinicalTrials.gov. */
const POPULAR_CONDITIONS: { label: string; query: string }[] = [
  { label: "Alzheimer's disease",   query: "Alzheimer's disease" },
  { label: "Type 2 diabetes",       query: "Type 2 diabetes" },
  { label: "Breast cancer",         query: "Breast cancer" },
  { label: "Depression",            query: "Depression" },
  { label: "Parkinson's disease",   query: "Parkinson's disease" },
  { label: "Heart failure",         query: "Heart failure" },
  { label: "Rheumatoid arthritis",  query: "Rheumatoid arthritis" },
  { label: "Healthy volunteer",     query: "Healthy Volunteers" },
];

const PARTNERS = [
  "Providence Health Care",
  "Ted Rogers Centre",
  "Arthritis Society",
  "Lupus Foundation",
  "Diabetes Canada",
];

const YOU_TELL_US: { label: string; note: string }[] = [
  { label: "Your condition", note: "Diagnosis or symptoms" },
  { label: "Where you are",  note: "How far you can travel" },
  { label: "Age",            note: "Most criteria use it" },
  { label: "Health history", note: "Optional" },
];

const WE_READ: { label: string; note: string }[] = [
  { label: "Eligibility rules",  note: "Criterion by criterion" },
  { label: "Study locations",    note: "Every active site" },
  { label: "What is involved",   note: "Visits, drug, schedule" },
  { label: "Enrollment window",  note: "Open, closing, closed" },
];

/** Shared inline styles for the small reassurance lines. */
const smallNote = {
  fontSize: "var(--fs-small)",
  lineHeight: 1.6,
  color: "var(--text-secondary)",
} as const;

const bodyNote = {
  fontSize: "var(--fs-body)",
  lineHeight: 1.6,
  color: "var(--text-secondary)",
} as const;

export default function HomePage() {
  const [personalizedTrials, setPersonalizedTrials] = useState<Trial[]>([]);
  const [personalizedCondition, setPersonalizedCondition] = useState("");
  const [condition, setCondition] = useState("");

  function handleTrialsFound(trials: Trial[], found: string) {
    setPersonalizedTrials(trials);
    setPersonalizedCondition(found);
  }

  const normalized = condition.trim().toLowerCase();

  return (
    <>
      <main>
        {/* ═══ 1 · Hero ═══ */}
        <section id="top" className="band-sky" style={{ scrollMarginTop: 24 }}>
          <div
            className="shell grid12"
            style={{ paddingTop: "clamp(56px, 7vw, 88px)", paddingBottom: 120 }}
          >
            {/* Left — the promise */}
            <div className="anim-fade-up" style={{ gridColumn: "1 / span 7" }}>
              <span className="overline">Patient-first · Clinical trial search</span>

              <h1
                style={{
                  marginTop: 20,
                  fontSize: "var(--fs-display)",
                  fontWeight: 500,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  maxWidth: "22ch",
                  color: "var(--text)",
                }}
              >
                Find trials that match you, in plain English.
              </h1>

              <p className="lede" style={{ marginTop: 24 }}>
                Search over 500,000 studies from ClinicalTrials.gov. We translate the medical
                language — the eligibility criteria, the phases, what taking part actually
                involves — so you can focus on the decision instead of the paperwork.
              </p>

              <div className="flex flex-wrap" style={{ marginTop: 32, gap: 16 }}>
                <a href="#find" className="v4-btn">Browse trials</a>
                <a href="#mission" className="v4-btn-outline">How it works</a>
              </div>

              <p style={{ ...smallNote, marginTop: 20 }}>
                Free · No account needed · Nothing is sent to a study until you decide
              </p>
            </div>

            {/* Right — what to expect */}
            <div
              className="v4-card anim-fade-up anim-delay-2"
              style={{
                gridColumn: "9 / span 4",
                alignSelf: "center",
                padding: "clamp(24px, 2.5vw, 32px)",
              }}
            >
              <span className="overline overline-purple">What to expect</span>

              <div style={{ marginTop: 20 }}>
                {HERO_STEPS.map((step, i) => (
                  <div
                    key={step.title}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "32px 1fr",
                      gap: 16,
                      paddingBlock: 12,
                      borderTop: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{ fontSize: "var(--fs-body)", fontWeight: 500, color: "var(--purple)" }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p style={{ fontSize: "var(--fs-body)", fontWeight: 500 }}>{step.title}</p>
                      <p style={{ ...smallNote, marginTop: 4 }}>{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ ...smallNote, marginTop: 16 }}>
                You can stop at any point, including after screening. Talking to a study team is
                not a commitment.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ 2 · Search panel — lifts out of the sky band ═══ */}
        <section
          id="find"
          className="shell -mt-8 md:-mt-16"
          style={{ position: "relative", zIndex: 2, scrollMarginTop: 24 }}
        >
          <div className="v4-card" style={{ padding: "clamp(24px, 3.2vw, 40px)" }}>
            <div className="grid12">
              <div style={{ gridColumn: "1 / span 4" }}>
                <h2 style={{ fontSize: "var(--fs-h3)", fontWeight: 500, lineHeight: 1.2 }}>
                  What are you living with?
                </h2>
                <p style={{ ...bodyNote, marginTop: 16, maxWidth: "42ch" }}>
                  Tell us the condition and roughly where you are. We will show nearby studies
                  that may help — including studies looking for healthy volunteers.
                </p>
              </div>

              <div style={{ gridColumn: "6 / span 7" }}>
                <span className="overline overline-muted">Popular searches</span>

                <div className="flex flex-wrap" style={{ marginTop: 16, marginBottom: 32, gap: 8 }}>
                  {POPULAR_CONDITIONS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      className="v4-chip v4-chip-lg"
                      aria-pressed={normalized === c.query.toLowerCase()}
                      onClick={() => setCondition(c.query)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <SearchBar condition={condition} onConditionChange={setCondition} />

                <p style={{ ...smallNote, marginTop: 20, maxWidth: "62ch" }}>
                  You can change any answer later, and nothing you type here is saved to a
                  profile. Data comes from{" "}
                  <a
                    href="https://clinicaltrials.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "underline", textUnderlineOffset: 3 }}
                  >
                    ClinicalTrials.gov
                  </a>
                  ; always talk with your own provider before enrolling.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 3 · Partners ═══ */}
        <section
          className="shell flex flex-wrap items-baseline"
          style={{ paddingTop: 48, gap: 40 }}
        >
          <p style={{ ...smallNote, maxWidth: "32ch" }}>
            Used and supported by health systems and patient advocacy groups
          </p>
          <div className="flex flex-wrap" style={{ gap: 32 }}>
            {PARTNERS.map((name) => (
              <span
                key={name}
                style={{
                  fontSize: "var(--fs-body)",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </section>

        {/* ═══ 4 · Numbers — deliberately staggered ═══ */}
        <section id="numbers">
          <div className="shell grid12" style={{ paddingTop: 80, paddingBottom: 96 }}>
            <div
              style={{
                gridColumn: "1 / span 5",
                borderTop: "1px solid var(--border-strong)",
                paddingTop: 20,
              }}
            >
              <p
                style={{
                  fontSize: "var(--fs-display)",
                  fontWeight: 500,
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  color: "var(--text)",
                }}
              >
                <StatCounter end={500000} />
              </p>
              <p style={{ marginTop: 12, fontSize: "var(--fs-body)", fontWeight: 500 }}>
                Studies you can search
              </p>
              <p style={{ ...bodyNote, marginTop: 8, maxWidth: "44ch" }}>
                Every interventional and observational record on ClinicalTrials.gov, read at the
                moment you search.
              </p>
            </div>

            <div
              style={{
                gridColumn: "7 / span 3",
                marginTop: 48,
                borderTop: "1px solid var(--border-strong)",
                paddingTop: 20,
              }}
            >
              <p style={{ fontSize: "var(--fs-h3)", fontWeight: 500, lineHeight: 1.15 }}>
                About 2 minutes
              </p>
              <p style={{ marginTop: 12, fontSize: "var(--fs-body)", fontWeight: 500 }}>
                To a shortlist
              </p>
              <p style={{ ...bodyNote, marginTop: 8, maxWidth: "34ch" }}>
                Every question maps to a real eligibility rule, so nothing is asked without a
                reason.
              </p>
            </div>

            <div
              style={{
                gridColumn: "10 / span 3",
                marginTop: 112,
                borderTop: "1px solid var(--border-strong)",
                paddingTop: 20,
              }}
            >
              <p style={{ fontSize: "var(--fs-h4)", fontWeight: 500, lineHeight: 1.2 }}>
                Plain language
              </p>
              <p style={{ marginTop: 12, fontSize: "var(--fs-body)", fontWeight: 500 }}>
                On every criterion
              </p>
              <p style={{ ...bodyNote, marginTop: 8, maxWidth: "30ch" }}>
                Written the way a coordinator would explain it out loud.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ 5 · Mission ═══ */}
        <section id="mission" className="band-purple" style={{ scrollMarginTop: 24 }}>
          <div className="shell grid12" style={{ paddingBlock: 88 }}>
            <div
              style={{
                gridColumn: "1 / span 5",
                position: "relative",
                minHeight: 440,
                borderRadius: "var(--radius)",
                overflow: "hidden",
              }}
            >
              <Image
                src="/clinical-trials.webp"
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
                className="object-cover"
              />
            </div>

            <div style={{ gridColumn: "7 / span 6", alignSelf: "center" }}>
              <h2
                style={{
                  fontSize: "var(--fs-h2)",
                  fontWeight: 500,
                  lineHeight: 1.15,
                  maxWidth: "26ch",
                  color: "var(--text)",
                }}
              >
                You deserve to feel informed, not rushed.
              </h2>

              <p className="lede" style={{ marginTop: 24 }}>
                People usually start looking for a trial at the hardest possible moment. Even with
                a supportive clinical team, piecing the options together tends to fall to the
                patient or a family member.
              </p>

              <p
                style={{
                  marginTop: 20,
                  fontSize: "var(--fs-body)",
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                  maxWidth: "62ch",
                }}
              >
                So we kept this quiet and specific: no urgency banners, no countdowns, no promises
                about outcomes. Just the studies that may fit, what each one asks of you, and a
                clear way to ask questions before you decide anything.
              </p>

              <div
                style={{
                  marginTop: 32,
                  paddingTop: 24,
                  borderTop: "1px solid var(--border-strong)",
                }}
              >
                <span className="overline overline-purple">Choose your path forward</span>

                <div className="flex flex-wrap" style={{ marginTop: 16, gap: 16 }}>
                  <Link href="/results" className="v4-btn">Explore trials on your own</Link>
                  <a href="mailto:hello@trialfind.org" className="v4-btn-outline">
                    Talk with someone
                  </a>
                </div>

                <p style={{ ...smallNote, marginTop: 16 }}>
                  Both are welcome — a free conversation costs you nothing and commits you to
                  nothing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 6 · Matching ═══ */}
        <section id="matching" style={{ scrollMarginTop: 24 }}>
          <div className="shell grid12" style={{ paddingBlock: 96 }}>
            <div style={{ gridColumn: "1 / span 5" }}>
              <span className="overline">How matching works</span>
              <h2
                style={{
                  marginTop: 20,
                  fontSize: "var(--fs-h2)",
                  fontWeight: 500,
                  lineHeight: 1.15,
                  maxWidth: "22ch",
                  color: "var(--text)",
                }}
              >
                Two lists, compared honestly.
              </h2>
              <p
                style={{
                  marginTop: 20,
                  fontSize: "var(--fs-body)",
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                  maxWidth: "46ch",
                }}
              >
                We read what you tell us against what each protocol requires, then show you which
                criteria matched and which are still open questions. A match is a starting point
                for a conversation, not a decision — and never a prediction about whether a
                treatment will work.
              </p>
            </div>

            <div
              className="v4-card"
              style={{ gridColumn: "7 / span 3", padding: "clamp(20px, 2.2vw, 28px)" }}
            >
              <h3 style={{ fontSize: "var(--fs-h5)", fontWeight: 500 }}>What you tell us</h3>
              <div className="v4-divide" style={{ marginTop: 12 }}>
                {YOU_TELL_US.map((row) => (
                  <div key={row.label} style={{ paddingBlock: 12 }}>
                    <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.4 }}>{row.label}</p>
                    <p style={{ ...smallNote, lineHeight: 1.5, marginTop: 2 }}>{row.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="v4-card"
              style={{ gridColumn: "10 / span 3", padding: "clamp(20px, 2.2vw, 28px)" }}
            >
              <h3 style={{ fontSize: "var(--fs-h5)", fontWeight: 500 }}>What we read</h3>
              <div className="v4-divide" style={{ marginTop: 12 }}>
                {WE_READ.map((row) => (
                  <div key={row.label} style={{ paddingBlock: 12 }}>
                    <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.4 }}>{row.label}</p>
                    <p style={{ ...smallNote, lineHeight: 1.5, marginTop: 2 }}>{row.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Results surfaced by the AI agent — scrolls itself into view when filled. */}
      {personalizedTrials.length > 0 && (
        <PersonalizedTrials trials={personalizedTrials} condition={personalizedCondition} />
      )}

      <AIAgent onTrialsFound={handleTrialsFound} />
    </>
  );
}
