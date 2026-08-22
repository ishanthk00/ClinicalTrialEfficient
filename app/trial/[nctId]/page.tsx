import { notFound } from "next/navigation";
import { getTrialById } from "@/lib/clinicaltrials";
import StatusBadge from "@/components/StatusBadge";
import AISummaryClient from "./AISummaryClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ nctId: string }> }) {
  const { nctId } = await params;
  const trial = await getTrialById(nctId);
  return {
    title: trial ? `${trial.title} — TrialFind` : "Trial not found — TrialFind",
  };
}

export default async function TrialDetailPage({ params }: { params: Promise<{ nctId: string }> }) {
  const { nctId } = await params;
  const trial = await getTrialById(nctId);

  if (!trial) notFound();

  // "N/A" is the registry's placeholder for studies without phases — it means
  // nothing to a reader, so it is dropped rather than shown.
  const phaseLabel = trial.phases.filter((p) => p && p !== "N/A").join(" and ");

  return (
    <main className="shell" style={{ paddingTop: 32, paddingBottom: 96 }}>
      <div className="grid12">
        {/* A single reading column — the tabs below absorb what used to sit in
            a sidebar, so nothing is left to put beside them. */}
        <div style={{ gridColumn: "3 / span 8" }}>
          <Link href="/results" className="v4-link-quiet inline-flex items-center gap-1.5">
            <ArrowLeft size={14} aria-hidden="true" />
            Back to results
          </Link>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 12,
              marginTop: 20,
            }}
          >
            <StatusBadge status={trial.status} />
            {phaseLabel && (
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{phaseLabel}</span>
            )}
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{trial.nctId}</span>
          </div>

          <h1
            style={{
              marginTop: 14,
              fontSize: "var(--fs-h4)",
              fontWeight: 500,
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
              overflowWrap: "anywhere",
              color: "var(--text)",
            }}
          >
            {trial.title}
          </h1>

          <AISummaryClient trial={trial} />
        </div>
      </div>
    </main>
  );
}
