# AI Travel Budget Planner Implementation Roadmap

**Spec:** `docs/superpowers/specs/2026-08-24-ai-travel-budget-planner-design.md`

The approved design contains independently reviewable systems. Implementing them as one plan would mix UI, AI behavior, supplier contracts, optimization, persistence, and offline behavior into a single high-risk delivery. The work is therefore split into five releases, each producing testable software.

## Release 1: Synthetic-data MVP vertical slice

**Executable plan:** `docs/superpowers/plans/2026-08-24-ai-travel-budget-planner-mvp-vertical-slice.md`

Build the responsive Next.js application, approved Tabbed Travel Manual interface, structured trip brief, deterministic sample provider, budget engine, readiness rules, item-level uncertainty warnings, replacements, locks, undo, and desktop/mobile layouts. This release proves the product interaction and domain boundaries without claiming live prices.

## Release 2: Supplier adapters and freshness infrastructure

Select providers after a separate coverage, licensing, cost, rate-limit, and terms review. Implement normalized adapters, cache policy, source timestamps, supplier links, retries, timeouts, conflicts, and refresh actions. Replace synthetic data incrementally, one provider class at a time, while retaining adapter contract tests.

## Release 3: AI orchestration and grounded explanations

Add structured conversational extraction, missing-field questions, destination inspiration, tool orchestration, progress streaming, and explanations constrained to validated planning results. Add evaluation fixtures that reject unsupported claims and preserve uncertainty through summarization and edits.

## Release 4: Feasibility, routing, and pass optimization

Expand the deterministic engine for multimodal transfers, geographic day grouping, opening hours, luggage/check-in buffers, weather alternatives, traveler pace, age and student eligibility, pass coverage, and explainable savings comparisons.

## Release 5: Accounts, persistence, offline travel mode, and production hardening

Add authentication, reusable traveler profiles, database-backed saved trips and versions, offline essential-trip storage, localization, observability, privacy controls, accessibility certification, deployment, and operational runbooks.

## Coverage map

| Specification area | Owning release |
|---|---|
| Chat-first interface and structured controls | 1, completed with live AI behavior in 3 |
| Tabbed Travel Manual visual system | 1 |
| Budget arithmetic and strict-limit behavior | 1, expanded in 4 |
| Item-level warnings and supplier links | 1 with synthetic sources, live infrastructure in 2 |
| External booking links | 1 with synthetic examples, live links in 2 |
| Transport, stay, activities, food, and local travel | 1 as deterministic fixtures, live breadth in 2 and 4 |
| Supplier adapters, caching, conflicts, and freshness | 2 |
| AI conversation and grounded explanation | 3 |
| Destination inspiration | 3 |
| Route feasibility, maps, and pass optimization | 4 |
| Saved trips, traveler profiles, and durable versions | 5 |
| Offline mobile essentials | 5 |
| Accessibility and responsive behavior | Every release; production certification in 5 |
| Localization, observability, privacy, and deployment | 5 |

No release may present synthetic or estimated values as live supplier data. Each release inherits the uncertainty, source, deterministic-arithmetic, and external-booking constraints from the approved specification.
