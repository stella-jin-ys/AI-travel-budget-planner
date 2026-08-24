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
          <dd>{formatRelativeTime(issue.checkedAt, now)}</dd>
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
  const checkedTime = new Date(checkedAt).getTime();
  const nowTime = now.getTime();
  if (!Number.isFinite(checkedTime) || !Number.isFinite(nowTime)) {
    return "Check time unavailable";
  }
  if (checkedTime > nowTime) {
    return "Check time is in the future";
  }

  const days = Math.floor(
    (nowTime - checkedTime) / (24 * 60 * 60 * 1000),
  );
  return days === 0
    ? "Checked today"
    : `Checked ${days} day${days === 1 ? "" : "s"} ago`;
}
