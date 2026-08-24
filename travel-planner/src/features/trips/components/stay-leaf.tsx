import type { Dispatch } from "react";
import type {
  TripWorkspaceAction,
  TripWorkspaceState,
} from "../state/trip-reducer";
import { EditableItemList } from "./option-row";

export function StayLeaf({
  state,
  dispatch,
}: {
  state: TripWorkspaceState;
  dispatch: Dispatch<TripWorkspaceAction>;
}) {
  return (
    <div className="workspace-leaf">
      <h1>Stay</h1>
      <p className="leaf-intro">
        Compare the selected accommodation with its lower-cost and premium samples.
      </p>
      <EditableItemList state={state} dispatch={dispatch} section="stay" />
    </div>
  );
}
