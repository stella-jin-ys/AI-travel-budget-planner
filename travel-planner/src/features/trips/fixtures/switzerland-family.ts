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

  railTransfer.details = [
    { label: "Supplier", value: "Alpine Rail" },
    { label: "Transport", value: "Family rail connection" },
    { label: "Route", value: "Basel SBB → Interlaken Ost" },
    { label: "Departure", value: "10:00" },
    { label: "Arrival", value: "12:30" },
    { label: "Duration", value: "2 h 30 min" },
  ];
  railTransfer.links = [{ label: "Book with Alpine Rail", url: "https://example.invalid/synthetic/alpine-rail/book" }];
  familyRoom.details = [
    { label: "Supplier", value: "Alpenblick Lodge" },
    { label: "City", value: "Interlaken" },
    { label: "Accommodation", value: "Hotel · family room" },
    { label: "Cost per night", value: "CHF 180.00" },
    { label: "Duration", value: "3 nights" },
    { label: "Total", value: "CHF 540.00" },
  ];
  familyRoom.links = [{ label: "Book with Alpenblick Lodge", url: "https://example.invalid/synthetic/alpenblick/book" }];
  meals.details = [
    { label: "City", value: "Interlaken" },
    { label: "Supermarket", value: "Coop Interlaken · 500 m from the stay" },
    { label: "Restaurant", value: "Bernese Dining · 800 m from the stay" },
  ];
  meals.links = [{ label: "Bernese Dining Demo", url: "https://example.invalid/synthetic/bernese-dining" }];
  activityBundle.details = [
    { label: "City", value: "Interlaken" },
    { label: "Attractions", value: "Harder Kulm, lake promenade, and family museum" },
  ];
  activityBundle.links = [{ label: "Local attractions", url: "https://example.invalid/synthetic/interlaken-attractions" }];
  regionalPass.details = [
    { label: "Mode", value: "Regional public transport pass" },
    { label: "Price", value: "CHF 66.00 per person" },
  ];
  regionalPass.links = [{ label: "Bernese Pass Demo", url: "https://example.invalid/synthetic/bernese-pass" }];

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
        title: "Basel to Interlaken transfer",
        items: [
          {
            id: "day-1-transfer",
            planItemId: "basel-to-interlaken",
            label: "Depart Basel SBB 10:00 · arrive Interlaken Ost 12:30",
            startsAt: "2026-09-10T10:00:00+02:00",
            endsAt: "2026-09-10T12:30:00+02:00",
            directionsUrl: "https://example.invalid/synthetic/directions/basel-interlaken",
          },
          {
            id: "day-1-lunch",
            planItemId: "family-meals",
            label: "Family lunch near Interlaken Ost",
            startsAt: "2026-09-10T13:00:00+02:00",
            endsAt: "2026-09-10T14:00:00+02:00",
          },
          {
            id: "day-1-walk",
            planItemId: "family-activities",
            label: "Lakeside orientation walk",
            startsAt: "2026-09-10T15:00:00+02:00",
            endsAt: "2026-09-10T17:00:00+02:00",
          },
        ],
      },
      {
        id: "day-2",
        date: "2026-09-11",
        title: "Family mountain day",
        items: [
          {
            id: "day-2-activity",
            planItemId: "family-activities",
            label: "Mountain activity and cable-car loop",
            startsAt: "2026-09-11T09:30:00+02:00",
            endsAt: "2026-09-11T15:30:00+02:00",
            directionsUrl: "https://example.invalid/synthetic/directions/mountain-day",
          },
          {
            id: "day-2-lunch",
            planItemId: "family-meals",
            label: "Picnic lunch with valley views",
            startsAt: "2026-09-11T12:30:00+02:00",
            endsAt: "2026-09-11T13:30:00+02:00",
          },
        ],
      },
      {
        id: "day-3",
        date: "2026-09-12",
        title: "Museum and lakeside walk",
        items: [
          {
            id: "day-3-activity",
            planItemId: "family-activities",
            label: "Family museum visit",
            startsAt: "2026-09-12T10:00:00+02:00",
            endsAt: "2026-09-12T13:00:00+02:00",
            directionsUrl: "https://example.invalid/synthetic/directions/family-museum",
          },
          {
            id: "day-3-lunch",
            planItemId: "family-meals",
            label: "Lunch at a local family café",
            startsAt: "2026-09-12T13:15:00+02:00",
            endsAt: "2026-09-12T14:15:00+02:00",
          },
          {
            id: "day-3-walk",
            planItemId: "family-activities",
            label: "Lakeside walk and playground stop",
            startsAt: "2026-09-12T14:30:00+02:00",
            endsAt: "2026-09-12T17:00:00+02:00",
          },
        ],
      },
      {
        id: "day-4",
        date: "2026-09-13",
        title: "Local transit and departure",
        items: [
          {
            id: "day-4-transit",
            planItemId: "bernese-local-transit",
            label: "Depart Interlaken Ost 09:00 · arrive Basel SBB 11:00",
            startsAt: "2026-09-13T09:00:00+02:00",
            endsAt: "2026-09-13T11:00:00+02:00",
            directionsUrl: "https://example.invalid/synthetic/directions/regional-pass",
          },
          {
            id: "day-4-breakfast",
            planItemId: "family-meals",
            label: "Breakfast before departure",
            startsAt: "2026-09-13T07:30:00+02:00",
            endsAt: "2026-09-13T08:30:00+02:00",
          },
        ],
      },
    ],
    completeSections: ["overview", "travel", "stay", "days", "food", "budget", "checks"],
    contingencyRate: "0.10",
  };
}
