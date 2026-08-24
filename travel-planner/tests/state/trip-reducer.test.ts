import { describe, expect, it } from "vitest";
import {
  createWorkspace,
  LockedItemError,
  tripReducer,
} from "@/features/trips/state/trip-reducer";
import type { TripWorkspaceState } from "@/features/trips/state/trip-reducer";
import { makeTripPlan } from "../support/make-trip-plan";

function makePlanWithReplaceableStay() {
  const plan = makeTripPlan();

  return {
    ...plan,
    items: plan.items.map((item) =>
      item.id === "stay-item"
        ? {
            ...item,
            id: "stay-main",
            selectedAlternativeId: "stay-main",
            alternatives: [
              { ...item.alternatives[0], id: "stay-main" },
              {
                ...item.alternatives[0],
                id: "stay-budget",
                travelerCosts: {
                  "adult-1": { amount: "180.00", currency: "CHF" },
                  "child-1": { amount: "90.00", currency: "CHF" },
                },
              },
            ],
          }
        : item,
    ),
  };
}

describe("tripReducer", () => {
  it("replaces an unlocked option and recalculates the total", () => {
    const initial = createWorkspace(makePlanWithReplaceableStay());
    const next = tripReducer(initial, {
      type: "replace-option",
      itemId: "stay-main",
      alternativeId: "stay-budget",
    });

    expect(
      next.plan.items.find((item) => item.id === "stay-main")?.selectedAlternativeId,
    ).toBe("stay-budget");
    expect(next.budget.total.amount).toBe("1183.82");
  });

  it("refuses to replace a locked item", () => {
    const locked = tripReducer(createWorkspace(makePlanWithReplaceableStay()), {
      type: "toggle-lock",
      itemId: "stay-main",
    });

    expect(() =>
      tripReducer(locked, {
        type: "replace-option",
        itemId: "stay-main",
        alternativeId: "stay-budget",
      }),
    ).toThrow(LockedItemError);
    expect(() =>
      tripReducer(locked, {
        type: "replace-option",
        itemId: "stay-main",
        alternativeId: "stay-budget",
      }),
    ).toThrow("Unlock this item before replacing it");
  });

  it("undoes the last replacement", () => {
    const initial = createWorkspace(makePlanWithReplaceableStay());
    const changed = tripReducer(initial, {
      type: "replace-option",
      itemId: "stay-main",
      alternativeId: "stay-budget",
    });

    expect(tripReducer(changed, { type: "undo" }).plan).toEqual(initial.plan);
  });

  it("leaves the state unchanged when undo history is empty", () => {
    const initial = createWorkspace(makePlanWithReplaceableStay());

    expect(tripReducer(initial, { type: "undo" })).toBe(initial);
  });

  it("keeps the most recent twenty plan snapshots", () => {
    const initial = createWorkspace(makePlanWithReplaceableStay());
    const state = Array.from({ length: 21 }).reduce<TripWorkspaceState>(
      (workspace, _, index) =>
        tripReducer(workspace, {
          type: "replace-option",
          itemId: "stay-main",
          alternativeId: index % 2 === 0 ? "stay-budget" : "stay-main",
        }),
      initial,
    );

    expect(state.history).toHaveLength(20);
  });

  it("updates navigation state without changing the plan", () => {
    const initial = createWorkspace(makePlanWithReplaceableStay());
    const sectionState = tripReducer(initial, { type: "set-section", section: "stay" });
    const dayState = tripReducer(sectionState, { type: "set-day", dayId: "day-2" });

    expect(dayState.activeSection).toBe("stay");
    expect(dayState.selectedDayId).toBe("day-2");
    expect(dayState.plan).toBe(initial.plan);
  });
});
