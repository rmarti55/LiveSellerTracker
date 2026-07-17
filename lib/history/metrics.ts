import type { ShowSnapshotRow } from "@/db/schema";
import type { HourDemand } from "@/lib/metrics";
import { sellerVelocity } from "@/lib/metrics";
import { pacificHourFromTimestamp } from "@/lib/time/pacific";
import type { SellerReviewPoint } from "./queries";

const DAY_MS = 86_400_000;

export type HistoryMode = "snapshot" | "building" | "history";

export type HistoryContext = {
  mode: HistoryMode;
  daysAvailable: number;
  rows: ShowSnapshotRow[];
};

export const HISTORY_FULL_DAYS = 7;
export const HISTORY_BUILDING_DAYS = 2;

export type TrendVerdict = "rising" | "flat" | "cooling";

export type CategoryTrend = {
  category: string;
  viewersThisWeek: number;
  viewersPriorWeek: number;
  deltaPct: number;
  verdict: TrendVerdict;
};

export type SellerVelocityTrend = {
  deltaReviews: number;
  reviewsPerDay: number;
  daysSpan: number;
  direction: "up" | "flat" | "down";
};

function trendVerdict(deltaPct: number): TrendVerdict {
  if (deltaPct > 10) return "rising";
  if (deltaPct < -10) return "cooling";
  return "flat";
}

function sumViewersByCategory(rows: ShowSnapshotRow[]): Map<string, number> {
  const by = new Map<string, number>();
  for (const row of rows) {
    if (row.status !== "PLAYING" || !row.category) continue;
    by.set(row.category, (by.get(row.category) ?? 0) + row.activeViewers);
  }
  return by;
}

/** 7-day viewer-weighted best-time panel from accumulated snapshots. */
export function bestTimeFromHistory(rows: ShowSnapshotRow[]): HourDemand[] {
  const buckets: HourDemand[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    totalViewers: 0,
    showCount: 0,
  }));

  for (const row of rows) {
    if (row.status !== "PLAYING" || !row.startTime) continue;
    const hour = pacificHourFromTimestamp(row.startTime);
    buckets[hour].totalViewers += row.activeViewers;
    buckets[hour].showCount += 1;
  }

  return buckets;
}

/** Compare last N days vs the prior N days of viewer exposure by category. */
export function categoryTrendDeltas(
  rows: ShowSnapshotRow[],
  windowDays = 7,
  refMs = Date.now(),
): CategoryTrend[] {
  const windowMs = windowDays * DAY_MS;
  const thisStart = refMs - windowMs;
  const priorStart = refMs - windowMs * 2;

  const thisRows = rows.filter((r) => {
    const t = r.capturedAt.getTime();
    return t >= thisStart && t <= refMs;
  });
  const priorRows = rows.filter((r) => {
    const t = r.capturedAt.getTime();
    return t >= priorStart && t < thisStart;
  });

  const thisBy = sumViewersByCategory(thisRows);
  const priorBy = sumViewersByCategory(priorRows);
  const categories = new Set([...thisBy.keys(), ...priorBy.keys()]);

  return [...categories]
    .map((category) => {
      const viewersThisWeek = thisBy.get(category) ?? 0;
      const viewersPriorWeek = priorBy.get(category) ?? 0;
      const deltaPct =
        viewersPriorWeek > 0
          ? ((viewersThisWeek - viewersPriorWeek) / viewersPriorWeek) * 100
          : viewersThisWeek > 0
            ? 100
            : 0;
      return {
        category,
        viewersThisWeek,
        viewersPriorWeek,
        deltaPct,
        verdict: trendVerdict(deltaPct),
      };
    })
    .sort((a, b) => b.deltaPct - a.deltaPct);
}

export function sellerReviewVelocityTrend(
  points: SellerReviewPoint[],
): SellerVelocityTrend | null {
  if (points.length < 2) return null;

  const sorted = [...points].sort((a, b) => a.capturedAt - b.capturedAt);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const daysSpan = Math.max(
    (last.capturedAt - first.capturedAt) / DAY_MS,
    1 / 24,
  );
  const deltaReviews = last.numReviews - first.numReviews;
  const reviewsPerDay = sellerVelocity(points);

  let direction: SellerVelocityTrend["direction"] = "flat";
  if (deltaReviews > 0) direction = "up";
  else if (deltaReviews < 0) direction = "down";

  return { deltaReviews, reviewsPerDay, daysSpan, direction };
}

export function formatTrendDelta(deltaPct: number): string {
  if (Math.abs(deltaPct) < 1) return "→ flat";
  const sign = deltaPct > 0 ? "↑" : "↓";
  return `${sign} ${Math.abs(Math.round(deltaPct))}%`;
}

export function formatSellerVelocityLine(trend: SellerVelocityTrend): string {
  const perDay = Math.round(trend.reviewsPerDay);
  const delta = trend.deltaReviews;
  const sign = delta >= 0 ? "+" : "";
  const days = Math.round(trend.daysSpan);
  return `${sign}${delta.toLocaleString()} reviews over ${days} day${days === 1 ? "" : "s"} (~${perDay.toLocaleString()}/day)`;
}
