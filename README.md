# Whatnot Intel — live-seller market intelligence

Market-intelligence for Whatnot live-sellers: what's selling now, top sellers, category
demand, price points, and (over time) sales velocity — built on Whatnot's **public** GraphQL
data. Think "Kalodata for Whatnot." See `CLAUDE.md` for the full architecture and the data-source
facts, and `spike/SPIKE-FINDINGS.md` for the feasibility spike this is built on.

## Stack
Next.js 16 (App Router, TypeScript) · Tailwind v4 · Drizzle ORM + serverless Postgres (Neon /
Vercel Postgres) · Vercel Cron collector. Deployable by `git push` → Vercel.

## Quick start
```bash
npm install
cp .env.example .env.local     # WHATNOT_SOURCE=stub works with zero config
npm run dev                    # http://localhost:3000 — dashboard on captured sample data
npm test                       # metrics unit tests
```

Flip to live Whatnot data:
```bash
WHATNOT_SOURCE=real npm run dev
```

## Architecture (the seam)
`lib/whatnot/` is a `DataSource` interface with two implementations chosen by `WHATNOT_SOURCE`:
- `StubWhatnot` — real data captured during the spike (`lib/whatnot/fixtures.ts`); zero network.
- `RealWhatnot` — Whatnot's public GraphQL API (`https://www.whatnot.com/services/graphql/`),
  anonymous + server-side. Query bodies were lifted from the live app and validated headlessly.

`lib/metrics/` holds pure, unit-tested functions (topSellers, categoryDemand, pricePoints,
bestTimeToGoLive, sellerVelocity). Pages in `app/` render entirely through the seam.

## Collector (time-series)
`app/api/cron/collect` snapshots the current live shows into Postgres so time-series metrics
accrue. It's wired to run hourly via `vercel.json` cron. To enable:
1. Provision Postgres (Neon free tier or the Vercel Postgres integration); set `DATABASE_URL`.
2. `npm run db:push` (or apply `db/migrations/0000_init.sql`).
3. Set `CRON_SECRET` (Vercel Cron sends it as a Bearer token) and `WHATNOT_SOURCE=real` in prod.

## Guardrails
Public, no-auth data only — never store stream tokens or private data; rate-limit and back off.
Get legal counsel before commercial-scale scraping.
