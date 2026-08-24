import type { BudgetSummary } from "../domain/budget";
import { formatMoney } from "../domain/money";
import type { Traveler } from "../domain/trip";

const categoryLabels = {
  transport: "Transport",
  stay: "Stay",
  food: "Food",
  activities: "Activities",
  "local-transit": "Local transit",
} as const;

export function BudgetLeaf({
  budget,
  travelers,
}: {
  budget: BudgetSummary;
  travelers: Traveler[];
}) {
  return (
    <div className="workspace-leaf">
      <h1>Budget</h1>
      <p className="leaf-intro">
        Exact synthetic costs for the current selections. No live prices are represented.
      </p>
      <div className="budget-columns">
        <section aria-labelledby="category-costs">
          <h2 id="category-costs">By category</h2>
          <MoneyList
            values={Object.entries(budget.byCategory).map(([category, value]) => ({
              label: categoryLabels[category as keyof typeof categoryLabels],
              value,
            }))}
          />
        </section>
        <section aria-labelledby="traveler-costs">
          <h2 id="traveler-costs">By traveler</h2>
          <MoneyList
            values={travelers.map((traveler) => ({
              label: traveler.name,
              value: budget.byTraveler[traveler.id],
            }))}
          />
        </section>
      </div>
      <section aria-labelledby="budget-summary">
        <h2 id="budget-summary">Summary</h2>
        <MoneyList
          values={[
            { label: "Contingency", value: budget.contingency },
            { label: "Optional choices", value: budget.optional },
            { label: "Group total", value: budget.total },
            ...(budget.remaining
              ? [{ label: "Remaining", value: budget.remaining }]
              : []),
          ]}
        />
      </section>
    </div>
  );
}

function MoneyList({
  values,
}: {
  values: Array<{ label: string; value: { amount: string; currency: string } }>;
}) {
  return (
    <dl className="money-list">
      {values.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{formatMoney(value, "en-CH")}</dd>
        </div>
      ))}
    </dl>
  );
}
