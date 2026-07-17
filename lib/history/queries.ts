import { and, count, eq, gte, isNotNull, lte, max, min } from "drizzle-orm";
import type { Platform } from "@/lib/core/types";
import { showSnapshots, type ShowSnapshotRow } from "@/db/schema";
import type { HistoryDb } from "./db";

const DAY_MS = 86_400_000;

export async function fetchSnapshots(
  db: HistoryDb,
  platform: Platform,
  since: Date,
  until?: Date,
): Promise<ShowSnapshotRow[]> {
  const conditions = [
    eq(showSnapshots.platform, platform),
    gte(showSnapshots.capturedAt, since),
  ];
  if (until) conditions.push(lte(showSnapshots.capturedAt, until));

  return db
    .select()
    .from(showSnapshots)
    .where(and(...conditions))
    .orderBy(showSnapshots.capturedAt);
}

export async function snapshotStats(db: HistoryDb, platform?: Platform) {
  const [row] = await db
    .select({
      count: count(),
      oldest: min(showSnapshots.capturedAt),
      newest: max(showSnapshots.capturedAt),
    })
    .from(showSnapshots)
    .where(platform ? eq(showSnapshots.platform, platform) : undefined);

  const total = Number(row?.count ?? 0);
  const oldest = row?.oldest ?? null;
  const newest = row?.newest ?? null;
  const daysAvailable =
    oldest && newest
      ? Math.max(0, (newest.getTime() - oldest.getTime()) / DAY_MS)
      : 0;

  return { count: total, oldest, newest, daysAvailable };
}

export async function historyDaysAvailable(
  db: HistoryDb,
  platform: Platform,
): Promise<number> {
  const { daysAvailable } = await snapshotStats(db, platform);
  return daysAvailable;
}

export type SellerReviewPoint = { capturedAt: number; numReviews: number };

/** One point per capture hour — latest review count in that hour. */
export async function sellerReviewPoints(
  db: HistoryDb,
  platform: Platform,
  username: string,
  since: Date,
): Promise<SellerReviewPoint[]> {
  const rows = await db
    .select({
      capturedAt: showSnapshots.capturedAt,
      numReviews: showSnapshots.sellerNumReviews,
    })
    .from(showSnapshots)
    .where(
      and(
        eq(showSnapshots.platform, platform),
        eq(showSnapshots.sellerUsername, username),
        gte(showSnapshots.capturedAt, since),
        isNotNull(showSnapshots.sellerNumReviews),
      ),
    )
    .orderBy(showSnapshots.capturedAt);

  const byHour = new Map<number, number>();
  for (const row of rows) {
    if (row.numReviews == null) continue;
    const hourKey = Math.floor(row.capturedAt.getTime() / 3_600_000);
    byHour.set(hourKey, row.numReviews);
  }

  return [...byHour.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([hourKey, numReviews]) => ({
      capturedAt: hourKey * 3_600_000,
      numReviews,
    }));
}
