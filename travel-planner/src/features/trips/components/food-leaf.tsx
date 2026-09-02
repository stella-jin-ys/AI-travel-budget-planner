import Decimal from "decimal.js";
import type { Dispatch } from "react";
import { formatMoney, money } from "../domain/money";
import type {
  TripWorkspaceAction,
  TripWorkspaceState,
} from "../state/trip-reducer";
import { EditableItemList } from "./option-row";

export function FoodLeaf({
  state,
  dispatch,
}: {
  state: TripWorkspaceState;
  dispatch: Dispatch<TripWorkspaceAction>;
}) {
  const days = Math.max(state.plan.days.length, 1);
  const dailyAllowance = money(
    new Decimal(state.budget.byCategory.food.amount).div(days).toFixed(2),
    state.plan.currency,
  );

  return (
    <div className="workspace-leaf">
      <h1>Food</h1>
      <p className="leaf-intro">
        Balance restaurant, takeaway, and supermarket choices in the AI estimate.
      </p>
      <dl className="fact-list fact-list--compact">
        <div>
          <dt>Daily group allowance</dt>
          <dd>{formatMoney(dailyAllowance, "en-CH")}</dd>
        </div>
      </dl>
      <EditableItemList state={state} dispatch={dispatch} section="food" />
    </div>
  );
}
