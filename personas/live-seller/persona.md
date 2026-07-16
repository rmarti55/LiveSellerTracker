# Persona: The Live Seller — "Bri, the Reseller Mom Building Real Income"

> **Primary persona for LiveIntel.** A composite grounded in real research — every claim traces to
> [`evidence.md`](./evidence.md). Read this before building any seller-facing feature; each feature
> should answer one of Bri's pains (see [Needs → Features](#needs--features)).

---

## Snapshot
| | |
|---|---|
| **Name / archetype** | Bri — growth-stage reselling entrepreneur |
| **Age / life stage** | 33, mom of two (5 & 8), partnered, one household income + her reselling |
| **Location / space** | Suburban Ohio; sells from a converted garage / spare bedroom (outgrowing it) |
| **Prior life** | Retail supervisor + a stint in nursing school; started thrifting-to-flip on the side |
| **Platform** | Whatnot primary (eyeing TikTok Shop); women's fashion, shoes, accessories, beauty, liquidation |
| **Cadence today** | Goes live **3–4 nights/week**, ~90 min/show, after kids' bedtime |
| **Income today** | ~$3–5K/month gross; wants to hit **$10K/mo and quit her day job** |
| **Stage on the arc** | **Growth** (past first-show terror; not yet warehouse-scaled) |
| **Tech comfort** | Comfortable on her phone; *not* technical — no spreadsheets-as-dashboards, no APIs |

## Origin story (why she's here)
Bri started flipping thrift finds for extra money. Her first Whatnot show was tiny and terrifying —
she nearly quit — but a few shows in she made her first sales and got hooked on the mix of income,
community, and creative control. Now it's real money and real hours. She's read the success stories
(sellers doing $10K+/mo, going full-time) and believes she can get there — but she's learning
**by trial and error**, and every wrong bet costs money she doesn't have to waste. She's seen sellers
like **@momsandcrumbs** go from *"$60,000 in debt"* to a warehouse, and she wants that arc without the
$60K-in-debt part.

## Goals
- **Turn the side-hustle into a real, predictable full-time income** (~$10K/mo, quit the day job).
- **Grow followers + repeat buyers** so shows aren't a cold start every night.
- **Stop guessing** — source inventory that actually sells, price it right, show up at the right times.
- **Protect her money and her energy** — no dead inventory, no burnout, no emotional whiplash.

## Motivations
- Financial freedom + flexibility around her kids (the "real income from home" dream).
- Autonomy and identity — she's building *her* business, not clocking in.
- The dopamine of a hot show + a supportive community; being seen as someone who "made it."

## Frustrations / pains (all grounded — see evidence.md)
1. **Sourcing roulette.** "Will this pallet/lot sell, or become a **dead pile in my garage**?" She
   fears getting scammed on wholesale (grading, freight, returns) and scaling too early.
2. **Pricing blind.** Doesn't know what comparable items *actually* sell for live, so she leaves money
   on the table or kills momentum with bad starts.
3. **Timing guesswork.** Knows cadence matters but not **when** to go live for the most buyers, or how
   often is worth the exhaustion.
4. **Flying blind vs competitors.** Sees bigger sellers winning but can't see *what* they do — their
   categories, price points, cadence, what's working.
5. **The emotional toll.** A slow show feels personal and scary; income is unpredictable; burnout looms.
   She wants **objective proof she's actually growing**, not just vibes.
6. **Overwhelm.** She's a solo operator doing sourcing + hosting + packing + shipping + marketing; she
   has no time or appetite for complex tools.

## Jobs To Be Done
- **Functional:** "Help me decide *what to source*, *what to charge*, and *when to go live* — using what's
  actually selling right now — so I stop wasting money and time."
- **Emotional:** "Show me I'm making progress and reassure me a slow night isn't failure."
- **Social:** "Help me look like a pro and hold my own against the big sellers."

## A day in the life
Morning: kids to school, then sourcing — scrolls suppliers/FB groups/thrift runs, second-guessing every
buy. Afternoon: photographs/lists items, preps the night's lineup, packs yesterday's orders for the 2-day
ship window. Evening: kids down by 8, live by 8:20 for ~90 min — greeting regulars, running $1 starts and
bundles, reading the room. After: counts the night, feels great or gutted, wonders if she picked the right
night/items, and plans tomorrow's sourcing. **Every decision is a bet made on gut feel.**

## Tools & channels
Whatnot app (host), phone + tripod + ring light, a shipping station, a notebook/loose spreadsheet for
inventory, FB reseller groups + TikTok/YouTube for tips, Discord/community for support. **Consumes info
on her phone, in plain language.**

## The arc (design for movement along it, not a fixed point)
- **Aspiring** (pre / first shows): needs confidence + proof it's worth it. *"I sold 8 items 🥰."*
- **Growth (Bri — our primary):** going live weekly, actively optimizing what/when/how-much; **highest
  need for and willingness to pay for market data.**
- **Scaled** (@momsandcrumbs): warehouse, daily cadence, teams, second accounts; wants efficiency,
  defense, and edge — and often becomes a **seller-educator** (a future persona).

---

## Needs → Features
The bridge from Bri's pains to what we build. Each LiveIntel feature must trace to a row here.

| Bri's pain (her words / behavior) | LiveIntel feature | Status |
|---|---|---|
| "Will this be a **dead pile**?" — can't judge demand/sell-through before sourcing | Category demand + **sell-through / sold-count** + price points, filterable by category | ✅ **Shipped v1** — `/[platform]/whats-selling`: demand-ranked (TikTok sold-count) + price-forward (Whatnot snapshot). True velocity-over-time still needs history (P4) |
| "What do I **charge**?" — prices blind | Price-point distribution (low/median/avg/high) + live bid data per category/item | ✅ Have on show-detail + seller teardown; 🔶 per-category price *explorer* still open |
| "**When** do I go live?" (cadence = income) | Best-time-to-go-live heatmap + recommended cadence | ✅ Best-time + a plain-language "go live around HH:00" nudge; 🔶 cadence guidance needs history (P4) |
| "**Who's beating me** and how?" | Top sellers + **competitor teardown** (their categories, price points, cadence, viewer trend) | ✅ **Shipped** — seller page is now a teardown (price points, category focus, what's moving, reach). Viewer *trend* needs history (P4) |
| "**Am I growing?**" (emotional toll, needs proof) | Sales-velocity / viewer & review trends over time; personal progress view | 🔴 Backlog (P4) — **needs collector history** (deploy + DB) |
| "**What's hot right now?**" | Trending categories + rising products/searches | ✅ Category demand + 🔥/🟡/🐢 heat verdicts; 🔶 trend *deltas* need history (P4) |
| "I have **no time**, I'm not technical" | Dead-simple, one-glance UX; plain-language "do this next" nudges | ✅ Verdict labels + go-live nudge added; ongoing principle |

### Status: Phase 1 (build-now) SHIPPED — P1 What's Selling, P2 Seller teardown, P3 decision cues.
### Next: Phase 2 (P4) — trends / "am I growing?" — blocked on deploying the collector + Postgres.
