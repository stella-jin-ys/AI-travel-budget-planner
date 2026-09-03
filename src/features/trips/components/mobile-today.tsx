import { calculateBudget } from "../domain/budget";
import { formatMoney } from "../domain/money";
import {
  defaultFreshnessPolicy,
  evaluateReadiness,
} from "../domain/readiness";
import type { TripPlan } from "../domain/trip";
import { ErrataSlip } from "./errata-slip";

export function MobileToday({ plan, now }: { plan: TripPlan; now: Date }) {
  const budget = calculateBudget(plan);
  const readiness = evaluateReadiness(
    plan,
    budget,
    defaultFreshnessPolicy,
    now,
  );
  const date = now.toISOString().slice(0, 10);
  const day = plan.days.find((candidate) => candidate.date === date) ?? plan.days[0];
  const next = day?.items.find((item) => new Date(item.endsAt) > now);
  const currentIssue = readiness.issues.find(
    (issue) => issue.itemId === next?.planItemId,
  ) ?? readiness.issues[0];

  return (
    <section className="mobile-today" aria-label="Today on your trip">
      <header className="mobile-today__status">
        <span>Group total</span>
        <strong>{formatMoney(budget.total, "en-CH")}</strong>
      </header>
      <div className="mobile-today__body">
        <h1>{day?.title ?? "Today"}</h1>
        <section aria-labelledby="next-heading">
          <h2 id="next-heading">Next</h2>
          {next ? (
            <article className="mobile-today__next">
              <h3>{next.label}</h3>
              <p>
                <time dateTime={next.startsAt}>{localTime(next.startsAt)}</time>
                {"-"}
                <time dateTime={next.endsAt}>{localTime(next.endsAt)}</time>
              </p>
              {next.directionsUrl ? (
                <a href={next.directionsUrl} target="_blank" rel="noreferrer">
                  Directions
                </a>
              ) : null}
            </article>
          ) : (
            <p>No more scheduled items today.</p>
          )}
        </section>
        {currentIssue ? <ErrataSlip issue={currentIssue} now={now} /> : null}
      </div>
    </section>
  );
}

function localTime(value: string) {
  return value.slice(11, 16);
}
