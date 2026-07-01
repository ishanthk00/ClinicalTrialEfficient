"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import AIAgent from "@/components/AIAgent";
import PersonalizedTrials from "@/components/PersonalizedTrials";
import MagneticButton from "@/components/MagneticButton";
import type { Trial } from "@/lib/clinicaltrials";

const POPULAR_SEARCHES = [
  { label: "Alzheimer's disease", condition: "Alzheimer's" },
  { label: "Type 2 Diabetes",     condition: "Type 2 Diabetes" },
  { label: "Breast Cancer",       condition: "Breast Cancer" },
  { label: "Depression",          condition: "Depression" },
  { label: "Parkinson's disease", condition: "Parkinson's" },
  { label: "Heart failure",       condition: "Heart failure" },
];

export default function HomePage() {
  const [personalizedTrials, setPersonalizedTrials] = useState<Trial[]>([]);
  const [personalizedCondition, setPersonalizedCondition] = useState("");

  function handleTrialsFound(trials: Trial[], condition: string) {
    setPersonalizedTrials(trials);
    setPersonalizedCondition(condition);
  }

  return (
    <>
      <main className="hero-mesh relative flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 py-20 overflow-hidden">
        {/* Parallax bg image */}
        <Image
          src="/clinical-trials.webp"
          alt=""
          fill
          className="object-cover pointer-events-none select-none"
          style={{ opacity: 0.04, transform: "translateY(calc(var(--scroll-y, 0) * 0.4px))" }}
          priority
          aria-hidden="true"
        />

        {/* Hero text */}
        <div className="relative z-10 text-center mb-12 max-w-3xl">
          <p className="section-label mb-5 anim-fade-up">Patient-First · Clinical Trial Search</p>

          <h1
            className="font-bold leading-[1.05] mb-6 anim-fade-up anim-delay-1"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(2.4rem, 5.5vw, 3.75rem)",
              color: "var(--text)",
            }}
          >
            Find trials that match you,{" "}
            <span style={{ color: "var(--accent)" }}>in plain English.</span>
          </h1>

          <p
            className="text-lg leading-relaxed max-w-xl mx-auto anim-fade-up anim-delay-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Search over 500,000 clinical trials from ClinicalTrials.gov. We translate
            the medical language so you can focus on finding the right option.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="relative z-10 flex flex-wrap justify-center gap-3 mb-10 anim-fade-up anim-delay-2">
          <MagneticButton href="/results" className="magnetic-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Browse Trials
          </MagneticButton>
          <MagneticButton href="/about" className="magnetic-btn" style={{ background: "transparent", border: "1.5px solid var(--accent)", color: "var(--accent)", boxShadow: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            About
          </MagneticButton>
        </div>

        {/* Search bar */}
        <div className="relative z-10 w-full max-w-2xl anim-fade-up anim-delay-3">
          <SearchBar />
        </div>

        {/* Popular searches */}
        <div className="relative z-10 mt-8 w-full max-w-2xl anim-fade-up anim-delay-4">
          <p className="section-label text-center mb-4" style={{ opacity: 0.7 }}>
            Popular searches
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_SEARCHES.map((s, i) => (
              <Link
                key={s.condition}
                href={`/results?condition=${encodeURIComponent(s.condition)}`}
                className="pill-teal px-4 py-1.5 rounded-full text-sm"
                style={{ animationDelay: `${400 + i * 40}ms` }}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Trust note */}
        <p
          className="relative z-10 mt-14 text-xs text-center max-w-sm anim-fade-up anim-delay-5"
          style={{ color: "var(--text-tertiary)" }}
        >
          Data sourced from{" "}
          <a
            href="https://clinicaltrials.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
            style={{ color: "var(--text-secondary)" }}
          >
            ClinicalTrials.gov
          </a>
          . Always consult a healthcare provider before enrolling in any trial.
        </p>
      </main>

      {personalizedTrials.length > 0 && (
        <PersonalizedTrials
          trials={personalizedTrials}
          condition={personalizedCondition}
        />
      )}

      <AIAgent onTrialsFound={handleTrialsFound} />
    </>
  );
}
