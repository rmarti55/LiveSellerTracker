import { NextResponse } from "next/server";
import { getHistoryDb, snapshotStats } from "@/lib/history";

export const dynamic = "force-dynamic";

/** Read-only collector health — row count and history span. */
export async function GET() {
  const db = getHistoryDb();
  if (!db) {
    return NextResponse.json({
      ok: false,
      error: "DATABASE_URL not configured",
    });
  }

  try {
    const [all, whatnot] = await Promise.all([
      snapshotStats(db),
      snapshotStats(db, "whatnot"),
    ]);

    return NextResponse.json({
      ok: true,
      showSnapshots: {
        totalRows: all.count,
        oldestCapture: all.oldest?.toISOString() ?? null,
        newestCapture: all.newest?.toISOString() ?? null,
        daysAvailable: Math.floor(all.daysAvailable * 10) / 10,
      },
      whatnot: {
        totalRows: whatnot.count,
        daysAvailable: Math.floor(whatnot.daysAvailable * 10) / 10,
        historyReady: whatnot.daysAvailable >= 7,
        building: whatnot.daysAvailable >= 2 && whatnot.daysAvailable < 7,
      },
      at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "query failed",
      },
      { status: 500 },
    );
  }
}
