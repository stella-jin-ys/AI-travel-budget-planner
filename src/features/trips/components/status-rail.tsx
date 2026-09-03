import type { BudgetSummary } from "../domain/budget";
import type { ReadinessResult } from "../domain/readiness";
import type { Money, TripPlan } from "../domain/trip";

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
    .join("")
    .replaceAll("’", "'");
}

export function StatusRail({
  budget,
  readiness,
  plan,
}: {
  budget: BudgetSummary;
  readiness: ReadinessResult;
  plan: TripPlan;
}) {
  const warningCount = readiness.issues.length;

  return (
    <header className="status-rail status-rail--compact-mobile" aria-label="Trip status">
      <dl className="status-rail__metric">
        <dt>Total cost</dt>
        <dd>
          {formatMoney(budget.total)}
          <small className="status-rail__per-person"><span>Per person</span> {formatMoney(budget.perPerson)}</small>
        </dd>
      </dl>
      <dl className="status-rail__metric">
        <dt>Trip</dt>
      <dd>{plan.brief.endDate ? `${plan.days.length} nights / ${plan.brief.travelers.length} travellers` : "Trip"}</dd>
      </dl>
      <dl className="status-rail__metric" data-warning={warningCount > 0}>
        <dt>Priority</dt>
        <dd className="status-rail__priority">{plan.brief.purpose || plan.brief.interests.join(", ") || readinessLabels[readiness.state]}</dd>
      </dl>
    </header>
  );
}
