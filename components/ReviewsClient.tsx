"use client";

import { useId, useMemo, useState } from "react";
import Stars, { STAR_PATH } from "@/components/Stars";

type ReviewerRole = "Patient" | "Caregiver" | "Clinician";

type Review = {
  id: string;
  name: string;
  role: ReviewerRole;
  rating: number;
  /** Human-readable publication date. */
  date: string;
  /** Days since publication — the sort key for "Most recent". */
  days: number;
  meta: string;
  headline: string;
  body: string;
  tags: string[];
  helpfulCount: number;
  reply?: string;
};

/**
 * ⚠️ PLACEHOLDER CONTENT — NOT REAL REVIEWS.
 *
 * Every entry below is sample copy authored in the design mockup
 * ("TrialFind Reviews.dc.html") to show the page layout. The names, dates,
 * ratings, quotes and "Response from TrialFind" replies are invented; none of
 * it came from an actual user.
 *
 * This array MUST be replaced with real, verified reviews before this page is
 * shown to users. Publishing this copy as-is would present fabricated
 * testimonials — including fabricated clinician endorsements — as genuine.
 */
const REVIEWS: Review[] = [
  {
    id: "marguerite-d",
    name: "Marguerite D.",
    role: "Caregiver",
    rating: 5,
    date: "August 12, 2026",
    days: 10,
    meta: "Caregiver · searching for a parent",
    headline:
      "The first place that explained the criteria in words my mother could read herself",
    body: "I had already been through four registry sites and a hospital PDF. This was the first time my mother read the eligibility list on her own and said \"I think that's me.\" She was right — the coordinator confirmed most of it on the phone. Sitting with her while she read it, instead of translating for her, changed the whole conversation.",
    tags: ["Plain language", "Screening call"],
    helpfulCount: 48,
  },
  {
    id: "terrence-o",
    name: "Terrence O.",
    role: "Patient",
    rating: 4,
    date: "July 30, 2026",
    days: 23,
    meta: "Patient · enrolled in a Phase 3 study",
    headline:
      "Good search, and the travel question was answered before I had to ask",
    body: "The distance line on each result is the thing I used most — I cannot drive more than an hour. Four stars only because the nearest site's contact details took two days to come back by email. The study itself has been well run and I never once felt pushed to sign anything.",
    tags: ["Distance to site", "Enrolled"],
    helpfulCount: 31,
  },
  {
    id: "amara-n",
    name: "Dr. Amara N.",
    role: "Clinician",
    rating: 5,
    date: "July 18, 2026",
    days: 35,
    meta: "Clinician · internal medicine",
    headline: "I now send patients here instead of printing the registry page",
    body: "In a fifteen-minute appointment I cannot walk someone through an inclusion list. I send the link, they read the summary at home, and they come back with real questions about randomisation and follow-up. The summaries have matched the protocol every time I have checked them against the source record.",
    tags: ["Clinician use", "Accuracy"],
    helpfulCount: 64,
    reply:
      "Thank you — the summaries are generated from the registry text and reviewed against it, and we publish the source record link on every study so you can verify. If you ever find a summary that drifts from the protocol, the report link on the study page comes straight to our clinical team.",
  },
  {
    id: "joanne-p",
    name: "Joanne P.",
    role: "Patient",
    rating: 3,
    date: "June 27, 2026",
    days: 56,
    meta: "Patient · screened, not enrolled",
    headline:
      "Screened out at the last step, and I wish that had been clearer earlier",
    body: "I matched on paper, went in for screening, and a blood result ruled me out. Nobody did anything wrong and the staff were kind about it. But I had built up hope over three weeks, and I would have liked a plainer warning that a screening visit can still end in a no.",
    tags: ["Screened out", "Expectations"],
    helpfulCount: 57,
    reply:
      "This is fair, and we changed the study pages because of reviews like yours: each one now says up front that screening can end in a no, and what happens next if it does. We are sorry it landed the hard way for you.",
  },
  {
    id: "vikram-s",
    name: "Vikram S.",
    role: "Caregiver",
    rating: 5,
    date: "June 9, 2026",
    days: 74,
    meta: "Caregiver · searching for a spouse",
    headline: "No countdowns, no urgency banners, no sales calls afterwards",
    body: "What I noticed most was what is missing. Nothing flashed at me, nothing asked for my phone number before showing results, and no one called me afterwards. When you are already frightened, a calm page is worth a lot.",
    tags: ["No pressure", "Privacy"],
    helpfulCount: 39,
  },
  {
    id: "beatriz-r",
    name: "Beatriz R.",
    role: "Patient",
    rating: 4,
    date: "May 21, 2026",
    days: 93,
    meta: "Patient · saved four studies",
    headline:
      "Saved studies gave me something concrete to bring to my oncologist",
    body: "I brought three saved studies to my appointment and we went through them one by one. Two were not right for reasons that were not on the page — my doctor explained why. Still the most useful twenty minutes of preparation I have done.",
    tags: ["Saved trials", "Doctor visit"],
    helpfulCount: 22,
  },
];

type RoleFilter = "All" | ReviewerRole;
type SortMode = "recent" | "rating";

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: "All", label: "Everyone" },
  { value: "Patient", label: "Patients" },
  { value: "Caregiver", label: "Caregivers" },
  { value: "Clinician", label: "Clinicians" },
];

const SORTS: { value: SortMode; label: string; heading: string }[] = [
  { value: "recent", label: "Most recent", heading: "Most recent first" },
  { value: "rating", label: "Highest rated", heading: "Highest rated first" },
];

const PAGE_SIZE = 4;

const RATING_HINTS: Record<number, string> = {
  1: "Difficult",
  2: "Mixed",
  3: "Okay",
  4: "Good",
  5: "Very good",
};

const HONORIFICS = new Set(["dr", "dr.", "prof", "prof.", "mr", "mr.", "mrs", "mrs.", "ms", "ms."]);

/** "Dr. Amara N." → "AN", "Marguerite D." → "MD". */
function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => part && !HONORIFICS.has(part.toLowerCase()))
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function ReviewsClient() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [sort, setSort] = useState<SortMode>("recent");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});

  // Review form — local state only, nothing is ever sent anywhere.
  const [formRating, setFormRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formRole, setFormRole] = useState("Patient");
  const [formText, setFormText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ratingGroupId = useId();
  const roleSelectId = useId();
  const reviewTextId = useId();

  const total = REVIEWS.length;
  const average = useMemo(
    () => REVIEWS.reduce((sum, review) => sum + review.rating, 0) / total,
    [total]
  );

  const breakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => {
        const count = REVIEWS.filter((review) => review.rating === star).length;
        return { star, count, percent: total === 0 ? 0 : (count / total) * 100 };
      }),
    [total]
  );

  const filtered = useMemo(() => {
    const list = REVIEWS.filter(
      (review) => roleFilter === "All" || review.role === roleFilter
    );

    return [...list].sort((a, b) =>
      sort === "rating" ? b.rating - a.rating || a.days - b.days : a.days - b.days
    );
  }, [roleFilter, sort]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;

  const activeSort = SORTS.find((option) => option.value === sort) ?? SORTS[0];
  const displayRating = hoverRating || formRating;

  function selectRole(value: RoleFilter) {
    setRoleFilter(value);
    setVisibleCount(PAGE_SIZE);
  }

  function toggleHelpful(id: string) {
    setHelpful((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section id="top" className="band-sky">
        <div className="shell" style={{ paddingTop: 80, paddingBottom: 88 }}>
          <div className="grid12">
            <div style={{ gridColumn: "1 / span 7" }}>
              <span className="overline">
                Reviews · From people who used TrialFind
              </span>

              <h1
                style={{
                  marginTop: 20,
                  fontSize: "var(--fs-display)",
                  fontWeight: 500,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  maxWidth: "22ch",
                }}
              >
                What it was actually like.
              </h1>

              <p className="lede" style={{ marginTop: 24 }}>
                Unedited notes from patients, caregivers and clinicians about the
                search, the phone call and the screening visit. We publish the
                mixed reviews too — a decision this size deserves the honest
                version.
              </p>

              <p
                style={{
                  marginTop: 24,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                  maxWidth: "62ch",
                }}
              >
                Reviews describe personal experience of the process, not medical
                outcomes. No one is paid or given anything in exchange for a
                review.
              </p>
            </div>

            {/* Rating summary */}
            <div
              className="v4-card"
              style={{ gridColumn: "9 / span 4", padding: 32, alignSelf: "center" }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span
                  style={{
                    fontSize: "var(--fs-h2)",
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  {average.toFixed(1)}
                </span>
                <span style={{ fontSize: 16, color: "var(--text-secondary)" }}>
                  out of 5
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 12,
                  flexWrap: "wrap",
                }}
              >
                <Stars value={average} size={18} />
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {total} verified reviews
                </span>
              </div>

              <div
                role="group"
                aria-label="Rating breakdown"
                style={{
                  marginTop: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {breakdown.map(({ star, count, percent }) => (
                  <div
                    key={star}
                    role="img"
                    aria-label={`${star} star: ${count} ${
                      count === 1 ? "review" : "reviews"
                    }, ${Math.round(percent)}%`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "44px 1fr 32px",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {star} star
                    </span>

                    <span
                      style={{
                        display: "block",
                        height: 6,
                        borderRadius: "var(--radius)",
                        background: "rgba(0,43,62,.08)",
                        overflow: "hidden",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          height: "100%",
                          width: `${percent}%`,
                          borderRadius: "var(--radius)",
                          background:
                            star >= 4 ? "var(--accent)" : "var(--purple)",
                        }}
                      />
                    </span>

                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        textAlign: "right",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>

              <p
                style={{
                  marginTop: 20,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                }}
              >
                Every review is from a verified account that completed a search.
                We do not remove low ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div
        className="shell flex flex-col lg:flex-row lg:items-start"
        style={{ paddingTop: 56, paddingBottom: 96, gap: 40 }}
      >
        {/* Review list */}
        <div className="w-full flex-1 min-w-0">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ fontSize: "var(--fs-h3)", fontWeight: 500 }}>
              {filtered.length} {filtered.length === 1 ? "review" : "reviews"}
            </h2>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {activeSort.heading}
            </span>
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              marginTop: 20,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              Show
            </span>

            {ROLE_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="v4-chip"
                aria-pressed={roleFilter === option.value}
                onClick={() => selectRole(option.value)}
              >
                {option.label}
              </button>
            ))}

            <span
              aria-hidden="true"
              style={{
                width: 1,
                height: 24,
                background: "rgba(0,43,62,.12)",
                margin: "0 4px",
              }}
            />

            {SORTS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="v4-chip"
                aria-pressed={sort === option.value}
                onClick={() => setSort(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginTop: 24,
            }}
          >
            {visible.map((review) => {
              const isHelpful = Boolean(helpful[review.id]);
              const isClinician = review.role === "Clinician";

              return (
                <article
                  key={review.id}
                  className="v4-card"
                  style={{ padding: 28 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        flex: "0 0 auto",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        // The one deliberate exception to the 12px radius rule:
                        // the reviewer avatar stays a circle.
                        borderRadius: "50%",
                        background: isClinician
                          ? "var(--purple-bg)"
                          : "var(--accent-bg)",
                        color: isClinician ? "var(--purple)" : "var(--accent)",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {initialsFor(review.name)}
                    </span>

                    <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 500 }}>
                        {review.name}
                      </div>
                      <div
                        style={{ fontSize: 13, color: "var(--text-secondary)" }}
                      >
                        {review.meta}
                      </div>
                    </div>

                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <Stars value={review.rating} />
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--text-tertiary)",
                          marginTop: 4,
                        }}
                      >
                        {review.date}
                      </div>
                    </div>
                  </div>

                  <h3
                    style={{
                      margin: "20px 0 8px",
                      fontSize: 20,
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {review.headline}
                  </h3>

                  <p
                    style={{
                      fontSize: 16,
                      lineHeight: 1.7,
                      color: "var(--text-body)",
                      maxWidth: "62ch",
                    }}
                  >
                    {review.body}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 20,
                      paddingTop: 16,
                      borderTop: "1px solid var(--border-subtle)",
                    }}
                  >
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          background: "rgba(240,250,255,.9)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          padding: "4px 12px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}

                    <button
                      type="button"
                      className="v4-chip"
                      aria-pressed={isHelpful}
                      onClick={() => toggleHelpful(review.id)}
                      style={{ marginLeft: "auto" }}
                    >
                      Helpful · {review.helpfulCount + (isHelpful ? 1 : 0)}
                    </button>
                  </div>

                  {review.reply && (
                    <div
                      style={{
                        marginTop: 16,
                        background: "rgba(243,240,251,.85)",
                        borderRadius: 12,
                        padding: 20,
                      }}
                    >
                      <span className="overline overline-purple">
                        Response from TrialFind
                      </span>
                      <p
                        style={{
                          marginTop: 8,
                          fontSize: 16,
                          lineHeight: 1.7,
                          color: "var(--text-body)",
                          maxWidth: "62ch",
                        }}
                      >
                        {review.reply}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 16,
              marginTop: 24,
            }}
          >
            {remaining > 0 && (
              <button
                type="button"
                className="v4-btn-outline"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Show older reviews
              </button>
            )}
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {remaining > 0
                ? `${remaining} older ${
                    remaining === 1 ? "review" : "reviews"
                  } not shown yet`
                : "That is every review for this filter."}
            </span>
          </div>
        </div>

        {/* ── Write a review ─────────────────────────────────── */}
        <aside
          className="v4-card w-full lg:w-[clamp(320px,32%,420px)] lg:flex-none lg:sticky lg:top-6"
          style={{ padding: 28 }}
        >
          <h2 style={{ fontSize: "var(--fs-h4)", fontWeight: 500 }}>
            Share your experience
          </h2>
          <p
            style={{
              marginTop: 8,
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
            }}
          >
            Whatever happened — you enrolled, you were screened out, you changed
            your mind — it helps the next person decide.
          </p>

          <form
            style={{ marginTop: 24 }}
            onSubmit={(event) => {
              // Local state only — this deliberately does not POST anywhere.
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <span className="v4-label" id={ratingGroupId}>
              How was the process?
            </span>
            <div
              role="group"
              aria-labelledby={ratingGroupId}
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} ${
                      star === 1 ? "star" : "stars"
                    } out of 5`}
                    aria-pressed={star <= formRating}
                    onClick={() => setFormRating(star)}
                    // Focus mirrors hover so the preview works from the keyboard.
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onFocus={() => setHoverRating(star)}
                    onBlur={() => setHoverRating(0)}
                    style={{
                      background: "none",
                      border: 0,
                      padding: 2,
                      lineHeight: 0,
                      cursor: "pointer",
                    }}
                  >
                    <svg
                      width={30}
                      height={30}
                      viewBox="0 0 24 24"
                      fill={star <= displayRating ? "var(--accent)" : "none"}
                      stroke="var(--accent)"
                      strokeWidth={1.6}
                      strokeLinejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d={STAR_PATH} />
                    </svg>
                  </button>
                ))}
              </div>

              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {RATING_HINTS[displayRating] ?? "Tap a star"}
              </span>
            </div>

            <div style={{ marginTop: 20 }}>
              <label className="v4-label" htmlFor={roleSelectId}>
                You are a
              </label>
              <select
                id={roleSelectId}
                className="v4-input"
                value={formRole}
                onChange={(event) => setFormRole(event.target.value)}
              >
                <option value="Patient">Patient</option>
                <option value="Caregiver or family member">
                  Caregiver or family member
                </option>
                <option value="Clinician">Clinician</option>
              </select>
            </div>

            <div style={{ marginTop: 20 }}>
              <label className="v4-label" htmlFor={reviewTextId}>
                In your words
              </label>
              <textarea
                id={reviewTextId}
                className="v4-input"
                rows={4}
                value={formText}
                onChange={(event) => setFormText(event.target.value)}
                placeholder="What was clear, what was confusing, what you wish you had known"
                style={{ resize: "vertical" }}
              />
            </div>

            <button
              type="submit"
              className="v4-btn"
              style={{ width: "100%", marginTop: 20 }}
            >
              <span aria-live="polite">
                {submitted ? "Thank you — sent for review" : "Post my review"}
              </span>
            </button>
          </form>

          <p
            style={{
              marginTop: 16,
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
            }}
          >
            Reviews are published with your first name and role only. No
            condition, no location, nothing identifying. You can delete yours at
            any time.
          </p>
        </aside>
      </div>
    </>
  );
}
