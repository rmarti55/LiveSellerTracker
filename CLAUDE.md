# Project: Whatnot Live-Seller Market Intelligence ("Kalodata for Whatnot")

## What this is
A market-intelligence product for live-sellers. Scrape Whatnot's **public** data and turn it into
the metrics sellers pay for: what's selling now, top sellers/categories, price points &
sell-through, best times to go live, per-seller sales velocity.

## Build to the personas (read before adding user-facing features)
`personas/` holds grounded personas + empathy maps for our users. **Before building any seller-facing
feature, read `personas/live-seller/persona.md` — every feature should trace to a documented pain /
job-to-be-done** (see its Needs → Features table). Primary persona: "Bri", the growth-stage reselling
entrepreneur. Start at `personas/README.md`.

Wedge = Whatnot (TikTok Shop market-intel is saturated by Kalodata/FastMoss/EchoTik; Whatnot is
underserved). Delivery = server-side scraper + web dashboard (+ later a Chrome extension). NOT an
iOS app — scraping is server-side and Apple review rejects scraper apps.

## Status
Spike COMPLETE → **GO** (`spike/SPIKE-FINDINGS.md`). MVP thin slice **BUILT & VERIFIED**:
- `DataSource` seam (StubWhatnot fixtures ↔ RealWhatnot live GraphQL), chosen by `WHATNOT_SOURCE`.
- Metrics layer + 9 passing unit tests.
- Dashboard (Overview / Top Sellers / Categories / show + seller detail) — verified rendering on
  both stub and **live** data.
- Collector `app/api/cron/collect` + Drizzle schema (`db/`, migration generated & applied to real
  Postgres) + `vercel.json` hourly cron.

Next: provision Postgres + deploy to Vercel (user-run), then build time-series/trends UI on the
accumulating snapshots. RealWhatnot.getLiveShows currently defaults to the trading_card_games feed;
generalize category→feedId mapping when expanding.

## Stack (Vercel + GitHub-native)
- **Next.js (App Router, TypeScript) + Tailwind** — dashboard + API routes + collector in one codebase.
- **Drizzle ORM + serverless Postgres** (Vercel Postgres / Neon) — snapshot storage.
- **Vercel Cron** → `/api/cron/collect` — periodic snapshotting; starts the time-series clock.
- Commands: `npm run dev`, `npm run build`, `npm test`, `node spike/probe.mjs` (data-source liveness).

## Key technical facts (from the spike)
- **Data source:** `POST https://www.whatnot.com/services/graphql/?operationName=<Name>`.
  Anonymous, cookie-less, server-side requests return **HTTP 200** with real JSON. Reproduce:
  `node spike/probe.mjs`.
- **Do NOT scrape the HTML routes** — Cloudflare-gated (HTTP 403 to bots), no anonymous data. Use the
  GraphQL API (headless browser reading the Apollo cache is the fallback path).
- **Introspection is disabled**, but ad-hoc queries execute and errors leak the schema, so queries
  are reconstructable. Lift real query bodies (`LiveShopFeed`, seller, listing) from the web app.
- **Core entities:** `LiveStream` (activeViewers, status PLAYING/CREATED, title, startTime,
  totalWatchlistUsers, categories, user), `ListingNode` (price {amount,currency}, currentBid,
  auctionState, quantity, transactionType), `PublicUserNode` (sellerRating.numReviews as
  lifetime-sales proxy, premierShopStatus).
- Real captured samples live in `spike/captures/*.json` — used as `StubWhatnot` fixtures.

## Architecture — the seam pattern (multi-platform)
Every external/uncertain dependency behind an interface with a Stub + Real impl; build the whole
dashboard on stubs first, then flip seams to real one at a time.
- `lib/core/`: shared `types.ts` (Platform, LiveShow/Listing/Seller, Money; Listing has `soldCount`
  for TikTok), `datasource.ts` (`DataSource` interface), `index.ts` (`getDataSource(platform)`,
  `PLATFORMS`, `isPlatform`). Per-platform env flags: `WHATNOT_SOURCE`, `TIKTOK_SOURCE` (stub|real).
- `lib/whatnot/`: `StubWhatnot` (real captures) + `RealWhatnot` (free anonymous GraphQL).
- `lib/tiktok/`: `StubTikTok` (representative sample data) + `RealTikTok` (key-gated adapter to a paid
  scraper provider — TikTok has NO free API; needs `TIKTOK_PROVIDER_TOKEN`).
- `lib/metrics/`: pure functions deriving paid metrics — platform-agnostic, unit-tested.
- Routing: `app/[platform]/…` (whatnot|tiktok) with a platform toggle; `/` → `/whatnot`.
- Billing seam (later): stub ↔ real, key-gated.

## Constraints / guardrails
- **UI/design (locked):** see `docs/DESIGN.md` for fonts, tokens, components, and nav patterns. No
  unsolicited design refactors — extend via `components/ui.tsx` primitives unless the user explicitly
  asks for a design change.
- **Legal:** public, no-auth data only. Never capture/store `streamToken` or any private/logged-in
  data. Rate-limit and back off. Get counsel before commercial-scale scraping.
- **Vercel:** Cron granularity is tier-limited (hobby ≈ daily, Pro ≈ per-minute). Per-second live
  auction hammer-price capture is NOT feasible on Cron — needs a dedicated always-on worker (Phase 2).
- **Git:** the user runs every commit / push / Vercel deploy themselves, explicitly, each time. Do the
  edits; never commit, push, or open a PR unless asked in the moment.
