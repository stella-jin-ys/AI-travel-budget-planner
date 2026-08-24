import type { BudgetSummary } from "./budget";
import type {
  PlanItem,
  PlanSection,
  SourceEvidence,
  SourceStatus,
  TripPlan,
} from "./trip";

export type FreshnessPolicy = Partial<Record<SourceStatus, number>>;

export interface PlanIssue {
  itemId: string;
  severity: "warning" | "blocking";
  status: SourceStatus;
  message: string;
  impact: string;
  checkedAt: string;
  supplierName: string;
  sourceUrl?: string;
}

export interface ReadinessResult {
  state: "draft" | "review-needed" | "ready-to-book";
  issues: PlanIssue[];
}

export const defaultFreshnessPolicy: FreshnessPolicy = {
  live: 15 * 60_000,
  recent: 24 * 60 * 60_000,
  typical: 30 * 24 * 60 * 60_000,
};

export const demoNow = new Date("2026-08-24T10:00:00Z");

export function evaluateReadiness(
  plan: TripPlan,
  budget: BudgetSummary,
  policy: FreshnessPolicy,
  now: Date,
): ReadinessResult {
  const issues = plan.items.flatMap((item) => issuesForItem(item, policy, now));

  if (!budget.withinStrictLimit) {
    issues.push({
      itemId: "budget",
      severity: "warning",
      status: "conflicting",
      message: "Strict budget exceeded",
      impact: `Shortfall ${budget.remaining?.amount} ${budget.total.currency}`,
      checkedAt: now.toISOString(),
      supplierName: "Budget engine",
    });
  }

  const requiredSections: PlanSection[] = [
    "overview",
    "travel",
    "stay",
    "days",
    "food",
    "budget",
  ];
  const incomplete = requiredSections.some(
    (section) => !plan.completeSections.includes(section),
  );
  const blocking = issues.some((issue) => issue.severity === "blocking");

  return {
    state: incomplete || blocking
      ? "draft"
      : issues.length > 0
        ? "review-needed"
        : "ready-to-book",
    issues,
  };
}

function issuesForItem(
  item: PlanItem,
  policy: FreshnessPolicy,
  now: Date,
): PlanIssue[] {
  const selected = item.alternatives.find(
    (alternative) => alternative.id === item.selectedAlternativeId,
  );
  if (!selected) throw new Error(`Missing selected alternative for ${item.id}`);

  const evidence: SourceEvidence = selected.evidence;
  const age = now.getTime() - new Date(evidence.checkedAt).getTime();
  const expired =
    policy[evidence.status] !== undefined && age > policy[evidence.status]!;
  const status: SourceStatus = expired ? "stale" : evidence.status;
  const issues: PlanIssue[] = [];

  if (item.connectionFeasible === false) {
    issues.push({
      itemId: item.id,
      severity: "blocking",
      status: "failed",
      message: "Connection is not feasible",
      impact: "Choose another departure or increase the transfer buffer",
      checkedAt: evidence.checkedAt,
      supplierName: evidence.supplierName,
      sourceUrl: evidence.sourceUrl,
    });
  }

  if (!["live", "recent"].includes(status)) {
    issues.push({
      itemId: item.id,
      severity: "warning",
      status,
      message: status === "stale" ? "Stale estimate" : "Needs confirmation",
      impact: evidence.reason ?? "Price or availability may change",
      checkedAt: evidence.checkedAt,
      supplierName: evidence.supplierName,
      sourceUrl: evidence.sourceUrl,
    });
  }

  return issues;
}
