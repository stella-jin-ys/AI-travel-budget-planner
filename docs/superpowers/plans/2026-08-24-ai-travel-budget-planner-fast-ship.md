# AI Travel Budget Planner: fast-ship plan

## Current state

Tasks 1-8 are already implemented on `codex/ai-travel-budget-planner`: domain money/budget/readiness, synthetic Switzerland fixture, reducer with undo/locks, Tabbed Travel Manual shell, guided setup, and route mounting. The remaining gap is that section leaves are placeholders and deployment is not configured.

## Goal

Ship a usable synthetic-data MVP quickly: generate a Switzerland family plan, show editable travel/stay/days/food/budget/checks sections, replace and lock options, show item-level warnings and exact totals, pass one public-flow check, and deploy it.

## Fast path

1. **Finish one functional planner slice**
   - Batch Tasks 9 and 10 into one implementation pass.
   - Implement the seven leaves, replacement confirmation, lock state, budget recalculation, warnings, and compact mobile mode.
   - Keep the existing design system and synthetic boundary. No new provider, auth, database, AI call, booking, or extra route.
   - Add only focused interaction tests for replace, lock, warning, total change, and mobile next item.

2. **Ship verification and docs**
   - Batch the essential parts of Task 11: one Playwright public-flow test, accessibility scan, README boundary, typecheck, lint, unit tests, and production build.
   - Skip a second per-task reviewer loop. Run one independent final review over the combined diff and fix only blocking findings.
   - Capture one desktop and one mobile screenshot for a lightweight visual sanity check; do not run a separate visual polish round unless the build is visibly broken.

3. **Deploy**
   - Add the minimal Sites hosting configuration, build the production app, and publish the `travel-planner` app with Sites hosting.
   - Return the deployed URL plus local run/test commands.

## Explicitly deferred

Live supplier APIs, live AI orchestration, booking/payments, authentication, persistence, broad destination coverage, offline reload, pass optimization, and a full design-system document remain later releases.

## Done means

`npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and the single Playwright flow pass; the route visibly labels synthetic data and uncertain items; replacement changes the displayed total; locked items cannot be replaced; and a deployed URL is available.
