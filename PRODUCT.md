# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: Next.js with TypeScript is the recommended implementation stack for the responsive interface and server-side travel-data integrations.

## Users

- Solo travelers planning their own trips.
- Budget-conscious college students.
- Families taking short summer holidays.
- Small groups taking short ski trips.
- One traveler may act as the organizer for a group.

## Product Purpose

AI Travel Budget Planner replaces manual research across transport, accommodation, activities, restaurants, supermarkets, and travel passes. It creates a feasible itinerary and an itemized budget from the travelers, origin, dates, duration, intentions, goals, preferences, and optional spending limit.

Success means a traveler can understand, adjust, and act on one coherent plan without manually combining information from many travel sites or recalculating the budget.

## Positioning

The product combines conversational trip planning with deterministic route feasibility, pass optimization, traveler-specific eligibility rules, and automatic budget recalculation. It explains why a choice is economical instead of returning unexplained recommendations.

## Operating Context

- Users can start with a known destination or ask AI to recommend one.
- The launch scope is Europe-first, with international coverage added gradually.
- The primary interaction is chat-first, with editable constraints and a persistent budget summary kept visible.
- The app produces one primary plan with cheaper and premium substitutions for individual items.
- The first release compares options and links to external booking providers; it does not process bookings or payments.
- A destination-specific plan may include exact transfers, walking time, practical ticket instructions, weather-dependent decisions, fatigue alternatives, and local operational details.

## Capabilities and Constraints

- Input includes origin, destination or inspiration request, dates or duration, traveler count and ages, trip intention, interests, pace, dietary needs, mobility needs, and budget preference.
- Budget is optional. When omitted, the app estimates a realistic range. A strict-budget setting treats the amount as a maximum.
- Plans cover door-to-destination transport, accommodation, day-by-day attractions and activities, local transport, restaurant/takeaway/supermarket eating choices, and contingency.
- Costs are itemized by category and traveler, with per-person and group totals.
- The planner compares ordinary fares with national, regional, city, family, student, group, and attraction passes when data is available.
- Prices and schedules must display source status and freshness. Results distinguish live prices, recent estimates, and typical estimates.
- Every uncertain, stale, unavailable, or unverified element must carry a prominent warning rather than relying on a general disclaimer.
- When a supplier source is available, the warning includes its last-check time and a direct external link so the traveler can confirm current prices, schedules, availability, coverage, or restrictions.
- AI handles conversation and explanation. Deterministic services handle arithmetic, eligibility, schedules, feasibility, and verification.
- The app may propose a result only after feasibility and pricing checks. If no strict-budget plan is feasible, it explains the gap and suggests specific constraint changes.
- All booking actions leave the app through external links in the first release.

## Brand Commitments

- Working name: AI Travel Budget Planner.
- Explanations should be practical, transparent, and understandable to ordinary travelers.

## Evidence on Hand

- `/Users/stella/Desktop/Codex/travel budget AI assistant/Switzerland_Travel_and_Cost_Guide.md` demonstrates the desired depth for pass comparison, age-aware pricing, detailed daily logistics, optional costs, operational travel tips, and an itemized family budget.
- The guide's prices and schedules are reference examples, not verified current product data.
- No verified testimonials, customer claims, commercial benchmarks, logo, or other brand assets have been supplied; future work must not fabricate them.

## Product Principles

1. Make the full trip and its true cost understandable in one place.
2. Keep assumptions, estimates, exclusions, and price freshness visible.
3. Let users replace any major choice without rebuilding the trip manually.
4. Optimize for the actual traveler group, including ages and discount eligibility.
5. Prefer feasible, explainable plans over impressive but unverifiable AI output.
