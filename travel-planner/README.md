This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# AI Travel Budget Planner

Europe-first AI travel planning for solo, student, family, and short ski-trip planning.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add a server-side OpenRouter key to `.env.local`:

```dotenv
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=minimax/minimax-m3:free
```

The server route supports structured JSON output from the configured provider. Availability, latency, and daily request limits can vary, so the UI keeps the trip brief recoverable when generation is overloaded.

## Verify

```bash
npm test
npm run test:e2e
npm run typecheck
npm run lint
npm run build
```

The guided flow generates plans through the server-only `/api/plan` route and validates model output before it reaches the workspace. It does not connect to live booking/payment systems, persist accounts, or claim live supplier availability without a source URL.
