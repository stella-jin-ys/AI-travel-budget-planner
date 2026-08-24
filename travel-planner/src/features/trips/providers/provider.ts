import type { TripBrief, TripPlan } from "@/features/trips/domain/trip";

export interface ProviderTripResult {
  plan: TripPlan;
  retrievedAt: string;
  providerId: string;
}

export interface TripDataProvider {
  search(brief: TripBrief): Promise<ProviderTripResult>;
}
