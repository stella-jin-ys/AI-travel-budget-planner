import { describe, expect, it } from "vitest";
import { switzerlandFamilyBrief } from "@/features/trips/fixtures/switzerland-family";
import { SyntheticTripProvider } from "@/features/trips/providers/synthetic-provider";

describe("SyntheticTripProvider", () => {
  it("returns the same normalized plan for the same brief", async () => {
    const provider = new SyntheticTripProvider();
    const first = await provider.search(switzerlandFamilyBrief);
    const second = await provider.search(switzerlandFamilyBrief);

    expect(second).toEqual(first);
  });

  it("labels every source as synthetic", async () => {
    const result = await new SyntheticTripProvider().search(switzerlandFamilyBrief);

    expect(
      result.plan.items.every((item) =>
        item.alternatives.every((alternative) => alternative.evidence.synthetic),
      ),
    ).toBe(true);
  });

  it("provides a four-day family plan with every core cost category", async () => {
    const { plan } = await new SyntheticTripProvider().search(switzerlandFamilyBrief);

    expect(plan.brief).toMatchObject({
      origin: "Basel",
      destination: "Bernese Oberland",
      strictBudget: { amount: "1800.00", currency: "CHF" },
    });
    expect(plan.brief.travelers).toEqual([
      expect.objectContaining({ age: 38, eligibility: ["adult"] }),
      expect.objectContaining({ age: 10, eligibility: ["child", "family"] }),
    ]);
    expect(plan.days).toHaveLength(4);
    expect(new Set(plan.items.flatMap((item) => item.alternatives.map((alternative) => alternative.category)))).toEqual(
      new Set(["transport", "stay", "food", "activities", "local-transit"]),
    );
    expect(
      plan.items.flatMap((item) => item.alternatives).some(
        (alternative) => alternative.evidence.status === "typical",
      ),
    ).toBe(true);
    expect(
      plan.items.flatMap((item) => item.alternatives).some(
        (alternative) => alternative.evidence.status === "stale",
      ),
    ).toBe(true);
  });
});
