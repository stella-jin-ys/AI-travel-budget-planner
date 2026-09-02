import type { TripBrief } from "@/features/trips/domain/trip";
import type { ProviderTripResult, TripDataProvider } from "./provider";

export class AITripProvider implements TripDataProvider {
  async search(brief: TripBrief): Promise<ProviderTripResult> {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brief),
    });
    const contentType = typeof response.headers?.get === "function"
      ? response.headers.get("content-type") ?? ""
      : "";
    const isJson = contentType.includes("application/json");
    const endpointUnavailable = (response.status === 404 || response.status === 405) && !isJson;
    if (endpointUnavailable || (contentType && !isJson)) {
      throw new Error(
        endpointUnavailable
          ? "The AI planner endpoint is unavailable on this deployment."
          : "The AI planner returned an invalid response. Please try again.",
      );
    }

    let payload: ProviderTripResult & { error?: string };
    try {
      payload = await response.json() as ProviderTripResult & { error?: string };
    } catch {
      throw new Error("The AI planner returned an invalid response. Please try again.");
    }

    if (!response.ok || !payload.plan) throw new Error(payload.error ?? "The AI planner could not create a trip.");
    return payload;
  }
}
