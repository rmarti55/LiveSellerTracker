import type { Platform } from "@/lib/core/types";
import {
  HISTORY_BUILDING_DAYS,
  HISTORY_FULL_DAYS,
  type HistoryContext,
  type HistoryMode,
} from "./metrics";
import { getHistoryDb } from "./db";
import { fetchSnapshots, historyDaysAvailable } from "./queries";

const DAY_MS = 86_400_000;

export async function loadHistoryContext(platform: Platform): Promise<HistoryContext> {
  const db = getHistoryDb();
  if (!db) {
    return { mode: "snapshot", daysAvailable: 0, rows: [] };
  }

  try {
    const daysAvailable = await historyDaysAvailable(db, platform);
    if (daysAvailable < HISTORY_BUILDING_DAYS) {
      return { mode: "snapshot", daysAvailable, rows: [] };
    }

    const since = new Date(Date.now() - HISTORY_FULL_DAYS * DAY_MS);
    const rows = await fetchSnapshots(db, platform, since);
    const mode: HistoryMode =
      daysAvailable >= HISTORY_FULL_DAYS ? "history" : "building";

    return { mode, daysAvailable, rows };
  } catch {
    return { mode: "snapshot", daysAvailable: 0, rows: [] };
  }
}

export { getHistoryDb } from "./db";
export {
  fetchSnapshots,
  historyDaysAvailable,
  sellerReviewPoints,
  snapshotStats,
} from "./queries";
export {
  bestTimeFromHistory,
  categoryTrendDeltas,
  formatSellerVelocityLine,
  formatTrendDelta,
  sellerReviewVelocityTrend,
  HISTORY_BUILDING_DAYS,
  HISTORY_FULL_DAYS,
} from "./metrics";
export type {
  CategoryTrend,
  HistoryContext,
  HistoryMode,
  SellerVelocityTrend,
  TrendVerdict,
} from "./metrics";
