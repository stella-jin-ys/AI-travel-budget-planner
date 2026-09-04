# AI Budget Travel Planner

AI Budget Travel Planner creates a budget- and preference-based travel plan for solo travellers, students, families, and groups.

The planner combines transport, accommodation, activities, local travel, food, warnings, and budget calculations in one workspace. AI generation runs through the server-side Next.js API route so provider keys are never exposed in the browser.

## Live deployments

- [Vercel live app](https://ai-budget-travel-planner-stella.vercel.app/) — full server-side AI planning.
- [GitHub Pages build](https://stella-jin-ys.github.io/AI-budget-travel-planner/) — static Pages deployment.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

- `GEMINI_API_KEY` enables Gemini planning. `GEMINI_MODEL` is optional.
- `OPENROUTER_API_KEY` enables OpenRouter; `OPENROUTER_MODEL` optionally overrides the default `openai/gpt-oss-20b:free` model.
- `AI_PROVIDER` selects `gemini` or `openrouter` when both keys are configured.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` enable server-side trip-plan persistence.

Keep `.env.local` and all real keys out of Git. Add the same variables to the Vercel project environment settings for production.

## Validation

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

The repository root is the Next.js project root. Vercel uses the default root directory and `.github/workflows/pages.yml` builds the GitHub Pages export.
