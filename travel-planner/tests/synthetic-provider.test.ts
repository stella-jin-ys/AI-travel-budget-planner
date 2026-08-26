import { describe, expect, it } from "vitest";
import type { TripBrief } from "@/features/trips/domain/trip";
import { SyntheticTripProvider } from "@/features/trips/providers/synthetic-provider";

describe("SyntheticTripProvider", () => {
  it("builds the plan brief from the submitted user input", async () => {
    const brief: TripBrief = {
      fixtureId: "switzerland-family",
      mode: "known-destination",
      origin: "Zurich",
      destination: "Lucerne",
      startDate: "2027-06-01",
      endDate: "2027-06-04",
      travelers: [{ id: "adult-1", name: "Adult", age: 30, eligibility: ["adult"] }],
      interests: ["museums"],
    };

    const result = await new SyntheticTripProvider().search(brief);

    expect(result.plan.brief).toMatchObject(brief);
  });
});
