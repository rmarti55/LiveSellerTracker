import type { LiveShow, Listing } from "@/lib/core/types";

// Pure metric functions — the analytics a live-seller pays for. No I/O; every
// input comes from the DataSource seam so these are trivially unit-testable.

const DAY_MS = 86_400_000;

export type SellerRank = {
  username: string;
  isPremierShop: boolean;
  liveShows: number;
  totalViewers: number;
  numReviews?: number;
};

/** Sellers ranked by live reach (sum of concurrent viewers across their live shows). */
export function topSellers(shows: LiveShow[]): SellerRank[] {
  const live = shows.filter((s) => s.status === "PLAYING");
  const by = new Map<string, SellerRank>();
  for (const s of live) {
    const cur = by.get(s.seller.username) ?? {
      username: s.seller.username,
      isPremierShop: !!s.seller.isPremierShop,
      liveShows: 0,
      totalViewers: 0,
      numReviews: s.seller.numReviews,
    };
    cur.liveShows += 1;
    cur.totalViewers += s.activeViewers;
    if (s.seller.numReviews != null) cur.numReviews = s.seller.numReviews;
    by.set(s.seller.username, cur);
  }
  return [...by.values()].sort((a, b) => b.totalViewers - a.totalViewers);
}

export type CategoryDemand = {
  category: string;
  liveShows: number;
  totalViewers: number;
  totalWatchlist: number;
};

/** Categories ranked by live demand (concurrent viewers + watchlist interest). */
export function categoryDemand(shows: LiveShow[]): CategoryDemand[] {
  const by = new Map<string, CategoryDemand>();
  for (const s of shows) {
    for (const cat of s.categories.length ? s.categories : ["Uncategorized"]) {
      const cur = by.get(cat) ?? {
        category: cat,
        liveShows: 0,
        totalViewers: 0,
        totalWatchlist: 0,
      };
      if (s.status === "PLAYING") cur.liveShows += 1;
      cur.totalViewers += s.activeViewers;
      cur.totalWatchlist += s.totalWatchlistUsers;
      by.set(cat, cur);
    }
  }
  return [...by.values()].sort((a, b) => b.totalViewers - a.totalViewers);
}

export type PricePoints = {
  count: number;
  minCents: number;
  maxCents: number;
  medianCents: number;
  avgCents: number;
};

/** Price distribution across saleable listings (excludes $0 giveaways). */
export function pricePoints(listings: Listing[]): PricePoints {
  const cents = listings
    .filter((l) => l.transactionType !== "GIVEAWAY" && l.price.amount > 0)
    // prefer the live bid when present, else the (start) price
    .map((l) => (l.currentBid?.amount ?? l.price.amount))
    .sort((a, b) => a - b);
  if (cents.length === 0) {
    return { count: 0, minCents: 0, maxCents: 0, medianCents: 0, avgCents: 0 };
  }
  const mid = Math.floor(cents.length / 2);
  const median =
    cents.length % 2 ? cents[mid] : Math.round((cents[mid - 1] + cents[mid]) / 2);
  const avg = Math.round(cents.reduce((s, c) => s + c, 0) / cents.length);
  return {
    count: cents.length,
    minCents: cents[0],
    maxCents: cents[cents.length - 1],
    medianCents: median,
    avgCents: avg,
  };
}

export type HourDemand = { hour: number; totalViewers: number; showCount: number };

/**
 * Best time to go live: bucket shows by UTC hour-of-day of their start time,
 * weighted by concurrent viewers. Highest-viewer hours = least-contested / most
 * active windows depending on how the seller reads it.
 */
export function bestTimeToGoLive(shows: LiveShow[]): HourDemand[] {
  const buckets: HourDemand[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    totalViewers: 0,
    showCount: 0,
  }));
  for (const s of shows) {
    if (!s.startTime) continue;
    const hour = new Date(s.startTime).getUTCHours();
    buckets[hour].totalViewers += s.activeViewers;
    buckets[hour].showCount += 1;
  }
  return buckets;
}

// --- Sell-through / "what's selling" (Bri's #1 pain: "will this be a dead pile?") ---
// A listing carrying the context needed to judge demand. Callers enrich raw
// Listings (from getShowListings) with the show's category + seller.

export type DemandItem = {
  title: string;
  category: string;
  seller: string;
  priceCents: number; // live bid if present, else start/current price
  soldCount?: number; // TikTok: real units sold
  bidCount?: number; // Whatnot: live auction activity (demand proxy)
  transactionType: string;
};

// "unknown" = the platform exposes no live demand signal for this item right now
// (typical for a Whatnot snapshot — only the item being auctioned has bids). We do
// NOT label these "cold" — that would be misleading and demoralizing.
export type Verdict = "hot" | "warm" | "cold" | "unknown";

export type ProductDemandRow = {
  title: string;
  category: string;
  seller: string;
  priceCents: number;
  /** Units sold (TikTok) or bid count (Whatnot) — whichever is available. */
  demandScore: number;
  demandBasis: "sold" | "bids" | "none";
  verdict: Verdict;
};

/**
 * Rank listings by demand so a seller can see what's actually moving right now.
 * TikTok exposes real `soldCount`; Whatnot exposes live `currentBidCount` (auction
 * activity) — we use whichever exists as the demand signal. Giveaways excluded.
 * Verdict is RELATIVE to the current set (hot ≥ 50% of the top score; cold = no signal).
 */
export function productDemand(items: DemandItem[]): ProductDemandRow[] {
  const scored = items
    .filter((i) => i.transactionType !== "GIVEAWAY")
    .map((i) => {
      // soldCount present (even 0) is a real signal (TikTok). Otherwise a bid count
      // is the signal (Whatnot, only for the item being auctioned). Neither = unknown.
      let demandScore = 0;
      let demandBasis: ProductDemandRow["demandBasis"] = "none";
      if (i.soldCount != null) {
        demandBasis = "sold";
        demandScore = i.soldCount;
      } else if (i.bidCount != null) {
        demandBasis = "bids";
        demandScore = i.bidCount;
      }
      return { i, demandScore, demandBasis };
    })
    .sort((a, b) => b.demandScore - a.demandScore);

  const maxScore = Math.max(1, ...scored.map((s) => s.demandScore));
  return scored.map(({ i, demandScore, demandBasis }) => ({
    title: i.title,
    category: i.category,
    seller: i.seller,
    priceCents: i.priceCents,
    demandScore,
    demandBasis,
    verdict:
      demandBasis === "none"
        ? "unknown"
        : demandScore === 0
          ? "cold"
          : demandScore >= 0.5 * maxScore
            ? "hot"
            : "warm",
  }));
}

/** True when the current set has any real demand signal to rank on. */
export function hasDemandSignal(rows: ProductDemandRow[]): boolean {
  return rows.some((r) => r.demandScore > 0);
}

/**
 * Generic plain-language heat label for a value relative to the top of its set
 * (used for viewer-based demand — categories, etc.). Turns raw numbers into a
 * "should I care?" cue for non-technical sellers.
 */
export function heatVerdict(value: number, max: number): Verdict {
  if (max <= 0 || value <= 0) return "unknown";
  const r = value / max;
  return r >= 0.5 ? "hot" : r >= 0.15 ? "warm" : "cold";
}

export type CategorySellThrough = {
  category: string;
  items: number;
  demandScore: number; // summed sold/bids across the category
  medianPriceCents: number;
  verdict: Verdict;
};

/** Roll product demand up to categories — "what type of thing is selling right now?" */
export function sellThroughByCategory(rows: ProductDemandRow[]): CategorySellThrough[] {
  const by = new Map<string, { items: number; demand: number; prices: number[] }>();
  for (const r of rows) {
    const cur = by.get(r.category) ?? { items: 0, demand: 0, prices: [] };
    cur.items += 1;
    cur.demand += r.demandScore;
    if (r.priceCents > 0) cur.prices.push(r.priceCents);
    by.set(r.category, cur);
  }
  const cats = [...by.entries()].map(([category, v]) => {
    const sorted = [...v.prices].sort((a, b) => a - b);
    const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
    return { category, items: v.items, demandScore: v.demand, medianPriceCents: median };
  });
  const max = Math.max(1, ...cats.map((c) => c.demandScore));
  const anySignal = cats.some((c) => c.demandScore > 0);
  return cats
    .map((c) => ({
      ...c,
      verdict: (!anySignal
        ? "unknown"
        : c.demandScore === 0
          ? "cold"
          : c.demandScore >= 0.5 * max
            ? "hot"
            : "warm") as Verdict,
    }))
    .sort((a, b) => b.demandScore - a.demandScore);
}

export type VelocityPoint = { capturedAt: number; numReviews: number };

/**
 * Seller sales velocity in reviews/day (a public lifetime-sales proxy), derived
 * from snapshots of the seller's review count over time. Needs ≥2 points spanning
 * time; returns 0 otherwise.
 */
export function sellerVelocity(points: VelocityPoint[]): number {
  if (points.length < 2) return 0;
  const sorted = [...points].sort((a, b) => a.capturedAt - b.capturedAt);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const dtMs = last.capturedAt - first.capturedAt;
  if (dtMs <= 0) return 0;
  const dReviews = last.numReviews - first.numReviews;
  return (dReviews / dtMs) * DAY_MS;
}
