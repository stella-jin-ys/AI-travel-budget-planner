import { buildSwitzerlandFamilyTrip } from "@/features/trips/fixtures/switzerland-family";
import type { TripBrief } from "@/features/trips/domain/trip";
import type { ProviderTripResult, TripDataProvider } from "./provider";

export class SyntheticTripProvider implements TripDataProvider {
  async search(brief: TripBrief): Promise<ProviderTripResult> {
    if (brief.fixtureId !== "switzerland-family") {
      throw new Error("This synthetic release supports only switzerland-family");
    }

    return {
      plan: structuredClone(buildSwitzerlandFamilyTrip()),
      retrievedAt: "2026-08-24T10:00:00Z",
      providerId: "synthetic-switzerland-v1",
    };
  }
}
