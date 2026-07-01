import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import ThemeProvider from "@/components/ThemeProvider";
import MagneticButton from "@/components/MagneticButton";
import ScrollInit from "@/components/ScrollInit";

export const metadata: Metadata = {
  title: "TrialFind — Find Clinical Trials",
  description:
    "Search ClinicalTrials.gov in plain English. Find clinical trials for any condition, anywhere.",
};

const themeScript = `(function(){
  document.documentElement.classList.add('dark');
  document.documentElement.setAttribute('data-theme','dark');
})();`;

const fontLink = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=Sora:wght@300;400;500;600;700;800&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontLink} rel="stylesheet" />
      </head>
      <body style={{ backgroundColor: "#0a0f1e", color: "#f0f4ff" }} className="min-h-screen">
        {/* Scroll progress bar */}
        <div id="scroll-progress" className="scroll-progress" style={{ width: "0%" }} />

        <ThemeProvider>
          <ScrollInit />

          {/* ── Sticky frosted nav ── */}
          <nav className="glass-nav sticky top-0 z-50">
            <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center">
              <Link
                href="/"
                className="text-lg font-bold tracking-tight shrink-0"
                style={{ fontFamily: "'Sora', sans-serif", color: "#00b4d8" }}
              >
                TrialFind
              </Link>

              {/* Center nav links */}
              <div className="hidden md:flex items-center gap-6 ml-10">
                <Link href="/results" className="nav-link text-sm py-1">Search</Link>
                <Link href="/about" className="nav-link text-sm py-1">About</Link>
              </div>

              {/* Right: saved */}
              <div className="ml-auto flex items-center gap-3">
                <MagneticButton href="/saved" className="magnetic-btn-nav">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  Saved trials
                </MagneticButton>
              </div>
            </div>
          </nav>

          <div className="page-fade">
            {children}
          </div>

          {/* ── Footer ── */}
          <footer style={{ background: "#060b18", borderTop: "1px solid rgba(0,180,216,0.12)" }}>
            <div className="max-w-[1200px] mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Col 1 */}
              <div>
                <span
                  className="text-lg font-bold"
                  style={{ fontFamily: "'Sora',sans-serif", color: "#00b4d8" }}
                >
                  TrialFind
                </span>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "#4a5568", maxWidth: "22ch" }}>
                  Making clinical research accessible to everyone. Search 500,000+ trials in plain English.
                </p>
              </div>

              {/* Col 2 */}
              <div className="flex flex-col gap-2">
                <span className="section-label mb-3">Navigation</span>
                {([["Home", "/"], ["Search Trials", "/results"], ["About", "/about"], ["Saved Trials", "/saved"]] as [string, string][]).map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm footer-link"
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {/* Col 3 */}
              <div className="flex flex-col gap-2">
                <span className="section-label mb-3">Data &amp; Legal</span>
                <a
                  href="https://clinicaltrials.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm footer-link"
                >
                  ClinicalTrials.gov
                </a>
                {["Privacy", "Regulatory info", "Contact"].map((l) => (
                  <a key={l} href="#" className="text-sm footer-link">{l}</a>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div
              className="max-w-[1200px] mx-auto px-6 pb-6 pt-4 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
            >
              <p className="text-xs" style={{ color: "#2d3748" }}>
                © 2025 TrialFind. Data sourced from{" "}
                <a
                  href="https://clinicaltrials.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                  style={{ color: "#4a5568" }}
                >
                  ClinicalTrials.gov
                </a>
                . Always consult a healthcare provider before enrolling.
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
