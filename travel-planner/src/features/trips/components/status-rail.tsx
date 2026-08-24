import type { BudgetSummary } from "../domain/budget";
import type { ReadinessResult } from "../domain/readiness";
import type { Money } from "../domain/trip";

const readinessLabels: Record<ReadinessResult["state"], string> = {
  draft: "Draft",
  "review-needed": "Review needed",
  "ready-to-book": "Ready to book",
};

function formatMoney(value: Money): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: value.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value.amount));
}

export function StatusRail({
  budget,
  readiness,
}: {
  budget: BudgetSummary;
  readiness: ReadinessResult;
}) {
  const warningCount = readiness.issues.filter(
    (issue) => issue.severity === "warning",
  ).length;

  return (
    <header className="status-rail" aria-label="Trip status">
      <dl className="status-rail__metric">
        <dt>Group total</dt>
        <dd>{formatMoney(budget.total)}</dd>
      </dl>
      <dl className="status-rail__metric">
        <dt>Per person</dt>
        <dd>{formatMoney(budget.perPerson)}</dd>
      </dl>
      <dl className="status-rail__metric">
        <dt>Readiness</dt>
        <dd>{readinessLabels[readiness.state]}</dd>
      </dl>
      <dl className="status-rail__metric">
        <dt>Checks</dt>
        <dd>{readiness.issues.length}</dd>
      </dl>
      <dl className="status-rail__metric" data-warning={warningCount > 0}>
        <dt>Warnings</dt>
        <dd>{warningCount}</dd>
      </dl>
    </header>
  );
}
