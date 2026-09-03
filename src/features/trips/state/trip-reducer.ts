import { calculateBudget, type BudgetSummary } from "../domain/budget";
import {
  defaultFreshnessPolicy,
  demoNow,
  evaluateReadiness,
  type ReadinessResult,
} from "../domain/readiness";
import type { PlanSection, TripPlan } from "../domain/trip";

export interface TripWorkspaceState {
  plan: TripPlan;
  budget: BudgetSummary;
  readiness: ReadinessResult;
  lockedItemIds: string[];
  history: TripPlan[];
  activeSection: PlanSection;
  selectedDayId?: string;
}

export type TripWorkspaceAction =
  | { type: "replace-option"; itemId: string; alternativeId: string }
  | { type: "toggle-lock"; itemId: string }
  | { type: "undo" }
  | { type: "set-section"; section: PlanSection }
  | { type: "set-day"; dayId: string };

export class LockedItemError extends Error {
  constructor() {
    super("Unlock this item before replacing it");
    this.name = "LockedItemError";
  }
}

export function createWorkspace(plan: TripPlan): TripWorkspaceState {
  const budget = calculateBudget(plan);

  return {
    plan,
    budget,
    readiness: evaluateReadiness(plan, budget, defaultFreshnessPolicy, demoNow),
    lockedItemIds: [],
    history: [],
    activeSection: "overview",
  };
}

export function tripReducer(
  state: TripWorkspaceState,
  action: TripWorkspaceAction,
): TripWorkspaceState {
  if (action.type === "undo") {
    const plan = state.history.at(-1);
    if (!plan) return state;

    const budget = calculateBudget(plan);
    return {
      ...state,
      plan,
      budget,
      readiness: evaluateReadiness(plan, budget, defaultFreshnessPolicy, demoNow),
      history: state.history.slice(0, -1),
    };
  }

  if (action.type === "set-section") {
    return { ...state, activeSection: action.section };
  }

  if (action.type === "toggle-lock") {
    const locked = new Set(state.lockedItemIds);
    if (locked.has(action.itemId)) {
      locked.delete(action.itemId);
    } else {
      locked.add(action.itemId);
    }
    return { ...state, lockedItemIds: [...locked] };
  }

  if (action.type === "replace-option") {
    if (!state.plan.items.some((item) => item.id === action.itemId)) {
      throw new Error(`Missing plan item for ${action.itemId}`);
    }
    if (state.lockedItemIds.includes(action.itemId)) throw new LockedItemError();

    const plan = {
      ...state.plan,
      items: state.plan.items.map((item) =>
        item.id === action.itemId
          ? { ...item, selectedAlternativeId: action.alternativeId }
          : item,
      ),
    };
    const budget = calculateBudget(plan);

    return {
      ...state,
      plan,
      budget,
      readiness: evaluateReadiness(plan, budget, defaultFreshnessPolicy, demoNow),
      history: [...state.history.slice(-19), state.plan],
    };
  }

  return { ...state, selectedDayId: action.dayId };
}
