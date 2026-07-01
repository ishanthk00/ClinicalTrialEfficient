import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import ThemeProvider from "@/components/ThemeProvider";
import MagneticButton from "@/components/MagneticButton";

export const metadata: Metadata = {
  title: "TrialFind — Find Clinical Trials",
  description:
    "Search ClinicalTrials.gov in plain English. Find clinical trials for any condition, anywhere.",
};

const themeScript = `(function(){
  document.documentElement.classList.remove('dark');
  document.documentElement.setAttribute('data-theme','light');
})();`;

const fontLink = "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontLink} rel="stylesheet" />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        {/* Scroll progress bar */}
        <div id="scroll-progress" className="scroll-progress" style={{ width: "0%" }} />

        <ThemeProvider>
          {/* ── Floating pill nav ── */}
          <nav className="sticky top-0 z-50 px-4 pt-3">
            <div className="floating-nav max-w-[1200px] mx-auto px-6 h-14 flex items-center">
              <Link
                href="/"
                className="text-lg font-bold tracking-tight shrink-0"
                style={{ fontFamily: "'Outfit', sans-serif", color: "var(--accent)" }}
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
          <footer className="site-footer">
            <div className="max-w-[1200px] mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Col 1 */}
              <div>
                <span
                  className="text-lg font-bold"
                  style={{ fontFamily: "'Outfit',sans-serif", color: "var(--accent)" }}
                >
                  TrialFind
                </span>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)", maxWidth: "22ch" }}>
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
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                © 2025 TrialFind. Data sourced from{" "}
                <a
                  href="https://clinicaltrials.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                  style={{ color: "var(--text-secondary)" }}
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
