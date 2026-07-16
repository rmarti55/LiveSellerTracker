import { NextResponse } from "next/server";
import { getDataSource, PLATFORMS } from "@/lib/core";
import { getDb } from "@/db";
import { showSnapshots, type NewShowSnapshot } from "@/db/schema";

// The collector. Vercel Cron (see vercel.json) calls this on a schedule; each run
// snapshots the current live shows for every platform into Postgres so time-series
// metrics accrue. A platform whose source isn't configured (e.g. TikTok without a
// provider token) is skipped, not fatal. Set WHATNOT_SOURCE/TIKTOK_SOURCE=real in
// production to capture live data.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const db = getDb();
  const perPlatform: Record<string, number | string> = {};
  let totalInserted = 0;

  for (const { id: platform } of PLATFORMS) {
    try {
      const ds = await getDataSource(platform);
      const shows = await ds.getLiveShows({ limit: 50 });
      const rows: NewShowSnapshot[] = shows.map((s) => ({
        platform,
        showId: s.id,
        title: s.title,
        status: s.status,
        activeViewers: s.activeViewers,
        watchlist: s.totalWatchlistUsers,
        startTime: s.startTime || null,
        category: s.categories[0] ?? null,
        sellerUsername: s.seller.username,
        sellerNumReviews: s.seller.numReviews ?? null,
        isPremier: !!s.seller.isPremierShop,
      }));
      if (rows.length) await db.insert(showSnapshots).values(rows);
      perPlatform[platform] = rows.length;
      totalInserted += rows.length;
    } catch (err) {
      // e.g. TikTok real source not configured — skip, don't fail the whole run.
      perPlatform[platform] = `skipped: ${(err as Error).message}`;
    }
  }

  return NextResponse.json({
    ok: true,
    captured: totalInserted,
    perPlatform,
    at: new Date().toISOString(),
  });
}
