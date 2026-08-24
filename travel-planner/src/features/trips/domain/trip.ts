export type SourceStatus =
  | "live"
  | "recent"
  | "typical"
  | "stale"
  | "conflicting"
  | "unavailable"
  | "failed";

export type PlanSection =
  | "overview"
  | "travel"
  | "stay"
  | "days"
  | "food"
  | "budget"
  | "checks";

export interface Money {
  amount: string;
  currency: string;
}

export interface SourceEvidence {
  status: SourceStatus;
  supplierName: string;
  checkedAt: string;
  sourceUrl?: string;
  reason?: string;
  synthetic: boolean;
}

export type CostCategory =
  | "transport"
  | "stay"
  | "food"
  | "activities"
  | "local-transit";

export interface Traveler {
  id: string;
  name: string;
  age: number;
  eligibility: Array<"adult" | "child" | "student" | "family">;
}

export interface TripBrief {
  mode: "known-destination" | "inspire-me";
  origin: string;
  destination?: string;
  startDate: string;
  endDate: string;
  travelers: Traveler[];
  interests: string[];
  strictBudget?: Money;
  fixtureId?: "switzerland-family";
}

export interface PlanAlternative {
  id: string;
  label: string;
  category: CostCategory;
  travelerCosts: Record<string, Money>;
  covered: boolean;
  optional: boolean;
  evidence: SourceEvidence;
}

export interface PlanItem {
  id: string;
  section: PlanSection;
  label: string;
  required: boolean;
  selectedAlternativeId: string;
  alternatives: PlanAlternative[];
  connectionFeasible?: boolean;
}

export interface TripPlan {
  id: string;
  title: string;
  currency: string;
  brief: TripBrief;
  items: PlanItem[];
  days: ItineraryDay[];
  completeSections: PlanSection[];
  contingencyRate: string;
}

export interface ItineraryEntry {
  id: string;
  planItemId: string;
  label: string;
  startsAt: string;
  endsAt: string;
  directionsUrl?: string;
}

export interface ItineraryDay {
  id: string;
  date: string;
  title: string;
  items: ItineraryEntry[];
}
