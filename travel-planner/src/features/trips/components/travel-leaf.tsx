import type { Dispatch } from "react";
import type {
  TripWorkspaceAction,
  TripWorkspaceState,
} from "../state/trip-reducer";
import { EditableItemList } from "./option-row";

export function TravelLeaf({
  state,
  dispatch,
}: {
  state: TripWorkspaceState;
  dispatch: Dispatch<TripWorkspaceAction>;
}) {
  return (
    <div className="workspace-leaf">
      <h1>Travel</h1>
      <p className="leaf-intro">
        Door-to-door legs, transfer timing, and the synthetic pass comparison.
      </p>
      <EditableItemList state={state} dispatch={dispatch} section="travel" />
    </div>
  );
}
