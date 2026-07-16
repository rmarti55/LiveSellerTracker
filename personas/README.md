# LiveIntel Persona Library

Grounded personas + empathy maps for the live-selling ecosystem. **These exist so we build features
that solve real user problems** — not data nobody acts on.

## The rule
**Before building any user-facing feature, read the relevant persona.** Every feature should trace to
a documented pain / job-to-be-done. If it doesn't map to a persona need, question whether to build it.
(This is also pointed to from the repo's `CLAUDE.md`.)

## How each persona is structured
Each persona lives in `personas/<persona>/` with:
- `persona.md` — the archetype: snapshot, goals, motivations, pains, jobs-to-be-done, day-in-the-life,
  the growth arc, and a **Needs → Features** table (the bridge from research to code).
- `empathy-map.md` — Says / Thinks / Does / Feels + Pains + Gains, and how features should *feel*.
- `evidence.md` — the real research + source links behind every claim (no invented facts).

## Personas
| Persona | Status | Who |
|---|---|---|
| **[Live Seller](./live-seller/persona.md)** | ✅ Built (primary) | Growth-stage reselling entrepreneur turning a side-hustle into real income (Bri). |
| Buyer / Collector | ⏭ Planned | The bidder/shopper — deal-hunters, collectors, community regulars. |
| Seller-Educator / Creator | ⏭ Planned | Scaled sellers who monetize teaching others (e.g. @momsandcrumbs) — want data to teach + differentiate. |
| Brand / Retailer | ⏭ Planned | Brands & retailers using live commerce as a channel; want category/competitor intelligence. |
| Sourcing Supplier | ⏭ Planned | Wholesalers/liquidators selling *to* sellers; want demand signals. |

## Ecosystem note
The live seller is an **arc** (aspiring → growth → scaled), not a fixed point. The primary persona
centers the **growth stage** — the segment with the highest need for, and willingness to pay for,
market data. Aspiring and scaled sellers are captured as arc endpoints in `live-seller/persona.md`;
the scaled seller often *becomes* the future Seller-Educator persona.
