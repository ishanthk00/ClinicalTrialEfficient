import Link from "next/link";

export const metadata = {
  title: "About — TrialFind",
  description: "Learn how TrialFind makes clinical trial search accessible to everyone.",
};

const STATS = [
  {
    value: "500,000+",
    label: "Studies you can search",
    sub: "Every interventional and observational record on ClinicalTrials.gov, read at the moment you search.",
    span: "1 / span 5",
    size: "var(--fs-display)",
    top: 0,
    measure: "44ch",
  },
  {
    value: "About 2 minutes",
    label: "To a shortlist",
    sub: "Every question maps to a real eligibility rule, so nothing is asked without a reason.",
    span: "7 / span 3",
    size: "var(--fs-h3)",
    top: 48,
    measure: "34ch",
  },
  {
    value: "Plain language",
    label: "On every criterion",
    sub: "Written the way a coordinator would explain it out loud.",
    span: "10 / span 3",
    size: "var(--fs-h4)",
    top: 112,
    measure: "30ch",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Search",
    body: "Type a condition, drug or trial ID in plain language. TrialFind queries the full ClinicalTrials.gov database live — no stale snapshots.",
  },
  {
    n: "2",
    title: "Understand",
    body: "Eligibility criteria, protocol language and study design are translated into plain English, so you know what you are actually looking at.",
  },
  {
    n: "3",
    title: "Decide",
    body: "Full contact details, every study site, and a direct link to the official record. The next step is yours to take, at your own pace.",
  },
];

const SOURCES = [
  {
    title: "ClinicalTrials.gov",
    body: "The world's largest clinical trial registry, maintained by the U.S. National Library of Medicine. Over 500,000 studies from 221 countries.",
  },
  {
    title: "Claude AI",
    body: "Plain-language summaries are generated on demand by Claude (Anthropic) from the registry text. Summaries are informational — always verify eligibility with the study team.",
  },
  {
    title: "No account required",
    body: "TrialFind stores nothing server-side about you. Saved studies live in your browser only. No signup, no tracking.",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="band-sky">
        <div className="shell grid12" style={{ paddingTop: 88, paddingBottom: 96 }}>
          <div style={{ gridColumn: "1 / span 7" }}>
            <span className="overline" style={{ marginBottom: 16 }}>
              Our mission
            </span>
            <h1
              style={{
                margin: 0,
                fontSize: "var(--fs-display)",
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                maxWidth: "22ch",
              }}
            >
              Making clinical research navigable.
            </h1>
            <p className="lede" style={{ margin: "24px 0 0" }}>
              Clinical trials drive medical breakthroughs — but finding one, let
              alone understanding whether you qualify, has always meant working
              through dense medical language at the hardest possible moment.
            </p>
            <p
              className="measure"
              style={{
                margin: "20px 0 0",
                fontSize: "var(--fs-body)",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              TrialFind sits between the raw registry and the people who need it —
              translating, filtering and surfacing what matters, without urgency
              banners or promises about outcomes.
            </p>
          </div>

          <div
            className="v4-card"
            style={{ gridColumn: "9 / span 4", alignSelf: "center", padding: 32 }}
          >
            <span className="overline overline-purple" style={{ marginBottom: 16 }}>
              How it works
            </span>
            <div className="v4-divide">
              {STEPS.map((step) => (
                <div
                  key={step.n}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr",
                    gap: 16,
                    padding: "12px 0",
                  }}
                >
                  <span style={{ fontSize: "var(--fs-body)", fontWeight: 500, color: "var(--purple)" }}>
                    {step.n}
                  </span>
                  <span>
                    <span style={{ display: "block", fontSize: "var(--fs-body)", fontWeight: 500 }}>
                      {step.title}
                    </span>
                    <span
                      className="measure"
                      style={{
                        display: "block",
                        fontSize: "var(--fs-small)",
                        lineHeight: 1.6,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {step.body}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Numbers ──────────────────────────────────────── */}
      <section className="shell grid12" style={{ paddingTop: 80, paddingBottom: 96 }}>
        {STATS.map((s) => (
          <div
            key={s.label}
            style={{
              gridColumn: s.span,
              marginTop: s.top,
              borderTop: "1px solid var(--border-strong)",
              paddingTop: 20,
            }}
          >
            <div
              style={{
                fontSize: s.size,
                fontWeight: 500,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {s.value}
            </div>
            <div style={{ marginTop: 8, fontSize: "var(--fs-body)", fontWeight: 500 }}>
              {s.label}
            </div>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "var(--fs-body)",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                maxWidth: s.measure,
              }}
            >
              {s.sub}
            </p>
          </div>
        ))}
      </section>

      {/* ─── The problem ──────────────────────────────────── */}
      <section className="band-purple">
        <div className="shell grid12" style={{ paddingTop: 88, paddingBottom: 88 }}>
          <div style={{ gridColumn: "1 / span 5" }}>
            <span className="overline overline-purple" style={{ marginBottom: 12 }}>
              The problem
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: "var(--fs-h2)",
                fontWeight: 500,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                maxWidth: "22ch",
              }}
            >
              The information exists. The access doesn&apos;t.
            </h2>
          </div>
          <div style={{ gridColumn: "7 / span 6", alignSelf: "center" }}>
            <p className="lede" style={{ margin: 0 }}>
              ClinicalTrials.gov holds records for over half a million studies. But
              its search is built for researchers, not for patients or the people
              caring for them.
            </p>
            <p
              className="measure"
              style={{
                margin: "20px 0 0",
                fontSize: "var(--fs-body)",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
              }}
            >
              Eligibility criteria are written as dense inclusion and exclusion
              lists. Phase numbers, interventional designs and NCT identifiers mean
              nothing to most people. The result is that patients who might qualify
              for a study that changes their outcome simply never find it — while
              studies that need participants struggle to reach enrollment.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Sources ──────────────────────────────────────── */}
      <section className="shell grid12" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div style={{ gridColumn: "1 / span 5" }}>
          <span className="overline" style={{ marginBottom: 12 }}>
            Data &amp; technology
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: "var(--fs-h2)",
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: "22ch",
            }}
          >
            Built on primary sources.
          </h2>
          <p
            style={{
              margin: "20px 0 0",
              fontSize: "var(--fs-body)",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              maxWidth: "46ch",
            }}
          >
            Every study page links back to the official record so you can check
            anything we show you against the source.
          </p>
        </div>

        {SOURCES.map((item, i) => (
          <div
            key={item.title}
            className="v4-card"
            style={{ gridColumn: i === 0 ? "7 / span 3" : i === 1 ? "10 / span 3" : "7 / span 6", padding: 28, marginTop: i === 2 ? 24 : 0 }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: "var(--fs-h5)", fontWeight: 500 }}>
              {item.title}
            </h3>
            <p
              className="measure"
              style={{
                margin: 0,
                fontSize: "var(--fs-body)",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
              }}
            >
              {item.body}
            </p>
          </div>
        ))}
      </section>

      {/* ─── Closing ──────────────────────────────────────── */}
      <section className="band-sky">
        <div className="shell" style={{ paddingTop: 88, paddingBottom: 96 }}>
          <h2
            style={{
              margin: 0,
              fontSize: "var(--fs-h2)",
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: "22ch",
            }}
          >
            Ready when you are.
          </h2>
          <p className="lede" style={{ margin: "20px 0 0" }}>
            Search 500,000+ studies from ClinicalTrials.gov, with the eligibility
            criteria explained before you ever pick up the phone.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 32 }}>
            <Link href="/results" className="v4-btn">
              Browse trials
            </Link>
            <a href="mailto:hello@trialfind.org" className="v4-btn-outline">
              Talk with someone
            </a>
          </div>
          <p
            className="measure"
            style={{
              margin: "16px 0 0",
              fontSize: "var(--fs-small)",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
            }}
          >
            TrialFind helps you find and understand studies — it does not determine
            your eligibility. Final eligibility is assessed by the study team at each
            site. Always consult a qualified healthcare provider before enrolling.
          </p>
        </div>
      </section>
    </main>
  );
}
