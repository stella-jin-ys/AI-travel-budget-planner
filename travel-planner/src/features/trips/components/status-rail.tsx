import type { BudgetSummary } from "../domain/budget";
import type { ReadinessResult } from "../domain/readiness";
import type { Money } from "../domain/trip";

const readinessLabels: Record<ReadinessResult["state"], string> = {
  draft: "Draft",
  "review-needed": "Review needed",
  "ready-to-book": "Ready to book",
};

function formatMoney(value: Money): string {
  const [integer, fraction] = value.amount.split(".");
  const negative = integer.startsWith("-");
  const absoluteInteger = negative ? integer.slice(1) : integer;
  const groupedInteger = new Intl.NumberFormat("en-CH", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(BigInt(absoluteInteger));
  const template = new Intl.NumberFormat("en-CH", {
    style: "currency",
    currency: value.currency,
    currencyDisplay: "code",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(BigInt(negative ? -1 : 1));

  return template
    .map((part) => {
      if (part.type === "integer") return groupedInteger;
      if (part.type === "fraction") return fraction;
      return part.value;
    })
    .join("");
}

export function StatusRail({
  budget,
  readiness,
  checkedCount,
}: {
  budget: BudgetSummary;
  readiness: ReadinessResult;
  checkedCount: number;
}) {
  const warningCount = readiness.issues.length;

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
        <dd>{checkedCount}</dd>
      </dl>
      <dl className="status-rail__metric" data-warning={warningCount > 0}>
        <dt>Warnings</dt>
        <dd>{warningCount}</dd>
      </dl>
    </header>
  );
}
