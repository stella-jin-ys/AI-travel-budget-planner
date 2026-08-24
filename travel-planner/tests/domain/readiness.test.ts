import { describe, expect, it } from "vitest";
import { calculateBudget } from "@/features/trips/domain/budget";
import { evaluateReadiness } from "@/features/trips/domain/readiness";
import type { SourceStatus, TripPlan } from "@/features/trips/domain/trip";
import { makeTripPlan } from "../support/make-trip-plan";

const policy = {
  live: 15 * 60_000,
  recent: 24 * 60 * 60_000,
  typical: 30 * 24 * 60 * 60_000,
};
const now = new Date("2026-08-24T10:00:00Z");

function completePlan(): TripPlan {
  const plan = makeTripPlan();
  plan.completeSections = ["overview", "travel", "stay", "days", "food", "budget"];
  for (const item of plan.items) {
    item.alternatives[0].evidence = {
      ...item.alternatives[0].evidence,
      status: "live",
      checkedAt: "2026-08-24T09:50:00Z",
    };
  }
  return plan;
}

function selectedStatus(plan: TripPlan, itemIndex: number, status: SourceStatus) {
  plan.items[itemIndex].alternatives[0].evidence.status = status;
}

describe("evaluateReadiness", () => {
  it("attaches an expired recent warning to its affected item", () => {
    const plan = completePlan();
    selectedStatus(plan, 0, "recent");
    plan.items[0].alternatives[0].evidence.checkedAt = "2026-08-20T10:00:00Z";

    const result = evaluateReadiness(plan, calculateBudget(plan), policy, now);

    expect(result.state).toBe("review-needed");
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        itemId: "transport-one-item",
        severity: "warning",
        status: "stale",
        message: "Stale estimate",
        impact: "Price or availability may change",
        checkedAt: "2026-08-20T10:00:00Z",
        supplierName: "Fixture supplier",
      }),
    );
    expect(plan.items[0].alternatives[0].evidence.status).toBe("recent");
  });

  it("blocks ready status for an impossible connection", () => {
    const plan = completePlan();
    plan.items[0].connectionFeasible = false;

    const result = evaluateReadiness(plan, calculateBudget(plan), policy, now);

    expect(result.state).toBe("draft");
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        itemId: "transport-one-item",
        severity: "blocking",
        status: "failed",
        message: "Connection is not feasible",
      }),
    );
  });

  it("returns ready-to-book only for a complete plan with current evidence", () => {
    const plan = completePlan();

    const result = evaluateReadiness(plan, calculateBudget(plan), policy, now);

    expect(result).toEqual({ state: "ready-to-book", issues: [] });
  });

  it("keeps an incomplete plan in draft even when its evidence is current", () => {
    const plan = completePlan();
    plan.completeSections = ["overview", "travel", "stay", "food", "budget"];

    const result = evaluateReadiness(plan, calculateBudget(plan), policy, now);

    expect(result).toEqual({ state: "draft", issues: [] });
  });

  it("flags a strict-budget shortfall as a review issue", () => {
    const plan = completePlan();
    plan.brief.strictBudget = { amount: "700.00", currency: "CHF" };

    const result = evaluateReadiness(plan, calculateBudget(plan), policy, now);

    expect(result.state).toBe("review-needed");
    expect(result.issues).toContainEqual({
      itemId: "budget",
      severity: "warning",
      status: "conflicting",
      message: "Strict budget exceeded",
      impact: "Shortfall -648.82 CHF",
      checkedAt: "2026-08-24T10:00:00.000Z",
      supplierName: "Budget engine",
    });
  });
});
