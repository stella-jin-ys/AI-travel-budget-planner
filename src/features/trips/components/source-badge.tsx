import type { SourceStatus } from "../domain/trip";

function sourceStatusLabel(status: SourceStatus): string {
  switch (status) {
    case "live":
      return "Live source";
    case "recent":
      return "Recent estimate";
    case "typical":
      return "Typical estimate";
    case "stale":
      return "Stale source";
    case "conflicting":
      return "Conflicting sources";
    case "unavailable":
      return "Source unavailable";
    case "failed":
      return "Source failed";
  }
}

function SourceStatusIcon({ status }: { status: SourceStatus }) {
  const common = {
    className: "source-badge__icon",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    "aria-hidden": true,
  } as const;

  switch (status) {
    case "live":
      return <svg {...common}><path d="m3.5 9 3.2 3.2 7.8-7.8" /></svg>;
    case "recent":
      return <svg {...common}><circle cx="9" cy="9" r="6" /><path d="M9 5.2V9l2.6 1.8" /></svg>;
    case "typical":
      return <svg {...common}><path d="M3 12.5 6.5 9l2.4 2.4L15 5.3" /><path d="M11 5.3h4v4" /></svg>;
    case "stale":
      return <svg {...common}><circle cx="9" cy="9" r="6" /><path d="M9 5.2v4.2M9 12.5v.2" /></svg>;
    case "conflicting":
      return <svg {...common}><path d="M3 5.5h8M8.5 3 11 5.5 8.5 8M15 12.5H7M9.5 10 7 12.5 9.5 15" /></svg>;
    case "unavailable":
      return <svg {...common}><circle cx="9" cy="9" r="6" /><path d="M5.5 9h7" /></svg>;
    case "failed":
      return <svg {...common}><path d="m4.5 4.5 9 9M13.5 4.5l-9 9" /></svg>;
  }
}

export function SourceBadge({ status }: { status: SourceStatus }) {
  const unresolved = !["live", "recent"].includes(status);

  return (
    <span className="source-badge" data-unresolved={unresolved}>
      <SourceStatusIcon status={status} />
      <span>{sourceStatusLabel(status)}</span>
    </span>
  );
}
