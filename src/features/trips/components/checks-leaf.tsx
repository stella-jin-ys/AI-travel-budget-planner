import { calculateBudget } from "../domain/budget";
import {
  defaultFreshnessPolicy,
  demoNow,
  evaluateReadiness,
  type PlanIssue,
  type ReadinessResult,
} from "../domain/readiness";
import type { SourceStatus, TripPlan } from "../domain/trip";
import { SourceBadge } from "./source-badge";

const groups: Array<{ status: SourceStatus; label: string }> = [
  { status: "live", label: "Verified" },
  { status: "recent", label: "Recently checked" },
  { status: "typical", label: "Typical estimates" },
  { status: "stale", label: "Stale" },
  { status: "conflicting", label: "Conflicting" },
  { status: "unavailable", label: "Unavailable" },
  { status: "failed", label: "Failed" },
];

interface CheckRecord {
  id: string;
  itemLabel: string;
  status: SourceStatus;
  supplierName: string;
  checkedAt: string;
  message?: string;
  sourceUrl?: string;
}

export function ChecksLeaf({
  plan,
  readiness,
}: {
  plan: TripPlan;
  readiness?: ReadinessResult;
}) {
  const result = readiness ?? evaluateReadiness(
    plan,
    calculateBudget(plan),
    defaultFreshnessPolicy,
    demoNow,
  );
  const records = checkRecords(plan, result.issues);

  return (
    <div className="workspace-leaf">
      <h1>Checks</h1>
      <p className="leaf-intro">
        Supplier evidence grouped by freshness and resolution status.
      </p>
      <div className="check-groups">
        {groups.map((group) => {
          const matches = records.filter((record) => record.status === group.status);
          const headingId = `checks-${group.status}`;
          return (
            <section
              className="check-group"
              aria-labelledby={headingId}
              key={group.status}
            >
              <h2 id={headingId}>{group.label}</h2>
              {matches.length > 0 ? (
                <ul>
                  {matches.map((record) => (
                    <li key={record.id}>
                      <div>
                        <strong>{record.itemLabel}</strong>
                        <p>{record.message ?? record.supplierName}</p>
                      </div>
                      <SourceBadge status={record.status} />
                      {record.sourceUrl ? (
                        <a href={record.sourceUrl} target="_blank" rel="noreferrer">
                          Check source
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No checks in this group.</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function checkRecords(plan: TripPlan, issues: PlanIssue[]): CheckRecord[] {
  const labelByItem = new Map(plan.items.map((item) => [item.id, item.label]));
  const issuesByItem = new Set(issues.map((issue) => issue.itemId));
  const selectedRecords = plan.items.flatMap((item) => {
    if (issuesByItem.has(item.id)) return [];
    const selected = item.alternatives.find(
      (alternative) => alternative.id === item.selectedAlternativeId,
    );
    if (!selected) throw new Error(`Missing selected option for ${item.id}`);

    return [{
      id: `selected-${item.id}`,
      itemLabel: item.label,
      status: selected.evidence.status,
      supplierName: selected.evidence.supplierName,
      checkedAt: selected.evidence.checkedAt,
      sourceUrl: selected.evidence.sourceUrl,
    }];
  });

  return [
    ...selectedRecords,
    ...issues.map((issue, index) => ({
      id: `issue-${issue.itemId}-${issue.status}-${index}`,
      itemLabel: labelByItem.get(issue.itemId) ?? "Budget",
      status: issue.status,
      supplierName: issue.supplierName,
      checkedAt: issue.checkedAt,
      message: issue.message,
      sourceUrl: issue.sourceUrl,
    })),
  ];
}
