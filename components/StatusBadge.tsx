"use client";

/**
 * v4 status pill — three tones only (open / soon / quiet). All colour comes
 * from the `.status-*` classes in globals.css so both themes stay correct.
 */
const STATUS_CONFIG: Record<string, { label: string; tone: string }> = {
  RECRUITING: { label: "Recruiting now", tone: "status-open" },
  NOT_YET_RECRUITING: { label: "Opening soon", tone: "status-soon" },
  ENROLLING_BY_INVITATION: { label: "By invitation", tone: "status-soon" },
  ACTIVE_NOT_RECRUITING: { label: "Enrollment closed", tone: "status-quiet" },
  COMPLETED: { label: "Completed", tone: "status-quiet" },
  TERMINATED: { label: "Terminated", tone: "status-quiet" },
  WITHDRAWN: { label: "Withdrawn", tone: "status-quiet" },
};

function titleCase(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: titleCase(status),
    tone: "status-quiet",
  };

  return (
    <span className={`status-pill ${config.tone}`}>
      <span className="status-pill__dot" aria-hidden="true" />
      {config.label}
    </span>
  );
}
