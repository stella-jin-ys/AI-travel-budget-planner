import Decimal from "decimal.js";
import { addMoney, money } from "./money";
import type {
  CostCategory,
  Money,
  PlanAlternative,
  Traveler,
  TripPlan,
} from "./trip";

export interface BudgetSummary {
  byCategory: Record<CostCategory, Money>;
  byTraveler: Record<string, Money>;
  covered: Money;
  optional: Money;
  subtotal: Money;
  contingency: Money;
  total: Money;
  perPerson: Money;
  limit?: Money;
  remaining?: Money;
  withinStrictLimit: boolean;
}

const categories: CostCategory[] = [
  "transport",
  "stay",
  "food",
  "activities",
  "local-transit",
];

export function calculateBudget(plan: TripPlan): BudgetSummary {
  const selected = plan.items.map((item) => {
    const alternative = item.alternatives.find(
      (candidate) => candidate.id === item.selectedAlternativeId,
    );
    if (!alternative) throw new Error(`Missing selected alternative for ${item.id}`);
    return alternative;
  });
  const allCosts = selected.flatMap((option) => Object.values(option.travelerCosts));
  if (allCosts.some((cost) => cost.currency !== plan.currency)) {
    throw new Error("Plan contains mixed currencies");
  }

  const sum = (values: Money[]) =>
    values.length === 0 ? money("0", plan.currency) : addMoney(values);
  const required = selected.filter((option) => !option.optional && !option.covered);
  const optional = plan.items
    .flatMap((item) => item.alternatives)
    .filter((option) => option.optional);
  const covered = selected.filter((option) => option.covered);
  const subtotal = sum(required.flatMap((option) => Object.values(option.travelerCosts)));
  const contingency = money(
    new Decimal(subtotal.amount).times(plan.contingencyRate).toFixed(2),
    plan.currency,
  );
  const total = addMoney([subtotal, contingency]);
  const limit = plan.brief.strictBudget;
  const remaining = limit
    ? money(new Decimal(limit.amount).minus(total.amount).toFixed(2), plan.currency)
    : undefined;

  return {
    byCategory: sumByCategory(required, plan.currency),
    byTraveler: sumByTraveler(required, plan.brief.travelers, plan.currency),
    covered: sum(covered.flatMap((option) => Object.values(option.travelerCosts))),
    optional: sum(optional.flatMap((option) => Object.values(option.travelerCosts))),
    subtotal,
    contingency,
    total,
    perPerson: money(
      new Decimal(total.amount).div(plan.brief.travelers.length).toFixed(2),
      plan.currency,
    ),
    limit,
    remaining,
    withinStrictLimit: remaining ? new Decimal(remaining.amount).gte(0) : true,
  };
}

function addMoneyOrZero(values: Money[], currency: string): Money {
  return values.length === 0 ? money("0", currency) : addMoney(values);
}

function sumByCategory(
  options: PlanAlternative[],
  currency: string,
): Record<CostCategory, Money> {
  return Object.fromEntries(
    categories.map((category) => [
      category,
      addMoneyOrZero(
        options
          .filter((option) => option.category === category)
          .flatMap((option) => Object.values(option.travelerCosts)),
        currency,
      ),
    ]),
  ) as Record<CostCategory, Money>;
}

function sumByTraveler(
  options: PlanAlternative[],
  travelers: Traveler[],
  currency: string,
): Record<string, Money> {
  return Object.fromEntries(
    travelers.map((traveler) => [
      traveler.id,
      addMoneyOrZero(
        options.flatMap((option) =>
          option.travelerCosts[traveler.id]
            ? [option.travelerCosts[traveler.id]]
            : [],
        ),
        currency,
      ),
    ]),
  );
}
