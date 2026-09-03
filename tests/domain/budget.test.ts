import { describe, expect, it } from "vitest";
import { calculateBudget } from "@/features/trips/domain/budget";
import { makeTripPlan } from "../support/make-trip-plan";

describe("calculateBudget", () => {
  it("separates covered, required, and optional costs", () => {
    const summary = calculateBudget(
      makeTripPlan({ strictLimit: "1000.00", contingencyRate: "0.10" }),
    );
    expect(summary.byCategory.transport.amount).toBe("506.20");
    expect(summary.optional.amount).toBe("80.00");
    expect(summary.covered.amount).toBe("0.00");
  });

  it("reports a strict-limit shortfall without hiding contingency", () => {
    const summary = calculateBudget(
      makeTripPlan({ strictLimit: "700.00", contingencyRate: "0.10" }),
    );
    expect(summary.withinStrictLimit).toBe(false);
    expect(summary.remaining?.amount.startsWith("-")).toBe(true);
    expect(summary.contingency.amount).not.toBe("0.00");
  });

  it("calculates category, traveler, and aggregate totals independently", () => {
    const summary = calculateBudget(makeTripPlan());

    expect(summary.byCategory).toEqual({
      transport: { amount: "506.20", currency: "CHF" },
      stay: { amount: "420.00", currency: "CHF" },
      food: { amount: "180.00", currency: "CHF" },
      activities: { amount: "120.00", currency: "CHF" },
      "local-transit": { amount: "0.00", currency: "CHF" },
    });
    expect(summary.byTraveler).toEqual({
      "adult-1": { amount: "986.20", currency: "CHF" },
      "child-1": { amount: "240.00", currency: "CHF" },
    });
    expect(summary.subtotal).toEqual({ amount: "1226.20", currency: "CHF" });
    expect(summary.contingency).toEqual({ amount: "122.62", currency: "CHF" });
    expect(summary.total).toEqual({ amount: "1348.82", currency: "CHF" });
    expect(summary.perPerson).toEqual({ amount: "674.41", currency: "CHF" });
  });

  it("rejects a foreign currency in an unselected optional alternative", () => {
    const plan = makeTripPlan();
    plan.items[4].alternatives[1].travelerCosts["adult-1"].currency = "EUR";

    expect(() => calculateBudget(plan)).toThrow("Plan contains mixed currencies");
  });

  it("rejects a foreign currency in a selected alternative", () => {
    const plan = makeTripPlan();
    plan.items[0].alternatives[0].travelerCosts["adult-1"].currency = "EUR";

    expect(() => calculateBudget(plan)).toThrow("Plan contains mixed currencies");
  });

  it("rejects a strict limit in a foreign currency", () => {
    const plan = makeTripPlan({ strictLimit: "1348.82" });
    plan.brief.strictBudget!.currency = "EUR";

    expect(() => calculateBudget(plan)).toThrow("Plan contains mixed currencies");
  });

  it("rejects an item whose selected alternative is missing", () => {
    const plan = makeTripPlan();
    plan.items[0].selectedAlternativeId = "missing";

    expect(() => calculateBudget(plan)).toThrow(
      "Missing selected alternative for transport-one-item",
    );
  });

  it("leaves strict-limit fields absent when no limit is supplied", () => {
    const summary = calculateBudget(makeTripPlan());

    expect(summary.limit).toBeUndefined();
    expect(summary.remaining).toBeUndefined();
    expect(summary.withinStrictLimit).toBe(true);
  });

  it("accepts an exact strict limit", () => {
    const summary = calculateBudget(makeTripPlan({ strictLimit: "1348.82" }));

    expect(summary.remaining).toEqual({ amount: "0.00", currency: "CHF" });
    expect(summary.withinStrictLimit).toBe(true);
  });
});
