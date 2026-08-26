import { formatMoney } from "../domain/money";
import { demoNow } from "../domain/readiness";
import type { TripWorkspaceState } from "../state/trip-reducer";
import { ErrataSlip } from "./errata-slip";

export function OverviewLeaf({ state }: { state: TripWorkspaceState }) {
  const selectedItems = state.plan.items.filter((item) => item.selectedAlternativeId);
  return (
    <div className="workspace-leaf">
      <div className="prism-heading"><div><small className="eyebrow">ACTIVE LEDGER</small><h1>Overview</h1></div><small>LAST CHECKED 24 AUG 2026 · 14:32</small></div>
      <div className="prism-hero"><div><small className="eyebrow">THE SHORT VERSION</small><h2 className="prism-plan-title">{state.plan.title}</h2><p className="prism-tagline"><em>kept under the line.</em></p><p>Route, stay, activities, and food are combined into one explainable plan. Review any highlighted source before booking.</p></div><div className="room-left"><small>ROOM LEFT</small><strong>{state.budget.remaining ? formatMoney(state.budget.remaining, "en-CH") : "—"}</strong></div></div>
      <div className="prism-table"><div className="prism-row head"><span>LINE ITEM</span><span>SOURCE</span><span>AMOUNT</span></div>{selectedItems.map((item) => { const option = item.alternatives.find((candidate) => candidate.id === item.selectedAlternativeId); if (!option) return null; return <div className="prism-row" key={item.id}><span>{item.label}</span><small>{option.evidence.status} estimate</small><strong>{formatMoney(Object.values(option.travelerCosts).reduce((sum, value) => ({ amount: (Number(sum.amount) + Number(value.amount)).toFixed(2), currency: value.currency }), { amount: "0", currency: state.plan.currency }), "en-CH")}</strong></div>; })}</div>

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
