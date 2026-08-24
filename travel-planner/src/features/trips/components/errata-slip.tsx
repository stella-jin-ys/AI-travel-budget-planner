import type { PlanIssue } from "../domain/readiness";
import { SourceBadge } from "./source-badge";

export function ErrataSlip({ issue, now }: { issue: PlanIssue; now: Date }) {
  return (
    <aside
      className="errata-slip"
      role="alert"
      aria-label={`${issue.message} for ${issue.itemId}`}
      data-item-id={issue.itemId}
    >
      <div className="errata-slip__heading">
        <SourceBadge status={issue.status} />
        <strong>{issue.message}</strong>
      </div>
      <p className="errata-slip__impact">{issue.impact}</p>
      <dl className="errata-slip__meta">
        <div>
          <dt>Supplier</dt>
          <dd>{issue.supplierName}</dd>
        </div>
        <div>
          <dt>Last checked</dt>
          <dd>Checked {formatRelativeTime(issue.checkedAt, now)}</dd>
        </div>
      </dl>
      {issue.sourceUrl ? (
        <a
          className="errata-slip__action"
          href={issue.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Check with supplier
        </a>
      ) : null}
    </aside>
  );
}

function formatRelativeTime(checkedAt: string, now: Date): string {
  const days = Math.max(
    0,
    Math.floor(
      (now.getTime() - new Date(checkedAt).getTime()) / (24 * 60 * 60 * 1000),
    ),
  );
  return days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"} ago`;
}
