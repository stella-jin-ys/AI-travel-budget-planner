import type {
  PlanAlternative,
  PlanItem,
  SourceEvidence,
  TripPlan,
} from "@/features/trips/domain/trip";
import { money } from "@/features/trips/domain/money";

const currency = "CHF";
const adultId = "adult-1";
const childId = "child-1";

const evidence: SourceEvidence = {
  status: "typical",
  supplierName: "Fixture supplier",
  checkedAt: "2026-08-24T00:00:00.000Z",
  synthetic: true,
};

function alternative(
  id: string,
  label: string,
  category: PlanAlternative["category"],
  adultAmount: string,
  childAmount: string,
  options: Pick<PlanAlternative, "covered" | "optional"> = {
    covered: false,
    optional: false,
  },
): PlanAlternative {
  return {
    id,
    label,
    category,
    travelerCosts: {
      [adultId]: money(adultAmount, currency),
      [childId]: money(childAmount, currency),
    },
    ...options,
    evidence,
  };
}

function item(
  id: string,
  section: PlanItem["section"],
  label: string,
  selectedAlternativeId: string,
  alternatives: PlanAlternative[],
): PlanItem {
  return {
    id,
    section,
    label,
    required: true,
    selectedAlternativeId,
    alternatives,
  };
}

export function makeTripPlan(options: {
  strictLimit?: string;
  contingencyRate?: string;
} = {}): TripPlan {
  const transportOne = alternative(
    "transport-one",
    "Train to destination",
    "transport",
    "309.00",
    "0.00",
  );
  const transportTwo = alternative(
    "transport-two",
    "Return train",
    "transport",
    "177.20",
    "0.00",
  );
  const transportThree = alternative(
    "transport-three",
    "Airport transfer",
    "transport",
    "20.00",
    "0.00",
  );

  const items: PlanItem[] = [
    item("transport-one-item", "travel", transportOne.label, transportOne.id, [
      transportOne,
    ]),
    item("transport-two-item", "travel", transportTwo.label, transportTwo.id, [
      transportTwo,
    ]),
    item(
      "transport-three-item",
      "travel",
      transportThree.label,
      transportThree.id,
      [transportThree],
    ),
    item("stay-item", "stay", "Family room", "stay", [
      alternative("stay", "Family room", "stay", "280.00", "140.00"),
    ]),
    item("food-item", "food", "Meal plan", "food", [
      alternative("food", "Meal plan", "food", "120.00", "60.00"),
      alternative(
        "food-upgrade",
        "Premium meal upgrade",
        "food",
        "40.00",
        "40.00",
        { covered: false, optional: true },
      ),
    ]),
    item("activity-item", "days", "Museum pass", "activity", [
      alternative("activity", "Museum pass", "activities", "80.00", "40.00"),
    ]),
    item("covered-item", "travel", "Local transit pass", "covered", [
      alternative("covered", "Included transit", "local-transit", "0.00", "0.00", {
        covered: true,
        optional: false,
      }),
    ]),
  ];

  return {
    id: "fixture-trip",
    title: "Switzerland family trip",
    currency,
    brief: {
      mode: "known-destination",
      origin: "Stockholm",
      destination: "Zurich",
      startDate: "2026-09-01",
      endDate: "2026-09-05",
      travelers: [
        { id: adultId, name: "Alex", age: 35, eligibility: ["adult"] },
        { id: childId, name: "Sam", age: 8, eligibility: ["child"] },
      ],
      interests: ["museums"],
      ...(options.strictLimit
        ? { strictBudget: money(options.strictLimit, currency) }
        : {}),
      fixtureId: "switzerland-family",
    },
    items,
    days: [],
    completeSections: [],
    contingencyRate: options.contingencyRate ?? "0.10",
  };
}
