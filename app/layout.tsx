import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import ThemeProvider from "@/components/ThemeProvider";
import ScrollInit from "@/components/ScrollInit";
import SiteNav from "@/components/SiteNav";

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

const FOOTER_NAV: [string, string][] = [
  ["Home", "/"],
  ["Search trials", "/results"],
  ["About", "/about"],
  ["Reviews", "/reviews"],
  ["Saved trials", "/saved"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontLink} rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        {/* Scroll progress bar */}
        <div id="scroll-progress" className="scroll-progress" style={{ width: "0%" }} />

        <ThemeProvider>
          {/* Drives #scroll-progress, --scroll-y and .reveal transitions */}
          <ScrollInit />

          <SiteNav />

          <div className="page-fade">
            {children}
          </div>

          {/* ── Footer — the one dark band in v4 ── */}
          <footer className="site-footer">
            <div className="shell" style={{ paddingBlock: 64 }}>
              <div className="grid12">
                {/* Wordmark + mission */}
                <div style={{ gridColumn: "1 / span 5" }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "var(--fs-h5)",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: "var(--footer-mark)",
                    }}
                  >
                    TrialFind
                  </span>
                  <p
                    style={{
                      marginTop: 16,
                      maxWidth: "62ch",
                      fontSize: "var(--fs-body)",
                      lineHeight: 1.7,
                      color: "var(--footer-text)",
                      opacity: 0.8,
                    }}
                  >
                    Making clinical research understandable. Search 500,000+ studies in plain
                    English, with the eligibility criteria explained before you ever pick up the
                    phone.
                  </p>
                </div>

                {/* Navigation */}
                <div
                  className="flex flex-col items-start gap-3"
                  style={{ gridColumn: "7 / span 2" }}
                >
                  <span className="footer-label">Navigation</span>
                  {FOOTER_NAV.map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="footer-link"
                      style={{ fontSize: "var(--fs-body)" }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>

                {/* Data & legal */}
                <div
                  className="flex flex-col items-start gap-3"
                  style={{ gridColumn: "9 / span 2" }}
                >
                  <span className="footer-label">Data &amp; legal</span>
                  <a
                    href="https://clinicaltrials.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                    style={{ fontSize: "var(--fs-body)" }}
                  >
                    ClinicalTrials.gov
                  </a>
                  <a href="#" className="footer-link" style={{ fontSize: "var(--fs-body)" }}>
                    Privacy
                  </a>
                  <a href="#" className="footer-link" style={{ fontSize: "var(--fs-body)" }}>
                    Regulatory info
                  </a>
                </div>

                {/* Contact */}
                <div
                  className="flex flex-col items-start gap-3"
                  style={{ gridColumn: "11 / span 2" }}
                >
                  <span className="footer-label">Talk to us</span>
                  <a
                    href="mailto:hello@trialfind.org"
                    className="footer-link"
                    style={{ fontSize: "var(--fs-body)" }}
                  >
                    hello@trialfind.org
                  </a>
                </div>

                {/* Legal strip */}
                <div
                  className="flex flex-wrap items-center justify-between"
                  style={{
                    gridColumn: "1 / span 12",
                    borderTop: "1px solid var(--footer-rule)",
                    paddingTop: 20,
                    marginTop: 24,
                    gap: 24,
                  }}
                >
                  <span style={{ fontSize: "var(--fs-small)", color: "var(--footer-label)" }}>
                    © 2026 TrialFind. Data sourced from ClinicalTrials.gov.
                  </span>
                  <span style={{ fontSize: "var(--fs-small)", color: "var(--footer-label)" }}>
                    Informational only — always consult a healthcare provider before enrolling.
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
