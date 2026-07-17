# LiveIntel design system (locked)

This document is the canonical reference for the LiveIntel dashboard UI. **Do not change fonts, colors, nav chrome, typography scale, or shared components unless the user explicitly asks for a design change.**

Extend the UI by composing primitives from `components/ui.tsx`.

---

## Direction

- **Vibe:** “Live floor board” — command-center energy for sellers watching live demand.
- **Accent:** Teal chrome + hot red LIVE indicators. No purple/indigo brand.
- **Canvas:** Cool-tinted background with a subtle radial wash (`app/globals.css`).

---

## Fonts

Loaded in `app/layout.tsx` via `next/font/google`.

| Role | Font | Tailwind class |
|------|------|----------------|
| Display (brand, page titles, stat values, viewer counts) | **Syne** | `font-display` |
| UI body / meta | **DM Sans** | `font-sans` |

**Retired:** Geist, Arial. Do not reintroduce.

---

## Color tokens

Defined in `app/globals.css` `@theme`. Use Tailwind utilities: `text-ink`, `bg-panel`, `border-line`, etc.

### Light mode (default)

| Token | Hex | Purpose |
|-------|-----|---------|
| `background` | `#eef3f3` | Page canvas |
| `ink` | `#0a0f0f` | Primary text |
| `ink-muted` | `#4b5563` | Secondary text |
| `ink-faint` | `#6b7280` | Tertiary / captions |
| `signal` | `#0f766e` | Decorative accent (gradients, link hover) |
| `signal-soft` | `#ccfbf1` | Soft accent wash |
| `line` | `#c9d4d4` | Borders |
| `line-soft` | `#dce4e4` | Dividers |
| `panel` | `#f8fafa` | Cards, stat tiles, header |

### Dark mode

Overrides via `@media (prefers-color-scheme: dark)` on `:root`. Same token names; values shift to dark canvas + lighter ink.

### Semantic colors (Tailwind defaults)

- **LIVE:** `red-500` / `red-600` (`LiveDot`)
- **Premier:** `amber-400/20` badge
- **Verdict badges:** red / amber / neutral (`VerdictBadge`)

---

## Critical chrome — bulletproof colors

Custom `@theme` utilities like `bg-signal` **failed to paint in-browser** and broke the platform toggle (white-on-white) and magnitude bars. **Never use custom token utilities for nav, bars, or toggles.**

Use these instead:

| Element | Implementation | Where |
|---------|----------------|-------|
| Platform active chip | `.platform-active` → `bg-teal-700 text-white` | `globals.css`, `platform-nav.tsx` |
| Logo “Intel” | `text-teal-700` | `platform-nav.tsx` |
| Active section tab underline | `border-teal-700` | `platform-nav.tsx` |
| Row magnitude bars | `.bar-track` (gray-200) + `.bar-fill` (teal-600), `h-3` | `globals.css`, `Bar` in `ui.tsx` |
| Hour chart bars | `bg-teal-600`, column `h-full justify-end`, `minHeight: 2px` | `app/[platform]/page.tsx` |

Component classes in `globals.css`:

```css
.bar-track   /* h-3 w-full rounded-full bg-gray-200 */
.bar-fill    /* h-3 rounded-full bg-teal-600 */
.platform-active /* bg-teal-700 text-white */
```

**Rule:** For interactive chrome and data viz fills, use `.bar-track` / `.bar-fill` / `.platform-active` or explicit `teal-*` / `gray-*`. Reserve `signal` tokens for decorative use only (background gradients, `hover:text-signal` on links).

---

## Typography scale

Apply via shared components; avoid one-off sizes on pages.

| Role | Spec |
|------|------|
| Brand | `font-display text-xl font-bold` |
| Page title (`PageHeader`) | `font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink` |
| Page subtitle | `text-sm sm:text-base font-normal text-ink-muted` |
| Card section title | `text-xs uppercase tracking-widest text-ink-muted font-medium` |
| Stat label | `text-xs uppercase tracking-widest text-ink-muted font-medium` |
| Stat value | `font-display text-3xl font-bold tabular-nums text-ink` |
| Row title | `text-base font-semibold` |
| Seller link | `text-sm font-medium text-ink` (hover: `text-signal`) |
| Meta | `text-xs font-normal text-ink-muted` |
| Viewer metric | `font-display text-base font-bold tabular-nums text-ink` |

One loud element per cluster: row titles are semibold; viewer counts are bold display; LIVE stays small.

---

## Shared components

All live in `components/ui.tsx`. **Compose these instead of duplicating markup/styles on pages.**

| Component | Use for |
|-----------|---------|
| `PageHeader` | Page title + optional subtitle + optional back link |
| `StatTile` | KPI cards (label, value, optional sub) |
| `Card` | Bordered sections with uppercase header |
| `Bar` | Horizontal magnitude bar (value / max) |
| `ViewerBar` | Viewer count + bar + audience share label |
| `LiveDot` | Pulsing red live indicator (small, does not compete with title) |
| `PremierBadge` | Whatnot premier shop badge |
| `VerdictBadge` | Hot / warm / cold demand indicator |
| `SellerLink` | Linked seller username |

---

## Navigation (`components/platform-nav.tsx`)

- **Platform switcher:** Segmented control (`rounded-md` border, not pill). Active = `.platform-active`. Inactive = `text-ink`.
- **Section tabs:** Underline rail (`border-b-2`). Active = `border-teal-700 text-ink font-semibold`. Inactive = `text-ink-muted`.
- **Source pill:** Quiet uppercase badge (`LIVE DATA` / `SAMPLE DATA`), top-right.
- **Brand:** `Live` + `Intel` in `text-teal-700`.
- **Header:** `bg-panel/90 backdrop-blur-sm` + subtle teal radial wash.

---

## List row structure (Overview live rows)

Scan order left to right:

1. **Title** — linked, `text-base font-semibold`
2. **Seller** — `SellerLink` + optional `PremierBadge`
3. **Meta** — category, time live, watchlist (`text-xs text-ink-muted`, spaced spans)
4. **ViewerBar** — count, teal bar, audience share

Other list pages (Top Sellers, What's Selling, etc.) should follow the same hierarchy using shared primitives.

---

## Layout shell

- **Main:** `max-w-6xl mx-auto px-4 py-8` (`app/[platform]/layout.tsx`)
- **Footer:** `border-t border-line`, `text-xs text-ink-faint`

---

## Source files (do not fork styling elsewhere)

```
app/globals.css              — tokens + .bar-track / .bar-fill / .platform-active
app/layout.tsx               — Syne + DM Sans font loading
components/ui.tsx            — all shared UI primitives
components/platform-nav.tsx  — header chrome
app/[platform]/layout.tsx    — main shell + footer
```

---

## Don'ts

- Do not change fonts, palette, nav patterns, or typography scale without explicit user request.
- Do not use `bg-signal`, `text-accent`, or other custom `@theme` utilities for toggles, tabs, or bars.
- Do not reintroduce Geist, Arial, or indigo/purple brand colors.
- Do not add inline styling on pages when a `ui.tsx` primitive exists.
- Do not replace segmented platform control with pills or filled section tab chips.
