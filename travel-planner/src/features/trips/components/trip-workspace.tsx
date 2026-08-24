"use client";

import type { ReactNode } from "react";
import type { PlanSection, TripPlan } from "../domain/trip";
import { useTripWorkspace } from "../state/use-trip-workspace";
import { ManualShell } from "./manual-shell";

const sectionNotes: Record<Exclude<PlanSection, "overview">, string> = {
  travel: "Review the sample rail and local transport choices.",
  stay: "Review the sample family accommodation.",
  days: "Review the deterministic daily outline.",
  food: "Review the sample family meal allowance.",
  budget: "Review costs for the group and each traveller.",
  checks: "Review freshness and supplier-check reminders.",
};

function sectionLeaf(section: PlanSection, plan: TripPlan): ReactNode {
  switch (section) {
    case "overview":
      return (
        <div className="workspace-leaf">
          <h1>{plan.title}</h1>
          <p>
            This open manual is a deterministic planning fixture. Use the tabs
            to inspect its structure before any booking decision.
          </p>
        </div>
      );
    case "travel":
      return <PlaceholderLeaf title="Travel" note={sectionNotes.travel} />;
    case "stay":
      return <PlaceholderLeaf title="Stay" note={sectionNotes.stay} />;
    case "days":
      return <PlaceholderLeaf title="Days" note={sectionNotes.days} />;
    case "food":
      return <PlaceholderLeaf title="Food" note={sectionNotes.food} />;
    case "budget":
      return <PlaceholderLeaf title="Budget" note={sectionNotes.budget} />;
    case "checks":
      return <PlaceholderLeaf title="Checks" note={sectionNotes.checks} />;
  }

  section satisfies never;
}

function PlaceholderLeaf({ title, note }: { title: string; note: string }) {
  return (
    <div className="workspace-leaf">
      <h1>{title}</h1>
      <p>{note}</p>
    </div>
  );
}

export function TripWorkspace({ initialPlan }: { initialPlan: TripPlan }) {
  const { state, dispatch } = useTripWorkspace(initialPlan);

  return (
    <ManualShell
      state={state}
      onSectionChange={(section) =>
        dispatch({ type: "set-section", section })
      }
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
      leaf={sectionLeaf(state.activeSection, state.plan)}
    />
  );
}
