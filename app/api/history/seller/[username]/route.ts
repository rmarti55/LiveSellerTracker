import { NextResponse } from "next/server";
import { isPlatform } from "@/lib/core";
import {
  getHistoryDb,
  HISTORY_FULL_DAYS,
  sellerReviewPoints,
  sellerReviewVelocityTrend,
} from "@/lib/history";

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;

/** Review-velocity trend for a seller from accumulated snapshots. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const { searchParams } = new URL(request.url);
  const platformParam = searchParams.get("platform") ?? "whatnot";

  if (!isPlatform(platformParam)) {
    return NextResponse.json({ error: "invalid platform" }, { status: 400 });
  }

  const db = getHistoryDb();
  if (!db) {
    return NextResponse.json({ available: false, reason: "no_database" });
  }

  try {
    const since = new Date(Date.now() - HISTORY_FULL_DAYS * DAY_MS);
    const points = await sellerReviewPoints(
      db,
      platformParam,
      decodeURIComponent(username),
      since,
    );
    const trend = sellerReviewVelocityTrend(points);

    return NextResponse.json({
      available: trend != null,
      username: decodeURIComponent(username),
      platform: platformParam,
      trend,
    });
  } catch (err) {
    return NextResponse.json(
      {
        available: false,
        error: err instanceof Error ? err.message : "query failed",
      },
      { status: 500 },
    );
  }
}
