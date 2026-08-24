import { money } from "@/features/trips/domain/money";
import type {
  PlanAlternative,
  PlanItem,
  SourceEvidence,
  TripBrief,
  TripPlan,
} from "@/features/trips/domain/trip";

const currency = "CHF";
const adultId = "adult-1";
const childId = "child-1";

export const switzerlandFamilyBrief: TripBrief = {
  mode: "known-destination",
  origin: "Basel",
  destination: "Bernese Oberland",
  startDate: "2026-09-10",
  endDate: "2026-09-13",
  travelers: [
    {
      id: adultId,
      name: "Alex (synthetic traveller)",
      age: 38,
      eligibility: ["adult"],
    },
    {
      id: childId,
      name: "Mia (synthetic traveller)",
      age: 10,
      eligibility: ["child", "family"],
    },
  ],
  interests: ["mountain railways", "easy walks", "family museums"],
  strictBudget: money("1800.00", currency),
  fixtureId: "switzerland-family",
};

function evidence(
  status: SourceEvidence["status"],
  supplierName: string,
  sourceUrl: string,
  reason: string,
): SourceEvidence {
  return {
    status,
    supplierName: `Synthetic ${supplierName}`,
    checkedAt: "2026-08-24T10:00:00Z",
    sourceUrl,
    reason: `Synthetic demonstration data: ${reason}`,
    synthetic: true,
  };
}

function alternative(
  id: string,
  label: string,
  category: PlanAlternative["category"],
  adultAmount: string,
  childAmount: string,
  source: SourceEvidence,
  options: Pick<PlanAlternative, "covered" | "optional"> = {
    covered: false,
    optional: false,
  },
): PlanAlternative {
  return {
    id,
    label: `Synthetic: ${label}`,
    category,
    travelerCosts: {
      [adultId]: money(adultAmount, currency),
      [childId]: money(childAmount, currency),
    },
    ...options,
    evidence: source,
  };
}

function item(
  id: string,
  section: PlanItem["section"],
  label: string,
  selectedAlternativeId: string,
  alternatives: PlanAlternative[],
  connectionFeasible?: boolean,
): PlanItem {
  return {
    id,
    section,
    label: `Synthetic: ${label}`,
    required: true,
    selectedAlternativeId,
    alternatives,
    ...(connectionFeasible === undefined ? {} : { connectionFeasible }),
  };
}

export function buildSwitzerlandFamilyTrip(): TripPlan {
  const railTransfer = alternative(
    "basel-to-interlaken-rail",
    "Basel to Interlaken rail schedule",
    "transport",
    "148.00",
    "74.00",
    evidence(
      "recent",
      "Alpine Rail Demo",
      "https://example.invalid/synthetic/alpine-rail/basel-interlaken",
      "A sample family rail fare and timetable.",
    ),
  );
  const coachTransfer = alternative(
    "basel-to-interlaken-coach",
    "Basel to Interlaken coach (cheaper alternative)",
    "transport",
    "96.00",
    "48.00",
    evidence(
      "typical",
      "Alpine Coach Demo",
      "https://example.invalid/synthetic/alpine-coach/basel-interlaken",
      "A typical synthetic estimate, not an available service.",
    ),
  );
  const flexRailTransfer = alternative(
    "basel-to-interlaken-flex-rail",
    "Basel to Interlaken flexible rail (premium alternative)",
    "transport",
    "220.00",
    "110.00",
    evidence(
      "live",
      "Alpine Rail Flex Demo",
      "https://example.invalid/synthetic/alpine-rail/flexible",
      "A premium synthetic fare example.",
    ),
  );

  const familyRoom = alternative(
    "alpine-family-room",
    "three-night family room",
    "stay",
    "540.00",
    "0.00",
    evidence(
      "recent",
      "Alpenblick Lodge Demo",
      "https://example.invalid/synthetic/alpenblick/family-room",
      "A sample three-night family-room price.",
    ),
  );
  const hostelRoom = alternative(
    "alpine-hostel-room",
    "three-night family hostel room (cheaper alternative)",
    "stay",
    "390.00",
    "0.00",
    evidence(
      "typical",
      "Mountain Hostel Demo",
      "https://example.invalid/synthetic/mountain-hostel/family-room",
      "A typical synthetic estimate, not current availability.",
    ),
  );
  const suite = alternative(
    "alpine-family-suite",
    "three-night family suite (premium alternative)",
    "stay",
    "840.00",
    "0.00",
    evidence(
      "stale",
      "Peak View Suite Demo",
      "https://example.invalid/synthetic/peak-view/family-suite",
      "Stale synthetic sample; confirmation would be required.",
    ),
  );

  const meals = alternative(
    "family-meals",
    "family meals allowance",
    "food",
    "210.00",
    "120.00",
    evidence(
      "typical",
      "Bernese Dining Demo",
      "https://example.invalid/synthetic/bernese-dining/family-meals",
      "A typical synthetic meal allowance.",
    ),
  );
  const picnicMeals = alternative(
    "family-picnic-meals",
    "family picnic allowance (cheaper alternative)",
    "food",
    "150.00",
    "78.00",
    evidence(
      "recent",
      "Bernese Picnic Demo",
      "https://example.invalid/synthetic/bernese-picnic/family-meals",
      "A lower-cost synthetic meal example.",
    ),
  );
  const restaurantMeals = alternative(
    "family-restaurant-meals",
    "family restaurant allowance (premium alternative)",
    "food",
    "340.00",
    "190.00",
    evidence(
      "stale",
      "Bernese Restaurant Demo",
      "https://example.invalid/synthetic/bernese-restaurant/family-meals",
      "Stale synthetic price demonstration.",
    ),
    { covered: false, optional: true },
  );

  const activityBundle = alternative(
    "family-activity-bundle",
    "family mountain and museum activity bundle",
    "activities",
    "170.00",
    "75.00",
    evidence(
      "recent",
      "Jungfrau Family Demo",
      "https://example.invalid/synthetic/jungfrau-family/activity-bundle",
      "A sample activity bundle.",
    ),
  );
  const lowCostActivities = alternative(
    "family-low-cost-activities",
    "self-guided activities (cheaper alternative)",
    "activities",
    "70.00",
    "35.00",
    evidence(
      "typical",
      "Bernese Trails Demo",
      "https://example.invalid/synthetic/bernese-trails/self-guided",
      "A typical synthetic estimate for self-guided activities.",
    ),
  );

  const regionalPass = alternative(
    "bernese-regional-pass",
    "Bernese regional travel pass",
    "local-transit",
    "132.00",
    "66.00",
    evidence(
      "recent",
      "Bernese Pass Demo",
      "https://example.invalid/synthetic/bernese-pass/regional",
      "A sample local-transit travel-pass comparison.",
    ),
  );
  const pointToPoint = alternative(
    "bernese-point-to-point",
    "point-to-point tickets (travel-pass comparison)",
    "local-transit",
    "102.00",
    "51.00",
    evidence(
      "typical",
      "Bernese Tickets Demo",
      "https://example.invalid/synthetic/bernese-tickets/point-to-point",
      "A typical synthetic ticket comparison.",
    ),
  );

  return {
    id: "switzerland-family-synthetic",
    title: "Synthetic Switzerland family trip: Basel to Bernese Oberland",
    currency,
    brief: structuredClone(switzerlandFamilyBrief),
    items: [
      item(
        "basel-to-interlaken",
        "travel",
        "Basel to Interlaken connection",
        railTransfer.id,
        [railTransfer, coachTransfer, flexRailTransfer],
        true,
      ),
      item("family-room", "stay", "Family accommodation", familyRoom.id, [
        familyRoom,
        hostelRoom,
        suite,
      ]),
      item("family-meals", "food", "Meals", meals.id, [
        meals,
        picnicMeals,
        restaurantMeals,
      ]),
      item("family-activities", "days", "Activities", activityBundle.id, [
        activityBundle,
        lowCostActivities,
      ]),
      item(
        "bernese-local-transit",
        "travel",
        "Travel-pass comparison",
        regionalPass.id,
        [regionalPass, pointToPoint],
      ),
    ],
    days: [
      {
        id: "day-1",
        date: "2026-09-10",
        title: "Synthetic schedule: Basel arrival and Interlaken transfer",
        items: [
          {
            id: "day-1-transfer",
            planItemId: "basel-to-interlaken",
            label: "Synthetic 10:00 Basel to Interlaken rail connection",
            startsAt: "2026-09-10T10:00:00+02:00",
            endsAt: "2026-09-10T12:30:00+02:00",
            directionsUrl: "https://example.invalid/synthetic/directions/basel-interlaken",
          },
        ],
      },
      {
        id: "day-2",
        date: "2026-09-11",
        title: "Synthetic schedule: family mountain day",
        items: [
          {
            id: "day-2-activity",
            planItemId: "family-activities",
            label: "Synthetic 09:30 family mountain activity",
            startsAt: "2026-09-11T09:30:00+02:00",
            endsAt: "2026-09-11T15:30:00+02:00",
            directionsUrl: "https://example.invalid/synthetic/directions/mountain-day",
          },
        ],
      },
      {
        id: "day-3",
        date: "2026-09-12",
        title: "Synthetic schedule: museum and lakeside walk",
        items: [
          {
            id: "day-3-activity",
            planItemId: "family-activities",
            label: "Synthetic 10:00 family museum visit",
            startsAt: "2026-09-12T10:00:00+02:00",
            endsAt: "2026-09-12T13:00:00+02:00",
            directionsUrl: "https://example.invalid/synthetic/directions/family-museum",
          },
        ],
      },
      {
        id: "day-4",
        date: "2026-09-13",
        title: "Synthetic schedule: local transit and departure",
        items: [
          {
            id: "day-4-transit",
            planItemId: "bernese-local-transit",
            label: "Synthetic 09:00 regional-pass travel comparison",
            startsAt: "2026-09-13T09:00:00+02:00",
            endsAt: "2026-09-13T11:00:00+02:00",
            directionsUrl: "https://example.invalid/synthetic/directions/regional-pass",
          },
        ],
      },
    ],
    completeSections: ["overview", "travel", "stay", "days", "food", "budget", "checks"],
    contingencyRate: "0.10",
  };
}
