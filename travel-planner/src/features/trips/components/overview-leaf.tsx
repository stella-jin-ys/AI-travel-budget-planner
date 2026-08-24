import { formatMoney } from "../domain/money";
import { demoNow } from "../domain/readiness";
import type { TripWorkspaceState } from "../state/trip-reducer";
import { ErrataSlip } from "./errata-slip";

const readinessLabels = {
  draft: "Draft",
  "review-needed": "Review needed",
  "ready-to-book": "Ready to book",
} as const;

export function OverviewLeaf({ state }: { state: TripWorkspaceState }) {
  return (
    <div className="workspace-leaf">
      <h1>Overview</h1>
      <h2 className="leaf-intro">{state.plan.title}</h2>
      <dl className="fact-list">
        <div>
          <dt>Dates</dt>
          <dd>{state.plan.brief.startDate} to {state.plan.brief.endDate}</dd>
        </div>
        <div>
          <dt>Travelers</dt>
          <dd>{state.plan.brief.travelers.length}</dd>
        </div>
        <div>
          <dt>Readiness</dt>
          <dd>{readinessLabels[state.readiness.state]}</dd>
        </div>
        <div>
          <dt>Group total</dt>
          <dd>{formatMoney(state.budget.total, "en-CH")}</dd>
        </div>
      </dl>

      {state.readiness.issues.length > 0 ? (
        <section aria-labelledby="overview-warnings">
          <h2 id="overview-warnings">Key warnings</h2>
          {state.readiness.issues.map((issue, index) => (
            <ErrataSlip
              issue={issue}
              now={demoNow}
              key={`${issue.itemId}-${issue.status}-${index}`}
            />
          ))}
        </section>
      ) : (
        <p>No blocking or high-impact warnings.</p>
      )}
    </div>
  );
}
