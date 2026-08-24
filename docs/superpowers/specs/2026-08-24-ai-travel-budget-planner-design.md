# AI Travel Budget Planner — Product and System Design

**Date:** 2026-08-24

**Status:** Approved design

**Platform:** Responsive web application

**Initial market:** Europe-first

**Recommended stack:** Next.js with TypeScript

**UI workflow:** Code-first after approved UI design

## 1. Purpose

AI Travel Budget Planner replaces the manual work of searching multiple sites for destinations, transport, accommodation, activities, local travel, restaurants, supermarkets, passes, and prices. It converts a travel request into one feasible, explainable itinerary with an itemized budget.

The product serves solo travelers, budget-conscious college students, families taking short summer trips, and small groups taking short ski trips. One traveler may act as organizer for the group.

Success means a traveler can generate a realistic plan, understand every material cost and uncertainty, replace a major choice, and receive a correctly recalculated itinerary without using a spreadsheet or manually reconciling many travel sites.

## 2. Product principles

1. Show the whole trip and its true estimated cost in one place.
2. Never hide assumptions, exclusions, stale data, or uncertainty.
3. Keep itinerary feasibility and budget calculations deterministic and testable.
4. Let travelers replace choices without rebuilding the trip manually.
5. Optimize for the actual group, including ages and discount eligibility.
6. Prefer an honest partial result over a confident fabrication.

## 3. Scope

### 3.1 First-release capabilities

- Two entry modes: **I know where** and **Inspire me**.
- Chat-first trip intake with visible, editable constraints.
- Optional budget with a strict-maximum setting.
- Destination recommendations when the destination is unknown.
- Door-to-destination transport comparisons.
- Accommodation recommendations.
- Day-by-day activities and attractions matched to the trip intention and goals.
- Local transportation, walking time, transfer time, and realistic buffers.
- Restaurant, takeaway, and supermarket eating strategies with estimated costs.
- National, regional, city, family, student, group, and attraction pass comparison when supported by available data.
- A primary itinerary with cheaper and premium substitutions for individual items.
- Itemized costs by traveler and category, plus per-person and group totals.
- External supplier links for checking and booking.
- Saved trips, locked choices, itinerary versions, undo, and automatic repricing.
- Desktop planning and simplified mobile trip mode.

### 3.2 Explicit non-goals for the first release

- In-app bookings, payments, refunds, cancellations, or customer support for suppliers.
- Guaranteed availability or guaranteed prices.
- Comprehensive worldwide provider coverage at launch.
- Social feeds, public itineraries, travel-agent back-office features, or marketplace functionality.
- Automatic purchasing or changing a booking on the traveler's behalf.

## 4. User input and trip brief

The conversation is converted into a structured trip brief containing:

- Origin and destination, or permission to recommend destinations.
- Exact dates or flexible date range and duration.
- Traveler count, ages, and applicable student or family status.
- Trip intention, goals, interests, and must-do activities.
- Desired pace and preferred daily start and finish times.
- Accommodation and transport preferences.
- Dietary needs, eating style, and supermarket-versus-restaurant preference.
- Mobility, accessibility, fatigue, luggage, and child-related needs.
- Optional budget, budget currency, and strictness.
- Locked choices, exclusions, and willingness to trade time for cost.

The AI asks only for missing information that materially affects the result. Every field remains visible and editable outside the chat.

## 5. Core user journey

1. The traveler chooses **I know where** or **Inspire me**.
2. They describe the trip conversationally.
3. The app extracts a structured brief and asks for missing essentials.
4. The system searches transport, lodging, activities, food costs, local travel, passes, and relevant conditions.
5. Candidate plans are evaluated for cost, eligibility, geography, timing, and feasibility.
6. The app presents one primary plan with an itemized budget and substitutions.
7. The traveler edits through chat or direct controls, locks decisions, and compares replacements.
8. The itinerary, passes, warnings, and budget update together.
9. The traveler checks supplier links before booking externally.
10. During the trip, mobile mode surfaces today's schedule, directions, tickets or links, and current warnings.

## 6. Planning intelligence

### 6.1 Trip interpreter

The interpreter converts natural language into the structured trip brief. It identifies missing constraints but does not invent preferences.

### 6.2 Candidate and route engine

The engine discovers destinations and travel options, groups activities geographically, and builds candidate days. It accounts for:

- Door-to-door journey time.
- Transfers, minimum connection times, and safety buffers.
- Check-in, checkout, luggage storage, and local transit.
- Opening hours, activity duration, meals, and rest.
- Traveler pace, child needs, mobility, and fatigue.
- Weather dependence and low-energy alternatives.
- The return journey rather than only outbound arrival.

### 6.3 Pass and discount optimizer

The optimizer compares individual fares with applicable passes. It evaluates traveler-specific eligibility and clearly shows:

- What the pass covers fully.
- What it discounts.
- What remains outside coverage.
- Required add-ons or child/family cards.
- Total cost under each option.
- Savings and the reason the recommended option wins.

The Switzerland reference guide is evidence for this required depth, not a source of current prices or rules.

### 6.4 Budget engine

The budget engine uses exact decimal arithmetic and explicit currencies. It separates:

- Confirmed or live prices.
- Recent estimates.
- Typical estimates.
- Covered or included items.
- Required additional costs.
- Optional upgrades.
- Daily discretionary allowance.
- Visible contingency.

It produces category totals, traveler totals, group totals, and the effect of every substitution. A strict-budget plan cannot be marked feasible while knowingly exceeding the limit.

### 6.5 Practical guidance

When supported by trustworthy data, the result may include operational details such as ticket-purchase steps, request-stop instructions, viewing-side suggestions, weather checks, live-webcam advice, pickup locations, digital delivery, and fatigue or bad-weather shortcuts.

These details must follow the same source, freshness, and warning rules as prices and schedules.

## 7. System architecture

### 7.1 Responsive web client

The web client owns the chat-first interface, structured controls, itinerary views, map, budget, warnings, substitutions, and mobile trip mode. It never performs authoritative financial or eligibility calculations in presentation code.

### 7.2 Trip orchestration service

The orchestrator maintains the trip brief, identifies missing information, coordinates provider searches and planning stages, and streams progress. It sends structured work to deterministic services and gives the AI only validated results to explain.

### 7.3 Provider adapters

Separate adapters normalize data from transport, accommodation, attraction, restaurant, supermarket-cost, mapping, weather, and pass sources. A stable internal interface allows providers to be replaced without rewriting the planning engine.

Every normalized result contains its supplier, source URL when available, retrieval time, currency, confidence type, and provider-specific reference.

### 7.4 Planning and feasibility service

This service creates and scores candidate plans, validates transfers and opening hours, prevents overloaded days, and calculates schedule effects when an item changes.

### 7.5 Pricing and pass service

This service applies traveler rules, performs currency-safe arithmetic, compares passes, computes totals, and reports exact reasons for coverage and savings.

### 7.6 AI explanation layer

The AI writes conversational questions, summaries, explanations, and change suggestions. It may mention only facts included in the validated structured result. It does not independently calculate totals, assert supplier facts, or silently fill missing data.

### 7.7 Storage and caching

Persistent storage contains profiles, traveler details, saved trips, itinerary versions, locks, exclusions, and price snapshots. Provider results are cached only as long as appropriate for that data class. Cached data retains its original source and retrieval time.

## 8. Data flow

`conversation → structured trip brief → provider searches → normalized candidates → route and pass optimization → feasibility and pricing checks → structured plan → AI explanation → traveler edits → targeted re-search and recalculation`

Changing one item invalidates only dependent results. For example, changing accommodation may invalidate local travel time and daily sequencing without forcing a new flight search.

## 9. Interface design: Tabbed Travel Manual

The approved visual world is a tabbed reference manual with layered verification information. It uses the interaction clarity of a working travel guide rather than a generic destination-card dashboard.

### 9.1 Design thesis

The travel plan behaves like an open, living manual. Transport, stay, days, food, budget, and checks are distinct sections, but they remain part of one coherent trip. Verification information sits as a visible layer on top of the relevant content.

### 9.2 Main planning workspace

- **Left margin:** persistent AI conversation and compact trip brief.
- **Center leaf:** the active planning section and its primary controls.
- **Right tab rail:** Overview, Travel, Stay, Days, Food, Budget, and Checks.
- **Top status rail:** group total, per-person total, checked-item count, warnings, and last refresh.
- **Current section:** a full-strength section board color; other surfaces remain quiet and readable.

The visual reference uses milk-acetate layers, printed rules, punched details, and stepped colored tabs. The product must preserve clarity and accessibility rather than copying decorative artifacts literally.

### 9.3 Primary screens

1. Trip setup and conversational intake.
2. Destination comparison for **Inspire me**.
3. Main overview with the trip summary and current readiness.
4. Transport comparison and door-to-door route.
5. Accommodation options and geographic trade-offs.
6. Day-by-day schedule with transfers, walking, meals, and fallbacks.
7. Food plan covering restaurants, takeaway, and supermarkets.
8. Pass comparison with coverage and traveler eligibility.
9. Itemized budget by traveler and category.
10. Checks page grouping verified, estimated, stale, conflicting, failed, and unavailable items.

### 9.4 Direct editing

Every major item supports Replace, Lock, View alternatives, and View source. Replacements show the schedule and budget impact before confirmation. The traveler can undo a change or restore a prior itinerary version.

### 9.5 Mobile trip mode

Mobile mode prioritizes today's schedule, the next journey leg, directions, tickets or booking links, and current warnings. The stepped section tabs become a compact horizontal rail. Total budget and warning count remain visible. Essential saved information should remain available when connectivity is weak.

## 10. Uncertainty, sources, and warnings

Uncertainty is item-specific. A general disclaimer cannot replace a warning attached to the affected transport leg, hotel, activity, pass, or cost.

Each warning appears as an errata slip containing:

- Status: live, recently checked, typical estimate, stale, conflicting, unavailable, or failed.
- Plain-language explanation of what is uncertain and why.
- Current value or last known value.
- Retrieval time and source identity.
- Consequence for feasibility or budget.
- A **Check with supplier** external link when available.
- A refresh action when the provider supports one.

Warnings use icon, label, and text in addition to color. Critical warnings remain visible in the overview and on the affected item. Less important estimates remain discoverable without overwhelming the main reading path.

## 11. Plan readiness states

- **Draft:** material research is incomplete.
- **Review needed:** the plan is usable but contains important estimates, stale data, conflicts, or unresolved warnings.
- **Ready to book:** every required item is within the configured freshness window for its data class and no feasibility failure remains. Freshness windows are explicit policy values, not AI judgments.

“Ready to book” never promises supplier availability. The traveler must still confirm and book externally.

## 12. Failure handling

- **Supplier unavailable:** use a last-known value only with visible age and status; otherwise mark unavailable.
- **Conflicting sources:** prefer the most authoritative source, disclose the conflict, and do not call the item verified.
- **Price change:** show old and new values plus budget impact before changing a locked plan.
- **Impossible connection:** block ready status and offer feasible replacements.
- **Strict budget infeasible:** show the exact shortfall and specific constraint changes that would resolve it.
- **Partial research:** show completed sections while unfinished sections remain visibly pending.
- **AI explanation failure:** preserve the structured plan so the result is not lost with the conversational layer.
- **Broken supplier link:** retain supplier name, reference, and search details for manual checking.

## 13. Accessibility, responsiveness, and localization

- Full keyboard operation and visible focus.
- Semantic headings, landmarks, tables, buttons, tabs, and warning relationships.
- Screen-reader summaries for total budget, readiness, and critical warnings.
- Status communication never relies on color alone.
- Sufficient contrast in every section color.
- Reduced-motion support; section changes do not require animation to be understood.
- Desktop planning and mobile trip mode receive separate responsive validation.
- Dates, times, units, currencies, and number formats follow traveler locale while preserving original supplier currency where needed.

## 14. Verification strategy

### 14.1 Deterministic tests

- Currency and decimal arithmetic.
- Per-traveler and group totals.
- Age, student, family, and group rules.
- Pass coverage and comparison.
- Strict-budget enforcement and contingency.
- Dependency invalidation and recalculation.

### 14.2 Integration and contract tests

- Contract tests for every provider adapter.
- Source, timestamp, currency, and status preservation through normalization.
- Provider failures, timeouts, rate limits, stale cache, and conflicting results.

### 14.3 Planning scenarios

- Solo city trip.
- Budget student trip.
- Short family summer trip with a child.
- Short ski trip with weather-dependent activities.
- Known destination and destination-inspiration flows.
- Feasible, infeasible, and strict-budget-impossible cases.

### 14.4 AI grounding tests

- Explanations may use only facts present in the validated structured result.
- Missing supplier facts remain missing rather than being inferred.
- Warnings and uncertainty survive summarization and follow-up edits.

### 14.5 Interface tests

- Generate, replace, lock, unlock, undo, restore, refresh, and reprice.
- Keyboard and screen-reader navigation.
- Non-color warning comprehension.
- Desktop, narrow desktop, tablet, and mobile layouts.
- Mobile trip essentials under weak or absent connectivity.

## 15. MVP acceptance criteria

The first release is acceptable when:

1. A user can create a trip in both known-destination and inspiration modes.
2. The plan covers transport, accommodation, activities, local travel, food strategy, and budget.
3. Every material result displays source freshness and confidence status.
4. Uncertain results show prominent item-level warnings and supplier links when available.
5. The system detects infeasible transfers and blocks ready status.
6. Traveler ages and eligibility affect prices and pass recommendations correctly.
7. Replacing one major choice recalculates dependent schedules and totals.
8. A strict-budget plan never knowingly exceeds the limit while claiming feasibility.
9. The traveler can understand per-person, category, and group costs.
10. The interface works with keyboard and screen readers and remains usable on mobile.

## 16. Implementation boundary

This document defines the approved product and system design. It does not authorize additional first-release features beyond the stated scope. Provider selection, detailed schemas, endpoint contracts, delivery milestones, and task sequencing belong in the implementation plan created after the written specification is reviewed and approved.
