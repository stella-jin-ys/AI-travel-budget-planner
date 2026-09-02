import type { TripBrief } from "@/features/trips/domain/trip";
import type { ProviderTripResult, TripDataProvider } from "./provider";

export class AITripProvider implements TripDataProvider {
  async search(brief: TripBrief): Promise<ProviderTripResult> {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brief),
    });
    const payload = await response.json() as ProviderTripResult & { error?: string };
    if (!response.ok || !payload.plan) throw new Error(payload.error ?? "The AI planner could not create a trip.");
    return payload;
  }
}
