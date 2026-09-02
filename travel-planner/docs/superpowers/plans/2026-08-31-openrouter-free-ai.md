# OpenRouter Free AI Planning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate travel plans with OpenRouter's free-model router and present overload failures as a recoverable Spendwise plan-page state.

**Architecture:** The client flow will call the existing `AITripProvider`, which posts the normalized brief to `/api/plan`. The server route remains responsible for OpenRouter credentials, model selection, response validation, and a stable overload error contract; the page owns loading, successful-plan, and failed-plan state.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library, OpenRouter chat completions API

**Spec:** `docs/superpowers/specs/2026-08-31-openrouter-free-ai.md`

## Global Constraints

- Use `openrouter/free` through the existing server route.
- Never expose `OPENROUTER_API_KEY` to browser code.
- Never silently replace an AI failure with synthetic data.
- Preserve unrelated worktree changes.

---

### Task 1: Guided AI generation contract

**Files:**
- Test: `tests/components/guided-trip-setup.test.tsx`
- Test: `tests/components/auth-flow.test.tsx`
- Modify: `src/features/trips/components/guided-trip-setup.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `AITripProvider.search(brief: TripBrief): Promise<ProviderTripResult>`
- Produces: final “Generate travel plan” action, “Generating plan…” loading state, and a POST to `/api/plan`

- [ ] **Step 1: Write failing tests** proving the review page offers live AI generation and the submitted brief reaches `/api/plan`.
- [ ] **Step 2: Run the focused tests** and confirm failures are caused by the current demo copy and synthetic provider.
- [ ] **Step 3: Implement the minimum change** by replacing `SyntheticTripProvider` with `AITripProvider` and updating review/loading copy.
- [ ] **Step 4: Run the focused tests** and confirm they pass.

### Task 2: Recoverable overloaded-model plan page

**Files:**
- Test: `tests/components/auth-flow.test.tsx`
- Create: `src/features/trips/components/ai-plan-error.tsx`
- Modify: `src/features/trips/providers/ai-provider.ts`
- Modify: `src/app/api/plan/route.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: non-OK `/api/plan` responses
- Produces: stable `AI model is overloaded. Try again later.` error copy plus retry and edit-brief controls

- [ ] **Step 1: Write a failing test** that returns an overloaded API response and expects the plan-page recovery state.
- [ ] **Step 2: Run the focused test** and confirm it fails because errors currently remain on the review page.
- [ ] **Step 3: Implement the minimum error state** and map unavailable/rate-limited OpenRouter responses to the stable overload message.
- [ ] **Step 4: Run the focused tests** and confirm retry and edit-brief behavior pass.

### Task 3: Spendwise avatar and workspace identity

**Files:**
- Test: `tests/components/auth-flow.test.tsx`
- Test: `tests/components/workspace.test.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/features/trips/components/trip-workspace.tsx`

**Interfaces:**
- Consumes: signed-in `AppNav` state and a generated `TripPlan`
- Produces: mint avatar with dark contrast and “AI plan” navigation context

- [ ] **Step 1: Write failing behavior tests** for generated-plan identity while retaining the accessible signed-in label.
- [ ] **Step 2: Run the focused tests** and confirm the current demo identity fails.
- [ ] **Step 3: Apply the minimum copy and CSS changes** using `#bce8d0` and `#10201b`.
- [ ] **Step 4: Run the focused tests** and confirm they pass.

### Task 4: Verification and documentation

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: `OPENROUTER_API_KEY` and optional `OPENROUTER_MODEL`
- Produces: documented local setup and verified release-quality flow

- [ ] **Step 1: Update setup documentation** for the server-only OpenRouter variables and free-router limitations.
- [ ] **Step 2: Run `npm test`**, expecting all tests to pass.
- [ ] **Step 3: Run `npm run typecheck` and `npm run lint`**, expecting no errors.
- [ ] **Step 4: Run `npm run build`**, expecting a successful production build.
- [ ] **Step 5: Verify desktop and mobile layouts** in the live local demo, including avatar contrast, loading, overload recovery, retry, and generated-plan navigation.
