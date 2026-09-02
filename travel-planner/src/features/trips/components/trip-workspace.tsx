import type { TripPlan } from "../domain/trip";
import { useTripWorkspace } from "../state/use-trip-workspace";
import { ManualShell } from "./manual-shell";
import { OverviewLeaf } from "./overview-leaf";
import { AppNav, type AppNavProps } from "./app-nav";

export function TripWorkspace({ initialPlan, onEditBrief, navigation }: { initialPlan: TripPlan; onEditBrief?: () => void; navigation?: AppNavProps }) {
  const { state, dispatch } = useTripWorkspace(initialPlan);

  return (
    <div className="workspace-with-nav">
      <AppNav {...navigation} context="AI plan" />
      <ManualShell
        state={state}
        onBack={onEditBrief}
        chat={
          <div className="workspace-chat">
            <h2>{state.plan.brief.origin} to<br /><em>{state.plan.brief.destination ?? "your destination"}</em></h2>
            <p className="chat-summary">A feasible plan with practical transfers, stay options, and a visible budget ceiling.</p>
            <button type="button" className="chat-edit" onClick={onEditBrief}>Edit brief</button>
          </div>
        }
        leaf={<OverviewLeaf state={state} dispatch={dispatch} />}
      />
    </div>
  );
}
