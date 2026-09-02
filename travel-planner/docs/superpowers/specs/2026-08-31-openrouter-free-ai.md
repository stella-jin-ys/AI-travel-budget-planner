# OpenRouter Free AI Planning Spec

## Goal

Enable signed-in users to generate a travel plan through the existing OpenRouter `openrouter/free` server route.

## Requirements

- Use Spendwise mint `#bce8d0` for the signed-in avatar and dark text for contrast.
- Replace the synthetic trip provider in the guided flow with `AITripProvider`.
- Label the final action “Generate travel plan” and show a clear loading state while generation is running.
- Replace demo and paused-AI language with live AI-planning language.
- Do not silently fall back to synthetic data.
- If OpenRouter or a free model is unavailable, show the travel plan page with: “AI model is overloaded. Try again later.”
- Let the user retry generation or edit the brief from that recovery page.
- Verify focused tests, the full test suite, typecheck, lint, build, and desktop/mobile layouts.

## Constraints

- Keep the API key server-only.
- Keep the existing `/api/plan` validation and normalized `TripPlan` boundary.
- Preserve unrelated worktree changes.
