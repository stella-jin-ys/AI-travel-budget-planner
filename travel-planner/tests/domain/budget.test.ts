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
});
