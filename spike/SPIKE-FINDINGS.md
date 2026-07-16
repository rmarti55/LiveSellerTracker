# Whatnot Data-Feasibility Spike — Findings

**Date:** 2026-07-14
**Question this spike answers (the go/no-go for the whole product):** Can we reliably pull
Whatnot's public data, server-side, and structure it into the metrics live-sellers would pay for?

## Verdict: GO ✅

The data is public, richly structured, and reachable by an anonymous, cookie-less, **server-side**
request. No login, no browser required for the data path. This is the one thing that could have
killed the idea, and it doesn't.

---

## What we proved

### 1. The public GraphQL API answers headless, anonymous requests
- **Endpoint:** `POST https://www.whatnot.com/services/graphql/?operationName=<Name>`
- A plain `curl` with a normal browser User-Agent, **no cookies / no auth**, returns **HTTP 200**
  with real data. Reproduce anytime with: `node spike/probe.mjs` (3/3 checks pass).
- Evidence (`spike/captures/probe-results.json`):
  - `{ __typename }` → `{"data":{"__typename":"Query"}}`
  - `getFeedFromOnboardingOption(id:"BROWSE_FEED")` → real Feed `"title":"Browse By Category"`

### 2. HTML page routes ARE bot-gated — so use the API, not HTML scraping
- `curl https://www.whatnot.com/category/...` → **HTTP 403** (Cloudflare challenge, client-hint
  fingerprinting). The server-rendered HTML carries **no** live data for anonymous bots.
- Implication: scrape the **GraphQL API directly** (clean JSON, gated route is bypassed), OR drive
  a real headless browser and read the Apollo cache. The API path is faster and cheaper; keep the
  browser path as a robustness fallback.

### 3. Introspection is disabled — but queries are still reconstructable
- `__schema` → HTTP 400 `"introspection is disabled"`.
- **However**, the server executes arbitrary ad-hoc queries (no persisted-query lock) and its
  validation errors leak the schema: `"Did you mean ...?"`, `"argument 'id' of type 'ID!' is
  required"`, `"Fragment cannot be spread ... type 'FeedObject'"`. We reconstructed a working query
  purely from these hints. So we can rebuild every query we need by lifting field selections from
  the web app once and letting error messages guide the rest.

### 4. The data itself is exactly what a market-intel product needs
Captured from the live Apollo cache (see `spike/captures/*.json` for real records):

**Live shows** (`LiveStream`) — 31 pulled from one category in one shot:
`activeViewers`, `status` (PLAYING / CREATED=scheduled), `title`, `startTime`,
`totalWatchlistUsers`, `categories`, and resolved seller (`username`, `id`, `premierShopStatus`).
Real top row: `novatcg` — **1,642 concurrent viewers**, Pokémon Cards, premier shop.

**Per-item listings** (`ListingNode`) — the money data:
`price {amount,currency}`, `currentBid`, `currentBidCount`, `currentBidUser`,
`auctionState(channelId,channelType)`, `quantity`, `transactionType` (AUCTION / GIVEAWAY),
`transactionProps.auction {durationSeconds,isSuddenDeath}`, `publicStatus`, `title`, `subtitle`.
Real rows: `"HIGH END!"` $1.00 start / qty 728 / 30s auction; `"SLABS!"` $23.00 / qty 314.
→ Polling `auctionState`/`currentBid` during a live show captures **actual hammer prices per item**
  = settled-sales data (the thing EchoTik/Kalodata charge for).

**Per-seller signal** (`PublicUserNode`):
`sellerRating { numReviews, overall }`, `premierShopStatus`, `username`, `id`.
Real: `novatcg` = **144,437 reviews @ 4.9**. Review count is a public lifetime-sales proxy; tracking
its delta over time yields a sales-velocity estimate with zero private data.

---

## How this maps to the paid metrics (all derivable from the above)
| Metric sellers pay for | Source field(s) | How |
|---|---|---|
| What's selling right now | `auctionState` / `currentBid` over time | Poll live shows during broadcast |
| Top sellers / categories | `LiveStream.activeViewers`, `categories`, `sellerRating.numReviews` | Rank |
| Price points & sell-through | `ListingNode.price`, `currentBid`, `quantity` | Aggregate per category/item |
| Best time to go live | `startTime` × `activeViewers` across shows | Time-bucket the panel |
| Sales velocity per seller | `sellerRating.numReviews` delta | Snapshot daily, diff |
| Upcoming supply | `status:CREATED` + `startTime` + `totalWatchlistUsers` | Schedule board |

---

## Risks / caveats (honest)
- **Terms of Service.** hiQ / Meta-v-Bright-Data make scraping *public, no-auth* data broadly
  defensible under the CFAA, but Whatnot's ToS may still prohibit it and support a contract claim.
  Get counsel before commercial scale; never touch logged-in/private data or the `streamToken`
  (the browser tooling already flags those as sensitive — we did not capture them).
- **Query maintenance.** Since introspection is off, our reconstructed queries can break when
  Whatnot changes its schema. Mitigate by centralizing query definitions and adding a canary test.
- **Anti-bot on the API could tighten.** Today the API route is open to anonymous POSTs; that may
  change. Keep the headless-browser Apollo-cache path as a fallback, and be a polite citizen
  (rate-limit, back off) — the spike used only a handful of requests.
- **Live sold-price capture requires presence during the show.** Hammer prices only exist while an
  auction runs, so the ingestion worker must be connected during live windows (not a one-shot crawl).

## Recommended next step (build phase)
Behind the planned `DataSource` seam: implement `RealWhatnot` as a direct-GraphQL client
(`spike/probe.mjs` is the seed), lift the real `LiveShopFeed` / seller / listing query bodies from
the app, and build the dashboard against `StubWhatnot` fixtures (the JSON in `spike/captures/`)
first. Reproduce this spike anytime with `node spike/probe.mjs`.
