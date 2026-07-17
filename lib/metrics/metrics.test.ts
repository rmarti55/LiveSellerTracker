import { describe, expect, it } from "vitest";
import { FIXTURE_LISTINGS, FIXTURE_SHOWS } from "@/lib/whatnot/fixtures";
import {
  bestTimeToGoLive,
  categoryDemand,
  heatVerdict,
  pricePoints,
  productDemand,
  sellThroughByCategory,
  sellerVelocity,
  topSellers,
  type DemandItem,
} from "./index";

const novatcgShowId = "a8704f15-df50-404e-bf5c-e7eb0aee490b";

describe("topSellers", () => {
  it("ranks by summed concurrent viewers and excludes scheduled shows", () => {
    const ranked = topSellers(FIXTURE_SHOWS);
    expect(ranked[0].username).toBe("novatcg");
    expect(ranked[0].totalViewers).toBe(1642);
    // scheduled (CREATED) sellers must not appear
    expect(ranked.some((r) => r.username === "supertcgjapan")).toBe(false);
  });

  it("carries the seller review count through as a sales proxy", () => {
    const nova = topSellers(FIXTURE_SHOWS).find((r) => r.username === "novatcg");
    expect(nova?.numReviews).toBe(144437);
  });
});

describe("categoryDemand", () => {
  it("ranks categories by total viewers with Pokémon Cards on top", () => {
    const demand = categoryDemand(FIXTURE_SHOWS);
    expect(demand[0].category).toBe("Pokémon Cards");
    expect(demand.map((d) => d.category)).toContain("VeeFriends");
  });

  it("counts a scheduled show's category but not as a live show", () => {
    const onePiece = categoryDemand(FIXTURE_SHOWS).find(
      (d) => d.category === "One Piece Cards",
    );
    expect(onePiece).toBeDefined();
    expect(onePiece?.liveShows).toBe(0); // the One Piece show is CREATED/scheduled
  });
});

describe("pricePoints", () => {
  it("uses live bids, excludes giveaways, and computes the distribution", () => {
    const pp = pricePoints(FIXTURE_LISTINGS[novatcgShowId]);
    expect(pp.count).toBe(2); // giveaway excluded
    expect(pp.minCents).toBe(1200);
    expect(pp.maxCents).toBe(4100);
    expect(pp.medianCents).toBe(2650);
    expect(pp.avgCents).toBe(2650);
  });

  it("returns zeros for an empty/giveaway-only set", () => {
    expect(pricePoints([]).count).toBe(0);
  });
});

describe("bestTimeToGoLive", () => {
  it("returns 24 hourly buckets summing to the total viewers", () => {
    const buckets = bestTimeToGoLive(FIXTURE_SHOWS);
    expect(buckets).toHaveLength(24);
    const total = buckets.reduce((s, b) => s + b.totalViewers, 0);
    const expected = FIXTURE_SHOWS.reduce((s, x) => s + x.activeViewers, 0);
    expect(total).toBe(expected);
  });

  it("buckets a show into its Pacific start hour", () => {
    const show = {
      ...FIXTURE_SHOWS[0],
      startTime: Date.UTC(2024, 6, 15, 17, 0, 0), // 10:00 AM PDT
      activeViewers: 999,
    };
    const buckets = bestTimeToGoLive([show]);
    expect(buckets[10].totalViewers).toBe(999);
    expect(buckets[10].showCount).toBe(1);
  });
});

describe("productDemand", () => {
  const items: DemandItem[] = [
    { title: "Hot Serum", category: "Beauty", seller: "a", priceCents: 1499, soldCount: 18420, transactionType: "BUY_NOW" },
    { title: "Warm Toner", category: "Beauty", seller: "a", priceCents: 1299, soldCount: 6000, transactionType: "BUY_NOW" },
    { title: "Cold Item", category: "Beauty", seller: "b", priceCents: 999, soldCount: 0, transactionType: "BUY_NOW" },
    { title: "Free Gift", category: "Beauty", seller: "a", priceCents: 0, soldCount: 0, transactionType: "GIVEAWAY" },
    { title: "Whatnot bid item", category: "Cards", seller: "c", priceCents: 1200, bidCount: 7, transactionType: "AUCTION" },
  ];

  it("ranks by demand, excludes giveaways, and labels hot/warm/cold", () => {
    const rows = productDemand(items);
    expect(rows.map((r) => r.title)).not.toContain("Free Gift"); // giveaway excluded
    expect(rows[0].title).toBe("Hot Serum"); // highest soldCount first
    expect(rows[0].verdict).toBe("hot");
    expect(rows.find((r) => r.title === "Cold Item")?.verdict).toBe("cold");
  });

  it("uses soldCount for TikTok and bidCount for Whatnot", () => {
    const rows = productDemand(items);
    expect(rows.find((r) => r.title === "Hot Serum")?.demandBasis).toBe("sold");
    expect(rows.find((r) => r.title === "Whatnot bid item")?.demandBasis).toBe("bids");
  });

  it("rolls up to categories", () => {
    const cats = sellThroughByCategory(productDemand(items));
    const beauty = cats.find((c) => c.category === "Beauty");
    expect(beauty?.items).toBe(3); // giveaway excluded before rollup
    expect(beauty?.demandScore).toBe(18420 + 6000);
  });
});

describe("heatVerdict", () => {
  it("labels relative to the top of the set", () => {
    expect(heatVerdict(100, 100)).toBe("hot");
    expect(heatVerdict(60, 100)).toBe("hot");
    expect(heatVerdict(20, 100)).toBe("warm");
    expect(heatVerdict(5, 100)).toBe("cold");
    expect(heatVerdict(0, 100)).toBe("unknown");
    expect(heatVerdict(10, 0)).toBe("unknown");
  });
});

describe("sellerVelocity", () => {
  it("computes reviews/day from two snapshots", () => {
    const t0 = 1_784_000_000_000;
    const v = sellerVelocity([
      { capturedAt: t0, numReviews: 144_000 },
      { capturedAt: t0 + 2 * 86_400_000, numReviews: 144_437 },
    ]);
    expect(v).toBeCloseTo(218.5, 1); // 437 reviews over 2 days
  });

  it("returns 0 with insufficient data", () => {
    expect(sellerVelocity([{ capturedAt: 1, numReviews: 10 }])).toBe(0);
  });
});
