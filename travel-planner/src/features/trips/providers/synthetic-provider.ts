import { buildSwitzerlandFamilyTrip } from "@/features/trips/fixtures/switzerland-family";
import type { TripBrief } from "@/features/trips/domain/trip";
import type { ProviderTripResult, TripDataProvider } from "./provider";

export class SyntheticTripProvider implements TripDataProvider {
  async search(brief: TripBrief): Promise<ProviderTripResult> {
    const plan = structuredClone(buildSwitzerlandFamilyTrip());
    plan.brief = structuredClone(brief);
    plan.title = brief.destination
      ? `${brief.origin} to ${brief.destination} travel plan`
      : "Recommended travel plan";

    return {
      plan,
      retrievedAt: "2026-08-24T10:00:00Z",
      providerId: "synthetic-switzerland-v1",
    };
  }
}
