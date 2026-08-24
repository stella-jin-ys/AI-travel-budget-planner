"use client";

import type { Dispatch } from "react";
import { demoNow } from "../domain/readiness";
import type { TripPlan } from "../domain/trip";
import type {
  TripWorkspaceAction,
  TripWorkspaceState,
} from "../state/trip-reducer";
import { useTripWorkspace } from "../state/use-trip-workspace";
import { BudgetLeaf } from "./budget-leaf";
import { ChecksLeaf } from "./checks-leaf";
import { DaysLeaf } from "./days-leaf";
import { FoodLeaf } from "./food-leaf";
import { ManualShell } from "./manual-shell";
import { MobileToday } from "./mobile-today";
import { OverviewLeaf } from "./overview-leaf";
import { StayLeaf } from "./stay-leaf";
import { TravelLeaf } from "./travel-leaf";

export function ActiveLeaf({
  state,
  dispatch,
}: {
  state: TripWorkspaceState;
  dispatch: Dispatch<TripWorkspaceAction>;
}) {
  switch (state.activeSection) {
    case "overview":
      return <OverviewLeaf state={state} />;
    case "travel":
      return <TravelLeaf state={state} dispatch={dispatch} />;
    case "stay":
      return <StayLeaf state={state} dispatch={dispatch} />;
    case "days":
      return <DaysLeaf state={state} dispatch={dispatch} />;
    case "food":
      return <FoodLeaf state={state} dispatch={dispatch} />;
    case "budget":
      return (
        <BudgetLeaf
          budget={state.budget}
          travelers={state.plan.brief.travelers}
        />
      );
    case "checks":
      return <ChecksLeaf plan={state.plan} readiness={state.readiness} />;
  }

  state.activeSection satisfies never;
}

export function TripWorkspace({ initialPlan }: { initialPlan: TripPlan }) {
  const { state, dispatch } = useTripWorkspace(initialPlan);

  return (
    <ManualShell
      state={state}
      onSectionChange={(section) =>
        dispatch({ type: "set-section", section })
      }
      mobileToday={<MobileToday plan={state.plan} now={demoNow} />}
      chat={
        <div className="workspace-chat">
          <h2>Guided trip brief</h2>
          <dl>
            <div>
              <dt>Origin</dt>
              <dd>{state.plan.brief.origin}</dd>
            </div>
            <div>
              <dt>Destination</dt>
              <dd>{state.plan.brief.destination ?? "Bernese Oberland"}</dd>
            </div>
            <div>
              <dt>Dates</dt>
              <dd>
                {state.plan.brief.startDate} to {state.plan.brief.endDate}
              </dd>
            </div>
          </dl>
          <p>No live search or booking availability is represented.</p>
        </div>
      }
      leaf={<ActiveLeaf state={state} dispatch={dispatch} />}
    />
  );
}
