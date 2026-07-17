import { describe, expect, it } from "vitest";
import type { ShowSnapshotRow } from "@/db/schema";
import {
  bestTimeFromHistory,
  categoryTrendDeltas,
  sellerReviewVelocityTrend,
} from "./metrics";

const DAY_MS = 86_400_000;
const BASE = Date.UTC(2026, 6, 1, 12, 0, 0);

function snap(
  overrides: Partial<ShowSnapshotRow> & Pick<ShowSnapshotRow, "capturedAt">,
): ShowSnapshotRow {
  return {
    id: 1,
    platform: "whatnot",
    showId: "show-1",
    title: "Test",
    status: "PLAYING",
    activeViewers: 100,
    watchlist: 0,
    startTime: BASE,
    category: "Beauty",
    sellerUsername: "seller_a",
    sellerNumReviews: 1000,
    isPremier: false,
    ...overrides,
  };
}

describe("bestTimeFromHistory", () => {
  it("buckets viewer totals by Pacific hour of start time", () => {
    const ptHour10 = Date.UTC(2026, 6, 1, 17, 0, 0); // 10 AM PT in July
    const rows = [
      snap({ capturedAt: new Date(BASE), startTime: ptHour10, activeViewers: 200 }),
      snap({ capturedAt: new Date(BASE + 3_600_000), startTime: ptHour10, activeViewers: 300 }),
    ];
    const buckets = bestTimeFromHistory(rows);
    const peak = buckets.reduce((a, b) => (b.totalViewers > a.totalViewers ? b : a));
    expect(peak.totalViewers).toBe(500);
    expect(peak.showCount).toBe(2);
  });

  it("returns empty buckets when no start times", () => {
    const rows = [snap({ capturedAt: new Date(BASE), startTime: null, activeViewers: 500 })];
    expect(bestTimeFromHistory(rows).every((b) => b.totalViewers === 0)).toBe(true);
  });
});

describe("categoryTrendDeltas", () => {
  it("marks rising categories when this week beats prior week", () => {
    const ref = BASE + 14 * DAY_MS;
    const rows = [
      snap({
        capturedAt: new Date(ref - 2 * DAY_MS),
        category: "Beauty",
        activeViewers: 300,
      }),
      snap({
        capturedAt: new Date(ref - 10 * DAY_MS),
        category: "Beauty",
        activeViewers: 100,
      }),
    ];
    const trends = categoryTrendDeltas(rows, 7, ref);
    const beauty = trends.find((t) => t.category === "Beauty");
    expect(beauty?.verdict).toBe("rising");
    expect(beauty?.deltaPct).toBeGreaterThan(10);
  });

  it("returns flat when prior week had no viewers", () => {
    const ref = BASE + 7 * DAY_MS;
    const rows = [
      snap({
        capturedAt: new Date(ref - 1 * DAY_MS),
        category: "Shoes",
        activeViewers: 50,
      }),
    ];
    const trends = categoryTrendDeltas(rows, 7, ref);
    expect(trends[0]?.verdict).toBe("rising");
  });
});

describe("sellerReviewVelocityTrend", () => {
  it("computes review delta and direction", () => {
    const trend = sellerReviewVelocityTrend([
      { capturedAt: BASE, numReviews: 1000 },
      { capturedAt: BASE + 7 * DAY_MS, numReviews: 1700 },
    ]);
    expect(trend?.deltaReviews).toBe(700);
    expect(trend?.direction).toBe("up");
    expect(trend?.reviewsPerDay).toBeGreaterThan(0);
  });

  it("returns null with fewer than two points", () => {
    expect(
      sellerReviewVelocityTrend([{ capturedAt: BASE, numReviews: 100 }]),
    ).toBeNull();
  });
});
