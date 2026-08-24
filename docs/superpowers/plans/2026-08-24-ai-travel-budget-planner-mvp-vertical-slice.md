# AI Travel Budget Planner MVP Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working responsive travel-planning vertical slice that turns a structured trip request into a deterministic sample itinerary with transparent costs, readiness, item-level warnings, replacements, locks, and undo inside the approved Tabbed Travel Manual interface.

**Architecture:** Create an isolated Next.js application under `travel-planner/` so the unrelated CommercePulse project remains untouched. Keep domain types, money arithmetic, readiness rules, synthetic providers, state transitions, and UI components in separate focused modules; the UI consumes only structured results. This release uses explicitly labeled synthetic provider data and establishes the interfaces later releases will connect to live suppliers and AI orchestration.

**Tech Stack:** Node.js 24 LTS, npm, Next.js App Router with TypeScript, React, Zod, decimal.js, CSS Modules, Vitest, Testing Library, axe-core, and Playwright.

**Spec:** `docs/superpowers/specs/2026-08-24-ai-travel-budget-planner-design.md`

## Global Constraints

- Work only inside `travel-planner/` plus this plan's documentation paths; do not modify CommercePulse files.
- Use Node.js 24 LTS. Next.js requires Node.js 20.9 or newer; Node 24 is an active LTS line and supported by Playwright.
- Use the App Router, TypeScript, ESLint, and npm lockfile.
- Do not add authentication, a database, live supplier APIs, an LLM call, payments, or deployment in this release.
- All sample prices, schedules, supplier names, and links must be visibly labeled synthetic.
- Use `decimal.js` for money arithmetic; never use binary floating-point addition for totals.
- The AI-shaped chat in this release is a deterministic guided input surface, not a claim of live AI behavior.
- The selected **Tabbed Travel Manual** direction is binding.
- The recorded code-first workflow is binding. Before UI implementation, use the Impeccable and design-taste frontend guidance; load the Impeccable craft floor immediately before editing UI.
- Warnings must attach to the affected item and include status, reason, last-check time, impact, and supplier-check action when available.
- Status must never rely on color alone.
- Every task follows red-green-refactor discipline and ends with a focused commit.

**Primary setup references:**

- Next.js App Router installation and system requirements: `https://nextjs.org/docs/app/getting-started/installation`
- Node.js release status: `https://nodejs.org/en/about/previous-releases`
- Playwright installation and supported runtimes: `https://playwright.dev/docs/intro`

## File structure

```text
travel-planner/
  package.json                         # scripts and dependencies
  package-lock.json                    # reproducible dependency graph
  next.config.ts                       # Next.js configuration
  tsconfig.json                        # strict TypeScript configuration
  eslint.config.mjs                    # lint rules
  vitest.config.ts                     # unit/component test environment
  playwright.config.ts                 # browser projects and dev server
  src/
    app/
      globals.css                      # reset, shared tokens, manual material
      layout.tsx                       # document shell and metadata
      page.tsx                         # vertical-slice entry route
    features/trips/
      domain/
        trip.ts                        # trip, traveler, itinerary, source types
        money.ts                       # exact money functions
        budget.ts                      # category and traveler aggregation
        readiness.ts                   # warnings and readiness evaluation
      providers/
        provider.ts                    # normalized provider contract
        synthetic-provider.ts          # deterministic sample trip data
      state/
        trip-reducer.ts                # replace, lock, undo, section state
        use-trip-workspace.ts           # client hook over the reducer
      components/
        trip-setup.tsx                 # guided known/inspire entry form
        manual-shell.tsx               # chat, leaf, tabs, and status rail
        section-tabs.tsx               # accessible section navigation
        status-rail.tsx                # total, readiness, checks, warnings
        source-badge.tsx               # freshness and source state
        errata-slip.tsx                # item-level uncertainty warning
        option-row.tsx                 # lock, replace, alternatives, source
        overview-leaf.tsx              # trip summary
        travel-leaf.tsx                # door-to-door transport
        stay-leaf.tsx                  # accommodation
        days-leaf.tsx                  # day itinerary
        food-leaf.tsx                  # meal strategy
        budget-leaf.tsx                # totals and categories
        checks-leaf.tsx                # grouped source checks
        mobile-today.tsx               # compact current-day view
      fixtures/
        switzerland-family.ts          # sample 1-adult/1-child trip
  tests/
    setup.ts                           # DOM and jest-dom setup
    domain/
      money.test.ts
      budget.test.ts
      readiness.test.ts
    providers/synthetic-provider.test.ts
    state/trip-reducer.test.ts
    components/
      manual-shell.test.tsx
      trip-setup.test.tsx
      errata-slip.test.tsx
      workspace.test.tsx
  e2e/trip-planning.spec.ts
```

---

### Task 1: Isolated Next.js application and test harness

**Files:**
- Create: `travel-planner/package.json`
- Create: `travel-planner/package-lock.json`
- Create: `travel-planner/next.config.ts`
- Create: `travel-planner/tsconfig.json`
- Create: `travel-planner/eslint.config.mjs`
- Create: `travel-planner/vitest.config.ts`
- Create: `travel-planner/playwright.config.ts`
- Create: `travel-planner/src/app/layout.tsx`
- Create: `travel-planner/src/app/page.tsx`
- Create: `travel-planner/src/app/globals.css`
- Create: `travel-planner/src/lib/app-config.ts`
- Test: `travel-planner/src/lib/app-config.test.ts`
- Test: `travel-planner/tests/setup.ts`

**Interfaces:**
- Produces npm scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, and `test:e2e`.
- Produces `appConfig` with `{ name: "AI Travel Budget Planner", market: "Europe-first", dataMode: "synthetic" }`.

- [ ] **Step 1: Scaffold the isolated application**

Run from the repository root:

```bash
npx create-next-app@latest travel-planner --ts --eslint --app --src-dir --no-tailwind --use-npm --import-alias '@/*'
cd travel-planner
npm install zod decimal.js
npm install --save-dev vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom axe-core @axe-core/playwright @playwright/test
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 2: Write the failing application-config test**

```ts
import { describe, expect, it } from "vitest";
import { appConfig } from "./app-config";

describe("appConfig", () => {
  it("labels the first release and its data honestly", () => {
    expect(appConfig).toEqual({
      name: "AI Travel Budget Planner",
      market: "Europe-first",
      dataMode: "synthetic",
    });
  });
});
```

- [ ] **Step 3: Run the focused test and verify red**

Run: `cd travel-planner && npm test -- src/lib/app-config.test.ts`

Expected: FAIL because `app-config.ts` does not exist.

- [ ] **Step 4: Add minimal configuration and test setup**

```ts
// src/lib/app-config.ts
export const appConfig = {
  name: "AI Travel Budget Planner",
  market: "Europe-first",
  dataMode: "synthetic",
} as const;
```

Configure Vitest for `jsdom`, load `tests/setup.ts`, and configure the `@/*` alias. Configure Playwright to start `npm run dev` at `http://127.0.0.1:3000` and test Chromium plus a mobile Safari-sized project.

- [ ] **Step 5: Verify the scaffold**

Run:

```bash
cd travel-planner
npm test -- src/lib/app-config.test.ts
npm run typecheck
npm run lint
npm run build
```

Expected: all four commands exit 0; the focused test reports 1 passing test.

- [ ] **Step 6: Commit the application scaffold**

```bash
git add travel-planner
git commit -m "chore: scaffold travel planner web app"
```

---

### Task 2: Trip domain, source states, and exact money values

**Files:**
- Create: `travel-planner/src/features/trips/domain/trip.ts`
- Create: `travel-planner/src/features/trips/domain/money.ts`
- Test: `travel-planner/tests/domain/money.test.ts`

**Interfaces:**
- Produces `Money`, `Traveler`, `TripBrief`, `SourceEvidence`, `PlanAlternative`, `PlanItem`, `ItineraryDay`, and `TripPlan`.
- Produces `money(amount, currency)`, `addMoney(values)`, and `formatMoney(value, locale)`.
- `Money.amount` is a decimal string and `Money.currency` is an ISO 4217 code.

- [ ] **Step 1: Write failing exact-arithmetic tests**

```ts
import { describe, expect, it } from "vitest";
import { addMoney, money } from "@/features/trips/domain/money";

describe("addMoney", () => {
  it("adds decimal amounts without floating-point drift", () => {
    expect(addMoney([money("0.10", "CHF"), money("0.20", "CHF")])).toEqual(
      money("0.30", "CHF"),
    );
  });

  it("rejects mixed currencies", () => {
    expect(() =>
      addMoney([money("10.00", "CHF"), money("10.00", "EUR")]),
    ).toThrow("Cannot add mixed currencies");
  });
});
```

- [ ] **Step 2: Run the focused test and verify red**

Run: `cd travel-planner && npm test -- tests/domain/money.test.ts`

Expected: FAIL because the domain modules do not exist.

- [ ] **Step 3: Define domain types and money functions**

Use these exact status unions:

```ts
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
```

Implement `addMoney` with `Decimal`, normalize outputs to two decimal places, and throw on an empty array or mixed currencies.

```ts
import Decimal from "decimal.js";
import type { Money } from "./trip";

export function money(amount: string, currency: string): Money {
  return { amount: new Decimal(amount).toFixed(2), currency };
}

export function addMoney(values: Money[]): Money {
  if (values.length === 0) throw new Error("Cannot add an empty money list");
  const currency = values[0].currency;
  if (values.some((value) => value.currency !== currency)) {
    throw new Error("Cannot add mixed currencies");
  }
  return money(
    values.reduce((sum, value) => sum.plus(value.amount), new Decimal(0)).toFixed(2),
    currency,
  );
}

export function formatMoney(value: Money, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: value.currency,
  }).format(new Decimal(value.amount).toNumber());
}
```

- [ ] **Step 4: Run domain checks**

Run:

```bash
cd travel-planner
npm test -- tests/domain/money.test.ts
npm run typecheck
```

Expected: PASS with 2 tests and no TypeScript errors.

- [ ] **Step 5: Commit the domain foundation**

```bash
git add travel-planner/src/features/trips/domain travel-planner/tests/domain/money.test.ts
git commit -m "feat: define travel plan domain and exact money"
```

---

### Task 3: Deterministic budget engine and strict-budget result

**Files:**
- Create: `travel-planner/src/features/trips/domain/budget.ts`
- Create: `travel-planner/tests/support/make-trip-plan.ts`
- Test: `travel-planner/tests/domain/budget.test.ts`

**Interfaces:**
- Consumes: `Money`, `Traveler`, `PlanAlternative`, and `TripPlan` from Task 2.
- Produces `calculateBudget(plan: TripPlan): BudgetSummary`.
- `BudgetSummary` exposes `byCategory`, `byTraveler`, `subtotal`, `contingency`, `total`, `perPerson`, `limit`, `remaining`, and `withinStrictLimit`.

- [ ] **Step 1: Write failing budget tests**

```ts
import { describe, expect, it } from "vitest";
import { calculateBudget } from "@/features/trips/domain/budget";
import { makeTripPlan } from "../support/make-trip-plan";

describe("calculateBudget", () => {
  it("separates covered, required, and optional costs", () => {
    const summary = calculateBudget(
      makeTripPlan({ strictLimit: "1000.00", contingencyRate: "0.10" }),
    );
    expect(summary.byCategory.transport.amount).toBe("506.20");
    expect(summary.optional.amount).toBe("80.00");
    expect(summary.covered.amount).toBe("0.00");
  });

  it("reports a strict-limit shortfall without hiding contingency", () => {
    const summary = calculateBudget(
      makeTripPlan({ strictLimit: "700.00", contingencyRate: "0.10" }),
    );
    expect(summary.withinStrictLimit).toBe(false);
    expect(summary.remaining.amount.startsWith("-")).toBe(true);
    expect(summary.contingency.amount).not.toBe("0.00");
  });
});
```

Create `tests/support/make-trip-plan.ts` as a typed fixture builder with one adult and one child. Use three selected transport alternatives with traveler totals `309.00/0.00`, `177.20/0.00`, and `20.00/0.00` so the transport category equals `506.20`. Add required stay, food, and activity alternatives, one covered zero-cost item, and one unselected optional upgrade costing `40.00` per traveler so optional cost equals `80.00`.

Define the calculated result separately from `TripPlan`:

```ts
export interface BudgetSummary {
  byCategory: Record<CostCategory, Money>;
  byTraveler: Record<string, Money>;
  covered: Money;
  optional: Money;
  subtotal: Money;
  contingency: Money;
  total: Money;
  perPerson: Money;
  limit?: Money;
  remaining?: Money;
  withinStrictLimit: boolean;
}
```

- [ ] **Step 2: Run the focused test and verify red**

Run: `cd travel-planner && npm test -- tests/domain/budget.test.ts`

Expected: FAIL because `calculateBudget` does not exist.

- [ ] **Step 3: Implement the minimal budget engine**

Use `Decimal` for category sums, traveler sums, contingency, limit comparison, and division. Required totals include contingency; optional items remain visible but excluded from the committed total until selected. Preserve the plan currency and throw when an option uses another currency.

```ts
export function calculateBudget(plan: TripPlan): BudgetSummary {
  const selected = plan.items.map((item) => {
    const alternative = item.alternatives.find(
      (candidate) => candidate.id === item.selectedAlternativeId,
    );
    if (!alternative) throw new Error(`Missing selected alternative for ${item.id}`);
    return alternative;
  });
  const allCosts = selected.flatMap((option) => Object.values(option.travelerCosts));
  if (allCosts.some((cost) => cost.currency !== plan.currency)) {
    throw new Error("Plan contains mixed currencies");
  }

  const sum = (values: Money[]) =>
    values.length === 0 ? money("0", plan.currency) : addMoney(values);
  const required = selected.filter((option) => !option.optional && !option.covered);
  const optional = plan.items
    .flatMap((item) => item.alternatives)
    .filter((option) => option.optional);
  const covered = selected.filter((option) => option.covered);
  const subtotal = sum(required.flatMap((option) => Object.values(option.travelerCosts)));
  const contingency = money(
    new Decimal(subtotal.amount).times(plan.contingencyRate).toFixed(2),
    plan.currency,
  );
  const total = addMoney([subtotal, contingency]);
  const limit = plan.brief.strictBudget;
  const remaining = limit
    ? money(new Decimal(limit.amount).minus(total.amount).toFixed(2), plan.currency)
    : undefined;

  return {
    byCategory: sumByCategory(required, plan.currency),
    byTraveler: sumByTraveler(required, plan.brief.travelers, plan.currency),
    covered: sum(covered.flatMap((option) => Object.values(option.travelerCosts))),
    optional: sum(optional.flatMap((option) => Object.values(option.travelerCosts))),
    subtotal,
    contingency,
    total,
    perPerson: money(
      new Decimal(total.amount).div(plan.brief.travelers.length).toFixed(2),
      plan.currency,
    ),
    limit,
    remaining,
    withinStrictLimit: remaining ? new Decimal(remaining.amount).gte(0) : true,
  };
}
```

Define the helpers in the same file:

```ts
const categories: CostCategory[] = [
  "transport",
  "stay",
  "food",
  "activities",
  "local-transit",
];

function sumByCategory(
  options: PlanAlternative[],
  currency: string,
): Record<CostCategory, Money> {
  return Object.fromEntries(
    categories.map((category) => [
      category,
      addMoneyOrZero(
        options
          .filter((option) => option.category === category)
          .flatMap((option) => Object.values(option.travelerCosts)),
        currency,
      ),
    ]),
  ) as Record<CostCategory, Money>;
}

function sumByTraveler(
  options: PlanAlternative[],
  travelers: Traveler[],
  currency: string,
): Record<string, Money> {
  return Object.fromEntries(
    travelers.map((traveler) => [
      traveler.id,
      addMoneyOrZero(
        options.flatMap((option) =>
          option.travelerCosts[traveler.id]
            ? [option.travelerCosts[traveler.id]]
            : [],
        ),
        currency,
      ),
    ]),
  );
}
```

- [ ] **Step 4: Verify budget behavior**

Run:

```bash
cd travel-planner
npm test -- tests/domain/money.test.ts tests/domain/budget.test.ts
npm run typecheck
```

Expected: PASS with all money and budget tests.

- [ ] **Step 5: Commit the budget engine**

```bash
git add travel-planner/src/features/trips/domain/budget.ts travel-planner/tests/domain travel-planner/tests/support
git commit -m "feat: calculate transparent trip budgets"
```

---

### Task 4: Readiness, freshness, and item-level issues

**Files:**
- Create: `travel-planner/src/features/trips/domain/readiness.ts`
- Test: `travel-planner/tests/domain/readiness.test.ts`

**Interfaces:**
- Consumes: `TripPlan`, `SourceEvidence`, and `BudgetSummary`.
- Produces `evaluateReadiness(plan, budget, policy, now): ReadinessResult`.
- `ReadinessResult.state` is `"draft" | "review-needed" | "ready-to-book"`.
- Each `PlanIssue` contains `itemId`, `severity`, `status`, `message`, `impact`, `checkedAt`, `supplierName`, and optional `sourceUrl`.

Use these exact types:

```ts
export type FreshnessPolicy = Partial<Record<SourceStatus, number>>;

export interface PlanIssue {
  itemId: string;
  severity: "warning" | "blocking";
  status: SourceStatus;
  message: string;
  impact: string;
  checkedAt: string;
  supplierName: string;
  sourceUrl?: string;
}

export interface ReadinessResult {
  state: "draft" | "review-needed" | "ready-to-book";
  issues: PlanIssue[];
}

export const defaultFreshnessPolicy: FreshnessPolicy = {
  live: 15 * 60_000,
  recent: 24 * 60 * 60_000,
  typical: 30 * 24 * 60 * 60_000,
};

export const demoNow = new Date("2026-08-24T10:00:00Z");
```

- [ ] **Step 1: Write failing readiness tests**

```ts
import { describe, expect, it } from "vitest";
import { calculateBudget } from "@/features/trips/domain/budget";
import { evaluateReadiness } from "@/features/trips/domain/readiness";
import { makeTripPlan } from "../support/make-trip-plan";

const policy = {
  live: 15 * 60_000,
  recent: 24 * 60 * 60_000,
  typical: 30 * 24 * 60 * 60_000,
};

describe("evaluateReadiness", () => {
  it("attaches a stale warning to the affected item", () => {
    const plan = makeTripPlan({ transportCheckedAt: "2026-08-20T10:00:00Z" });
    const result = evaluateReadiness(
      plan,
      calculateBudget(plan),
      policy,
      new Date("2026-08-24T10:00:00Z"),
    );
    expect(result.state).toBe("review-needed");
    expect(result.issues[0]).toMatchObject({
      itemId: "transport-main",
      status: "stale",
    });
  });

  it("blocks ready status for an impossible connection", () => {
    const plan = makeTripPlan({ connectionFeasible: false });
    const result = evaluateReadiness(
      plan,
      calculateBudget(plan),
      policy,
      new Date("2026-08-24T10:00:00Z"),
    );
    expect(result.state).toBe("draft");
    expect(result.issues.some((issue) => issue.severity === "blocking")).toBe(true);
  });
});
```

- [ ] **Step 2: Run the focused test and verify red**

Run: `cd travel-planner && npm test -- tests/domain/readiness.test.ts`

Expected: FAIL because `evaluateReadiness` does not exist.

- [ ] **Step 3: Implement explicit readiness rules**

Rules:

```text
draft          = incomplete required section OR blocking feasibility issue
review-needed  = complete plan with stale, typical, conflicting, unavailable, failed, or strict-budget issue
ready-to-book  = complete required sections, all required evidence within policy, feasible, and within strict limit
```

Never downgrade a blocking issue to a warning. Convert expired `live` and `recent` evidence to `stale` in the evaluation result without mutating the stored provider result.

```ts
export function evaluateReadiness(
  plan: TripPlan,
  budget: BudgetSummary,
  policy: FreshnessPolicy,
  now: Date,
): ReadinessResult {
  const issues = plan.items.flatMap((item) =>
    issuesForItem(item, policy, now),
  );
  if (!budget.withinStrictLimit) {
    issues.push({
      itemId: "budget",
      severity: "warning",
      status: "conflicting",
      message: "Strict budget exceeded",
      impact: `Shortfall ${budget.remaining?.amount} ${budget.total.currency}`,
      checkedAt: now.toISOString(),
      supplierName: "Budget engine",
    });
  }
  const requiredSections: PlanSection[] = [
    "overview",
    "travel",
    "stay",
    "days",
    "food",
    "budget",
  ];
  const incomplete = requiredSections.some(
    (section) => !plan.completeSections.includes(section),
  );
  const blocking = issues.some((issue) => issue.severity === "blocking");
  return {
    state: incomplete || blocking
      ? "draft"
      : issues.length > 0
        ? "review-needed"
        : "ready-to-book",
    issues,
  };
}
```

`issuesForItem` inspects the selected alternative, emits a blocking issue for `connectionFeasible === false`, computes evidence age from `checkedAt`, and emits one issue for each non-ready source status:

```ts
function issuesForItem(
  item: PlanItem,
  policy: FreshnessPolicy,
  now: Date,
): PlanIssue[] {
  const selected = item.alternatives.find(
    (alternative) => alternative.id === item.selectedAlternativeId,
  );
  if (!selected) throw new Error(`Missing selected alternative for ${item.id}`);
  const evidence = selected.evidence;
  const age = now.getTime() - new Date(evidence.checkedAt).getTime();
  const expired = policy[evidence.status] !== undefined && age > policy[evidence.status]!;
  const status: SourceStatus = expired ? "stale" : evidence.status;
  const issues: PlanIssue[] = [];
  if (item.connectionFeasible === false) {
    issues.push({
      itemId: item.id,
      severity: "blocking",
      status: "failed",
      message: "Connection is not feasible",
      impact: "Choose another departure or increase the transfer buffer",
      checkedAt: evidence.checkedAt,
      supplierName: evidence.supplierName,
      sourceUrl: evidence.sourceUrl,
    });
  }
  if (!["live", "recent"].includes(status)) {
    issues.push({
      itemId: item.id,
      severity: "warning",
      status,
      message: status === "stale" ? "Stale estimate" : "Needs confirmation",
      impact: evidence.reason ?? "Price or availability may change",
      checkedAt: evidence.checkedAt,
      supplierName: evidence.supplierName,
      sourceUrl: evidence.sourceUrl,
    });
  }
  return issues;
}
```

- [ ] **Step 4: Verify readiness rules**

Run: `cd travel-planner && npm test -- tests/domain/readiness.test.ts`

Expected: PASS with both stale-data and infeasible-connection cases.

- [ ] **Step 5: Commit readiness evaluation**

```bash
git add travel-planner/src/features/trips/domain/readiness.ts travel-planner/tests/domain/readiness.test.ts
git commit -m "feat: evaluate trip readiness and uncertainty"
```

---

### Task 5: Normalized provider contract and Switzerland sample plan

**Files:**
- Create: `travel-planner/src/features/trips/providers/provider.ts`
- Create: `travel-planner/src/features/trips/providers/synthetic-provider.ts`
- Create: `travel-planner/src/features/trips/fixtures/switzerland-family.ts`
- Test: `travel-planner/tests/providers/synthetic-provider.test.ts`

**Interfaces:**
- Produces `TripDataProvider.search(brief: TripBrief): Promise<ProviderTripResult>`.
- Produces `SyntheticTripProvider`, seeded by fixture ID rather than randomness.
- Produces `buildSwitzerlandFamilyTrip(): TripPlan` with synthetic supplier identities and URLs under `https://example.invalid/`.

- [ ] **Step 1: Write failing provider tests**

```ts
import { describe, expect, it } from "vitest";
import { switzerlandFamilyBrief } from "@/features/trips/fixtures/switzerland-family";
import { SyntheticTripProvider } from "@/features/trips/providers/synthetic-provider";

describe("SyntheticTripProvider", () => {
  it("returns the same normalized plan for the same brief", async () => {
    const provider = new SyntheticTripProvider();
    const first = await provider.search(switzerlandFamilyBrief);
    const second = await provider.search(switzerlandFamilyBrief);
    expect(second).toEqual(first);
  });

  it("labels every source as synthetic", async () => {
    const result = await new SyntheticTripProvider().search(switzerlandFamilyBrief);
    expect(
      result.plan.items.every((item) =>
        item.alternatives.every((alternative) => alternative.evidence.synthetic),
      ),
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Run the focused test and verify red**

Run: `cd travel-planner && npm test -- tests/providers/synthetic-provider.test.ts`

Expected: FAIL because the provider modules do not exist.

- [ ] **Step 3: Implement the contract and fixture**

Export a complete `switzerlandFamilyBrief: TripBrief` with fixture ID, Basel origin, Bernese Oberland destination, four dates, one adult, one ten-year-old child, family interests, and a CHF strict budget. The fixture plan contains transport, accommodation, meals, activities, one travel-pass comparison, cheaper and premium alternatives, at least one typical estimate, one stale warning, and one supplier link. Use values inspired by the reference guide only as clearly synthetic demonstration data; do not copy them as current claims.

Define the provider result:

```ts
export interface ProviderTripResult {
  plan: TripPlan;
  retrievedAt: string;
  providerId: string;
}

export interface TripDataProvider {
  search(brief: TripBrief): Promise<ProviderTripResult>;
}
```

Implement the provider without time-dependent randomness:

```ts
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
```

- [ ] **Step 4: Verify normalized sample data**

Run:

```bash
cd travel-planner
npm test -- tests/providers/synthetic-provider.test.ts
npm run typecheck
```

Expected: PASS; no plan item lacks synthetic source evidence.

- [ ] **Step 5: Commit the provider boundary**

```bash
git add travel-planner/src/features/trips/providers travel-planner/src/features/trips/fixtures travel-planner/tests/providers
git commit -m "feat: add normalized synthetic trip provider"
```

---

### Task 6: Workspace reducer for replacement, locking, and undo

**Files:**
- Create: `travel-planner/src/features/trips/state/trip-reducer.ts`
- Create: `travel-planner/src/features/trips/state/use-trip-workspace.ts`
- Test: `travel-planner/tests/state/trip-reducer.test.ts`

**Interfaces:**
- Produces `TripWorkspaceState` with `plan`, `budget`, `readiness`, `lockedItemIds`, `history: TripPlan[]`, `activeSection`, and `selectedDayId`.
- Produces actions `replace-option`, `toggle-lock`, `undo`, `set-section`, and `set-day`.
- `replace-option` recalculates budget and readiness in the same reducer transition.

```ts
export type TripWorkspaceAction =
  | { type: "replace-option"; itemId: string; alternativeId: string }
  | { type: "toggle-lock"; itemId: string }
  | { type: "undo" }
  | { type: "set-section"; section: PlanSection }
  | { type: "set-day"; dayId: string };
```

- [ ] **Step 1: Write failing state-transition tests**

```ts
import { describe, expect, it } from "vitest";
import { createWorkspace, tripReducer } from "@/features/trips/state/trip-reducer";
import { makeTripPlan } from "../support/make-trip-plan";

describe("tripReducer", () => {
  it("replaces an unlocked option and recalculates the total", () => {
    const initial = createWorkspace(makeTripPlan());
    const next = tripReducer(initial, {
      type: "replace-option",
      itemId: "stay-main",
      alternativeId: "stay-budget",
    });
    expect(
      next.plan.items.find((item) => item.id === "stay-main")?.selectedAlternativeId,
    ).toBe("stay-budget");
    expect(next.budget.total.amount).not.toBe(initial.budget.total.amount);
  });

  it("refuses to replace a locked item", () => {
    const locked = tripReducer(createWorkspace(makeTripPlan()), {
      type: "toggle-lock",
      itemId: "stay-main",
    });
    expect(() =>
      tripReducer(locked, {
        type: "replace-option",
        itemId: "stay-main",
        alternativeId: "stay-budget",
      }),
    ).toThrow("Unlock this item before replacing it");
  });

  it("undoes the last replacement", () => {
    const initial = createWorkspace(makeTripPlan());
    const changed = tripReducer(initial, {
      type: "replace-option",
      itemId: "stay-main",
      alternativeId: "stay-budget",
    });
    expect(tripReducer(changed, { type: "undo" }).plan).toEqual(initial.plan);
  });
});
```

- [ ] **Step 2: Run the focused test and verify red**

Run: `cd travel-planner && npm test -- tests/state/trip-reducer.test.ts`

Expected: FAIL because the reducer does not exist.

- [ ] **Step 3: Implement immutable transitions**

Keep at most 20 history snapshots. Recalculate with `calculateBudget` and `evaluateReadiness` after every option change. Throw a named `LockedItemError` for locked replacements and leave state unchanged when undo history is empty.

```ts
export function createWorkspace(plan: TripPlan): TripWorkspaceState {
  const budget = calculateBudget(plan);
  return {
    plan,
    budget,
    readiness: evaluateReadiness(plan, budget, defaultFreshnessPolicy, demoNow),
    lockedItemIds: [],
    history: [],
    activeSection: "overview",
  };
}

export function tripReducer(
  state: TripWorkspaceState,
  action: TripWorkspaceAction,
): TripWorkspaceState {
  if (action.type === "undo") {
    const plan = state.history.at(-1);
    if (!plan) return state;
    const budget = calculateBudget(plan);
    return {
      ...state,
      plan,
      budget,
      readiness: evaluateReadiness(plan, budget, defaultFreshnessPolicy, demoNow),
      history: state.history.slice(0, -1),
    };
  }
  if (action.type === "set-section") return { ...state, activeSection: action.section };
  if (action.type === "toggle-lock") {
    const locked = new Set(state.lockedItemIds);
    locked.has(action.itemId) ? locked.delete(action.itemId) : locked.add(action.itemId);
    return { ...state, lockedItemIds: [...locked] };
  }
  if (action.type === "replace-option") {
    if (state.lockedItemIds.includes(action.itemId)) throw new LockedItemError();
    const plan = {
      ...state.plan,
      items: state.plan.items.map((item) =>
        item.id === action.itemId
          ? { ...item, selectedAlternativeId: action.alternativeId }
          : item,
      ),
    };
    const budget = calculateBudget(plan);
    return {
      ...state,
      plan,
      budget,
      readiness: evaluateReadiness(plan, budget, defaultFreshnessPolicy, demoNow),
      history: [...state.history.slice(-19), state.plan],
    };
  }
  return { ...state, selectedDayId: action.dayId };
}
```

- [ ] **Step 4: Verify state behavior**

Run: `cd travel-planner && npm test -- tests/state/trip-reducer.test.ts`

Expected: PASS with replacement, locked-item, and undo cases.

- [ ] **Step 5: Commit workspace state**

```bash
git add travel-planner/src/features/trips/state travel-planner/tests/state
git commit -m "feat: add editable trip workspace state"
```

---

### Task 7: Tabbed Travel Manual UI foundation

**Files:**
- Modify: `travel-planner/src/app/globals.css`
- Create: `travel-planner/src/features/trips/components/manual-shell.tsx`
- Create: `travel-planner/src/features/trips/components/section-tabs.tsx`
- Create: `travel-planner/src/features/trips/components/status-rail.tsx`
- Create: `travel-planner/src/features/trips/components/source-badge.tsx`
- Create: `travel-planner/src/features/trips/components/errata-slip.tsx`
- Test: `travel-planner/tests/components/manual-shell.test.tsx`
- Test: `travel-planner/tests/components/errata-slip.test.tsx`

**Interfaces:**
- Consumes: `TripWorkspaceState`, `PlanSection`, `PlanIssue`, and `BudgetSummary`.
- Produces accessible layout components used by every leaf in Tasks 8 and 9.
- `ErrataSlip` requires a complete `PlanIssue`; it cannot render a warning without source status and impact.

- [ ] **Step 1: Re-open the approved UI direction before editing**

Use the Impeccable and design-taste frontend skills. Load the Impeccable craft-floor reference immediately before the first UI edit. Use the approved Tabbed Travel Manual quality references stored in `.impeccable/quality-bar/manual-board.webp` and `.impeccable/quality-bar/manual-hero.webp`.

Record this direction contract through a hidden first-child marker in `src/app/layout.tsx`. The marker uses `dangerouslySetInnerHTML` only for the static audited comment so the App Router cannot strip it:

```tsx
const directionContract = `<!--
THESIS: The trip is an open working manual; uncertainty sits on the exact fact it qualifies, never in a distant disclaimer.
OWN-WORLD: Quiet paper field, ink rules, punched acetate verification layers, and full-strength section tabs; vermilion is reserved for unresolved warnings.
STORY: Describe the trip, inspect the open plan, understand cost and readiness, replace a choice, and confirm uncertain facts with suppliers.
FIRST VIEWPORT: Chat margin at left, active planning leaf in the center, stepped section tabs at right, and total/readiness across the top.
FORM: Tabbed reference manual; seed 896b79e7, selected challenger rw-manual-acetate-tab-board.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

function DirectionContractMarker() {
  return (
    <span
      hidden
      data-impeccable-direction-contract="896b79e7"
      dangerouslySetInnerHTML={{ __html: directionContract }}
    />
  );
}
```

- [ ] **Step 2: Write failing accessibility-focused component tests**

```tsx
it("names the tab list and exposes the selected section", () => {
  render(<SectionTabs active="travel" onChange={() => undefined} />);
  expect(screen.getByRole("tablist", { name: "Trip sections" })).toBeVisible();
  expect(screen.getByRole("tab", { name: "Travel" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

it("shows uncertainty without relying on color", () => {
  render(
    <ErrataSlip
      issue={staleTransportIssue}
      now={new Date("2026-08-24T10:00:00Z")}
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Stale estimate");
  expect(screen.getByText("Checked 4 days ago")).toBeVisible();
  expect(screen.getByRole("link", { name: "Check with supplier" })).toHaveAttribute(
    "href",
    staleTransportIssue.sourceUrl,
  );
});
```

- [ ] **Step 3: Run component tests and verify red**

Run: `cd travel-planner && npm test -- tests/components/manual-shell.test.tsx tests/components/errata-slip.test.tsx`

Expected: FAIL because the UI components do not exist.

- [ ] **Step 4: Build the UI foundation**

Use semantic tabs and landmarks. Define restrained paper/ink tokens plus section colors; reserve the warning token for unresolved issues. Use square or lightly eased corners, printed rules, and layered surfaces rather than generic floating cards. Make the top status rail readable independently of color and keep section transitions at 90ms or disabled under `prefers-reduced-motion`.

Start with these exact layout tokens and topology:

```css
:root {
  --paper: #f3eddd;
  --ink: #141414;
  --rule: #6f6a5f;
  --yellow: #f2bd25;
  --orange: #e86126;
  --green: #568f4e;
  --teal: #168b88;
  --blue: #235aa6;
  --violet: #694fa3;
  --warning: #b93626;
}

.manual-shell {
  min-height: 100dvh;
  color: var(--ink);
  background: var(--paper);
  display: grid;
  grid-template-columns: minmax(16rem, 24rem) minmax(0, 1fr) 5rem;
  grid-template-rows: auto minmax(0, 1fr);
}

.status-rail { grid-column: 1 / -1; border-bottom: 1px solid var(--rule); }
.chat-margin { border-right: 1px solid var(--rule); }
.active-leaf { position: relative; padding: clamp(1rem, 2vw, 2rem); }
.section-tabs { border-left: 1px solid var(--rule); }

@media (max-width: 719px) {
  .manual-shell { display: block; }
  .chat-margin { border-right: 0; border-bottom: 1px solid var(--rule); }
  .section-tabs { display: flex; overflow-x: auto; border-left: 0; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto; transition-duration: 0.01ms !important; }
}
```

Implement the key accessible components with these public shapes:

```tsx
const sections: Array<{ id: PlanSection; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "travel", label: "Travel" },
  { id: "stay", label: "Stay" },
  { id: "days", label: "Days" },
  { id: "food", label: "Food" },
  { id: "budget", label: "Budget" },
  { id: "checks", label: "Checks" },
];

export function SectionTabs(props: {
  active: PlanSection;
  onChange: (section: PlanSection) => void;
}) {
  return (
    <div className="section-tabs" role="tablist" aria-label="Trip sections">
      {sections.map((section) => (
        <button
          key={section.id}
          role="tab"
          aria-selected={props.active === section.id}
          aria-controls={`panel-${section.id}`}
          onClick={() => props.onChange(section.id)}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}

export function ErrataSlip({ issue, now }: { issue: PlanIssue; now: Date }) {
  return (
    <aside role="alert" aria-label={`${issue.message} for ${issue.itemId}`}>
      <strong>{issue.message}</strong>
      <p>{issue.impact}</p>
      <p>Checked {formatRelativeTime(issue.checkedAt, now)}</p>
      {issue.sourceUrl ? (
        <a href={issue.sourceUrl} target="_blank" rel="noreferrer">
          Check with supplier
        </a>
      ) : null}
    </aside>
  );
}

function formatRelativeTime(checkedAt: string, now: Date): string {
  const days = Math.floor(
    (now.getTime() - new Date(checkedAt).getTime()) / (24 * 60 * 60 * 1000),
  );
  return days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"} ago`;
}

export function ManualShell(props: {
  state: TripWorkspaceState;
  chat: React.ReactNode;
  leaf: React.ReactNode;
  onSectionChange: (section: PlanSection) => void;
}) {
  return (
    <main className="manual-shell">
      <StatusRail budget={props.state.budget} readiness={props.state.readiness} />
      <aside className="chat-margin" aria-label="Trip conversation">{props.chat}</aside>
      <section
        className="active-leaf"
        id={`panel-${props.state.activeSection}`}
        role="tabpanel"
      >
        {props.leaf}
      </section>
      <SectionTabs active={props.state.activeSection} onChange={props.onSectionChange} />
    </main>
  );
}
```

`StatusRail` renders labeled group total, per-person total, readiness text, checked count, and warning count. `SourceBadge` renders both a status icon and the human label returned by an exhaustive `SourceStatus` switch.

- [ ] **Step 5: Verify components and accessibility**

Run:

```bash
cd travel-planner
npm test -- tests/components/manual-shell.test.tsx tests/components/errata-slip.test.tsx
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit the UI system**

```bash
git add travel-planner/src/app travel-planner/src/features/trips/components travel-planner/tests/components
git commit -m "feat: establish tabbed travel manual interface"
```

---

### Task 8: Guided trip setup and planning workspace

**Files:**
- Modify: `travel-planner/src/app/page.tsx`
- Create: `travel-planner/src/features/trips/components/trip-setup.tsx`
- Create: `travel-planner/src/features/trips/components/trip-workspace.tsx`
- Test: `travel-planner/tests/components/trip-setup.test.tsx`
- Test: `travel-planner/tests/components/workspace.test.tsx`

**Interfaces:**
- Consumes: `SyntheticTripProvider`, `useTripWorkspace`, and UI foundation components.
- Produces two setup modes, `known-destination` and `inspire-me`.
- Submitting the supported Switzerland family fixture opens the main workspace; unsupported input receives an honest synthetic-demo boundary message.

- [ ] **Step 1: Write failing setup and workspace tests**

```tsx
it("offers both trip starting modes", () => {
  render(<TripSetup onSubmit={vi.fn()} />);
  expect(screen.getByRole("radio", { name: "I know where" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "Inspire me" })).toBeVisible();
});

it("keeps total and readiness visible in the workspace", async () => {
  render(<TripWorkspace initialPlan={buildSwitzerlandFamilyTrip()} />);
  expect(screen.getByText("Group total")).toBeVisible();
  expect(screen.getByText(/Review needed/i)).toBeVisible();
  expect(screen.getByRole("tab", { name: "Overview" })).toBeVisible();
});
```

- [ ] **Step 2: Run tests and verify red**

Run: `cd travel-planner && npm test -- tests/components/trip-setup.test.tsx tests/components/workspace.test.tsx`

Expected: FAIL because setup and workspace components do not exist.

- [ ] **Step 3: Implement the guided deterministic demo**

The setup form captures mode, origin, destination, dates, one adult, one child age ten, interests, budget, and strict-budget switch. Label the conversational prompt **Guided demo — no live AI call**. Disable plan generation until required fields are present. For `inspire-me`, show the Switzerland sample as a synthetic recommendation with the reason “family rail travel and mountain activities,” never as a live ranked result.

Use controlled form state and produce a complete `TripBrief`:

```tsx
export function TripSetup({ onSubmit }: { onSubmit: (brief: TripBrief) => void }) {
  const [mode, setMode] = useState<TripBrief["mode"]>("known-destination");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("2026-09-10");
  const [endDate, setEndDate] = useState("2026-09-13");
  const [childAge, setChildAge] = useState(10);
  const [interests, setInterests] = useState("mountains, family rail");
  const [budget, setBudget] = useState("1200.00");
  const [strict, setStrict] = useState(true);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({
      ...switzerlandFamilyBrief,
      mode,
      origin,
      destination: mode === "known-destination" ? destination : undefined,
      startDate,
      endDate,
      travelers: [
        { id: "adult-1", name: "Adult", age: 35, eligibility: ["adult", "family"] },
        { id: "child-1", name: "Child", age: childAge, eligibility: ["child", "family"] },
      ],
      interests: interests.split(",").map((value) => value.trim()).filter(Boolean),
      strictBudget: strict ? money(budget, "CHF") : undefined,
    });
  }

  return (
    <form onSubmit={submit}>
      <fieldset>
        <legend>How should we start?</legend>
        <label><input type="radio" checked={mode === "known-destination"} onChange={() => setMode("known-destination")} />I know where</label>
        <label><input type="radio" checked={mode === "inspire-me"} onChange={() => setMode("inspire-me")} />Inspire me</label>
      </fieldset>
      <label>Origin<input value={origin} onChange={(event) => setOrigin(event.target.value)} required /></label>
      {mode === "known-destination" ? (
        <label>Destination<input value={destination} onChange={(event) => setDestination(event.target.value)} required /></label>
      ) : null}
      <label>Start date<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required /></label>
      <label>End date<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required /></label>
      <label>Child age<input type="number" min="0" max="17" value={childAge} onChange={(event) => setChildAge(Number(event.target.value))} /></label>
      <label>Interests<input value={interests} onChange={(event) => setInterests(event.target.value)} /></label>
      <label>Budget in CHF<input inputMode="decimal" value={budget} onChange={(event) => setBudget(event.target.value)} /></label>
      <p>Guided demo — no live AI call</p>
      <label><input type="checkbox" checked={strict} onChange={(event) => setStrict(event.target.checked)} />Strict budget</label>
      <button type="submit">Build sample plan</button>
    </form>
  );
}
```

`TripWorkspace` calls `useTripWorkspace(initialPlan)`, chooses the active leaf through an exhaustive `PlanSection` switch, and passes reducer actions into `ManualShell` and item controls. `page.tsx` owns only the setup-versus-workspace transition and shows a persistent **Synthetic demonstration data** notice once a plan is generated.

- [ ] **Step 4: Verify setup and workspace behavior**

Run:

```bash
cd travel-planner
npm test -- tests/components/trip-setup.test.tsx tests/components/workspace.test.tsx
npm run typecheck
```

Expected: PASS; both modes reach the same structured workspace without unsupported AI claims.

- [ ] **Step 5: Commit setup and workspace**

```bash
git add travel-planner/src/app/page.tsx travel-planner/src/features/trips/components/trip-setup.tsx travel-planner/src/features/trips/components/trip-workspace.tsx travel-planner/tests/components
git commit -m "feat: add guided trip planning workspace"
```

---

### Task 9: Planning leaves, alternatives, locks, and checks

**Files:**
- Create: `travel-planner/src/features/trips/components/option-row.tsx`
- Create: `travel-planner/src/features/trips/components/overview-leaf.tsx`
- Create: `travel-planner/src/features/trips/components/travel-leaf.tsx`
- Create: `travel-planner/src/features/trips/components/stay-leaf.tsx`
- Create: `travel-planner/src/features/trips/components/days-leaf.tsx`
- Create: `travel-planner/src/features/trips/components/food-leaf.tsx`
- Create: `travel-planner/src/features/trips/components/budget-leaf.tsx`
- Create: `travel-planner/src/features/trips/components/checks-leaf.tsx`
- Test: `travel-planner/tests/components/option-row.test.tsx`
- Test: `travel-planner/tests/components/leaves.test.tsx`

**Interfaces:**
- Consumes: reducer actions and normalized `TripPlan` data.
- Produces seven tab panels and item controls.
- `OptionRow` receives `item`, `alternatives`, `locked`, `onReplace`, and `onToggleLock`.

- [ ] **Step 1: Write failing option and leaf tests**

```tsx
it("previews budget impact before replacement", async () => {
  const user = userEvent.setup();
  const onReplace = vi.fn();
  render(<OptionRow {...stayProps} onReplace={onReplace} />);
  await user.click(screen.getByRole("button", { name: "Replace accommodation" }));
  expect(screen.getByText("Save CHF 120.00")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Use budget stay" }));
  expect(onReplace).toHaveBeenCalledWith("stay-budget");
});

it("groups checks by status", () => {
  render(<ChecksLeaf plan={buildSwitzerlandFamilyTrip()} />);
  expect(screen.getByRole("heading", { name: "Stale" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Typical estimates" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Recently checked" })).toBeVisible();
});
```

- [ ] **Step 2: Run tests and verify red**

Run: `cd travel-planner && npm test -- tests/components/option-row.test.tsx tests/components/leaves.test.tsx`

Expected: FAIL because the leaf components do not exist.

- [ ] **Step 3: Implement all planning leaves**

Keep each leaf focused:

```text
Overview = dates, travelers, readiness, key warnings, total
Travel   = door-to-door legs, transfers, pass comparison, sources
Stay     = selected accommodation and cheaper/premium alternatives
Days     = timed daily sequence, walking/transit, meal and rest gaps
Food     = restaurant/takeaway/supermarket mix and daily allowance
Budget   = category, traveler, contingency, optional, total, remaining
Checks   = verified/recent/typical/stale/conflicting/unavailable/failed groups
```

Render `ErrataSlip` beside the affected row. External links open in a new tab with `rel="noreferrer"`. Locked rows expose their state in text and prevent replacement controls from applying changes.

Implement `OptionRow` with an explicit confirmation state:

```tsx
interface OptionRowProps {
  item: PlanItem;
  alternatives: PlanAlternative[];
  locked: boolean;
  onReplace: (alternativeId: string) => void;
  onToggleLock: () => void;
}

export function OptionRow(props: OptionRowProps) {
  const [pending, setPending] = useState<PlanAlternative | null>(null);
  const selected = props.item.alternatives.find(
    (candidate) => candidate.id === props.item.selectedAlternativeId,
  );
  if (!selected) throw new Error(`Missing selected option for ${props.item.id}`);

  return (
    <article aria-labelledby={`${props.item.id}-title`}>
      <h3 id={`${props.item.id}-title`}>{props.item.label}</h3>
      <p>{selected.label}</p>
      <SourceBadge evidence={selected.evidence} />
      <button onClick={props.onToggleLock} aria-pressed={props.locked}>
        {props.locked ? `Unlock ${props.item.label}` : `Lock ${props.item.label}`}
      </button>
      <button
        disabled={props.locked}
        onClick={() => setPending(props.alternatives[0] ?? null)}
      >
        Replace {props.item.label.toLowerCase()}
      </button>
      {props.locked ? <p>{props.item.label} locked</p> : null}
      {pending ? (
        <div role="dialog" aria-label={`Replace ${props.item.label}`}>
          <p>{describeCostDelta(selected, pending)}</p>
          <button onClick={() => props.onReplace(pending.id)}>
            Use {pending.label.toLowerCase()}
          </button>
          <button onClick={() => setPending(null)}>Cancel</button>
        </div>
      ) : null}
    </article>
  );
}

function describeCostDelta(
  selected: PlanAlternative,
  pending: PlanAlternative,
): string {
  const selectedTotal = Object.values(selected.travelerCosts).reduce(
    (sum, value) => sum.plus(value.amount),
    new Decimal(0),
  );
  const pendingTotal = Object.values(pending.travelerCosts).reduce(
    (sum, value) => sum.plus(value.amount),
    new Decimal(0),
  );
  const delta = pendingTotal.minus(selectedTotal);
  const verb = delta.lt(0) ? "Save" : "Add";
  return `${verb} ${selected.travelerCosts[Object.keys(selected.travelerCosts)[0]].currency} ${delta.abs().toFixed(2)}`;
}
```

Use one exhaustive leaf router so every declared tab has content:

```tsx
export function ActiveLeaf({ state, dispatch }: ActiveLeafProps) {
  switch (state.activeSection) {
    case "overview": return <OverviewLeaf state={state} />;
    case "travel": return <TravelLeaf state={state} dispatch={dispatch} />;
    case "stay": return <StayLeaf state={state} dispatch={dispatch} />;
    case "days": return <DaysLeaf state={state} />;
    case "food": return <FoodLeaf state={state} dispatch={dispatch} />;
    case "budget": return <BudgetLeaf budget={state.budget} />;
    case "checks": return <ChecksLeaf readiness={state.readiness} />;
  }
}
```

Each category leaf filters `state.plan.items` by its section and renders `OptionRow` plus matching `ErrataSlip` records from `state.readiness.issues`. `OverviewLeaf` renders only key facts and blocking/high-impact warnings; `ChecksLeaf` groups every issue by `SourceStatus`.

- [ ] **Step 4: Verify interactions and calculations**

Run:

```bash
cd travel-planner
npm test -- tests/components/option-row.test.tsx tests/components/leaves.test.tsx tests/state/trip-reducer.test.ts
npm run typecheck
npm run lint
```

Expected: all commands exit 0; replacing an option changes both the displayed total and relevant readiness result.

- [ ] **Step 5: Commit the planning leaves**

```bash
git add travel-planner/src/features/trips/components travel-planner/tests/components
git commit -m "feat: add editable itinerary and budget leaves"
```

---

### Task 10: Responsive mobile-today mode

**Files:**
- Create: `travel-planner/src/features/trips/components/mobile-today.tsx`
- Modify: `travel-planner/src/features/trips/components/trip-workspace.tsx`
- Modify: `travel-planner/src/app/globals.css`
- Test: `travel-planner/tests/components/mobile-today.test.tsx`

**Interfaces:**
- Consumes: `TripPlan`, current date, and issues.
- Produces a compact `MobileToday` view with next leg, directions link, supplier check, current warning, and group-total summary.

- [ ] **Step 1: Write the failing mobile-mode test**

```tsx
it("prioritizes the next leg and current warning", () => {
  render(
    <MobileToday
      plan={buildSwitzerlandFamilyTrip()}
      now={new Date("2026-08-24T08:00:00Z")}
    />,
  );
  expect(screen.getByRole("heading", { name: "Next" })).toBeVisible();
  expect(screen.getByRole("alert")).toBeVisible();
  expect(screen.getByText("Group total")).toBeVisible();
});
```

- [ ] **Step 2: Run the focused test and verify red**

Run: `cd travel-planner && npm test -- tests/components/mobile-today.test.tsx`

Expected: FAIL because `MobileToday` does not exist.

- [ ] **Step 3: Implement responsive trip mode**

At widths below 720px, replace the fixed side rails with a sticky status header and horizontally scrollable tab rail. Keep tap targets at least 44 by 44 CSS pixels. `MobileToday` must work without hover and preserve supplier links, warning labels, and exact totals. Do not claim offline reload support in this release; durable offline behavior belongs to Release 5.

```tsx
export function MobileToday({ plan, now }: { plan: TripPlan; now: Date }) {
  const budget = calculateBudget(plan);
  const readiness = evaluateReadiness(plan, budget, defaultFreshnessPolicy, now);
  const day = plan.days.find((candidate) => candidate.date === now.toISOString().slice(0, 10))
    ?? plan.days[0];
  const next = day.items.find((item) => new Date(item.endsAt) > now);
  const currentIssue = readiness.issues.find(
    (issue) => issue.itemId === next?.planItemId,
  ) ?? readiness.issues[0];

  return (
    <main aria-label="Today on your trip">
      <header><span>Group total</span><strong>{formatMoney(budget.total, "en-CH")}</strong></header>
      <h1>{day.title}</h1>
      <section aria-labelledby="next-heading">
        <h2 id="next-heading">Next</h2>
        {next ? (
          <article>
            <h3>{next.label}</h3>
            <p><time dateTime={next.startsAt}>{next.startsAt}</time>–<time dateTime={next.endsAt}>{next.endsAt}</time></p>
            {next.directionsUrl ? <a href={next.directionsUrl}>Directions</a> : null}
          </article>
        ) : <p>No more scheduled items today.</p>}
      </section>
      {currentIssue ? <ErrataSlip issue={currentIssue} now={now} /> : null}
    </main>
  );
}
```

- [ ] **Step 4: Verify mobile behavior**

Run:

```bash
cd travel-planner
npm test -- tests/components/mobile-today.test.tsx
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit mobile mode**

```bash
git add travel-planner/src/features/trips/components/mobile-today.tsx travel-planner/src/features/trips/components/trip-workspace.tsx travel-planner/src/app/globals.css travel-planner/tests/components/mobile-today.test.tsx
git commit -m "feat: add responsive mobile trip mode"
```

---

### Task 11: End-to-end flow, accessibility, and production build

**Files:**
- Create: `travel-planner/e2e/trip-planning.spec.ts`
- Modify: `travel-planner/playwright.config.ts`
- Modify: `travel-planner/README.md`

**Interfaces:**
- Verifies the public user journey; produces no new application API.
- Documents synthetic-data limits and commands in `travel-planner/README.md`.

- [ ] **Step 1: Write the failing end-to-end test**

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("plans, warns, replaces, locks, and recalculates", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Origin").fill("Basel");
  await page.getByLabel("Destination").fill("Bernese Oberland");
  await page.getByRole("button", { name: "Build sample plan" }).click();

  await expect(page.getByText("Synthetic demonstration data")).toBeVisible();
  await expect(page.getByText("Review needed")).toBeVisible();
  const originalTotal = await page.getByTestId("group-total").textContent();

  await page.getByRole("tab", { name: "Stay" }).click();
  await page.getByRole("button", { name: "Replace accommodation" }).click();
  await page.getByRole("button", { name: "Use budget stay" }).click();
  await expect(page.getByTestId("group-total")).not.toHaveText(originalTotal ?? "");

  await page.getByRole("button", { name: "Lock accommodation" }).click();
  await expect(page.getByText("Accommodation locked")).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

- [ ] **Step 2: Run the end-to-end test and verify red**

Run:

```bash
cd travel-planner
npx playwright install chromium webkit
npm run test:e2e -- e2e/trip-planning.spec.ts
```

Expected: FAIL until the route exposes the exact accessible labels and interactions.

- [ ] **Step 3: Make only the test-required corrections and document limits**

Correct missing labels, test IDs, focus behavior, or route wiring surfaced by the test. In `README.md`, document setup, test commands, the synthetic data boundary, excluded live APIs/AI/auth/offline behavior, and the five-release roadmap path.

- [ ] **Step 4: Run the complete verification suite**

Run:

```bash
cd travel-planner
npm test
npm run test:e2e
npm run typecheck
npm run lint
npm run build
```

Expected: every command exits 0; Vitest and Playwright report zero failures; the Next.js production build completes.

- [ ] **Step 5: Commit the verified vertical slice**

```bash
git add travel-planner/e2e travel-planner/playwright.config.ts travel-planner/README.md
git commit -m "test: verify travel planner vertical slice"
```

---

### Task 12: Visual finish review and design-system record

**Files:**
- Create: `travel-planner/.impeccable/review/desktop.png`
- Create: `travel-planner/.impeccable/review/mobile.png`
- Create: `travel-planner/DESIGN.md`
- Create: `travel-planner/DESIGN.json`
- Modify only if findings require it: files under `travel-planner/src/app/` and `travel-planner/src/features/trips/components/`

**Interfaces:**
- Produces the final visual-review evidence and durable design-system record.
- Does not change product scope or domain behavior.

- [ ] **Step 1: Capture the approved surfaces once**

Run the production build locally. Capture the planning workspace at 1440×1000 and mobile trip mode at 390×844 after motion settles. Open both files and verify they contain the intended page, no loading state, and no blank region.

- [ ] **Step 2: Run the mechanical UI detector once**

Run:

```bash
node /Users/stella/.codex/skills/impeccable/scripts/detect.mjs --json travel-planner/src/app travel-planner/src/features/trips/components
```

Fix mechanical findings in one batch. Do not rerun the detector.

- [ ] **Step 3: Run the Impeccable finish review**

Provide the reviewer with the original request, approved answers, spec path, artifact path, desktop and mobile screenshots, direction contract, detector findings, craft-floor reference, and chosen quality-bar images. Act on `recapture`, `rebuild`, `fix`, or `ship` exactly as directed, using no more than the bounded review rounds allowed by the skill.

- [ ] **Step 4: Record the shipped design system**

After the last visual correction, use the Impeccable documenter to generate `travel-planner/DESIGN.md` and `travel-planner/DESIGN.json` from the built interface. Verify the production output still contains the direction-contract seed `896b79e7`.

- [ ] **Step 5: Re-run completion verification**

Run:

```bash
cd travel-planner
npm test
npm run test:e2e
npm run typecheck
npm run lint
npm run build
rg -n "896b79e7" .next
```

Expected: all commands exit 0, both test suites report zero failures, the build succeeds, and the direction contract is present in emitted output.

- [ ] **Step 6: Commit visual review and design documentation**

```bash
git add travel-planner
git commit -m "docs: record travel planner design system"
```

## Completion boundary

Completing this plan produces a truthful synthetic-data MVP vertical slice. It does not complete live supplier integration, LLM orchestration, comprehensive feasibility/pass optimization, authentication, durable database persistence, or offline reload support. Those requirements remain assigned to Releases 2–5 in `docs/superpowers/plans/2026-08-24-ai-travel-budget-planner-roadmap.md`.
