import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { bestTimeToGoLive, categoryDemand } from "@/lib/metrics";
import {
  Card,
  formatTimeLive,
  LiveDot,
  PremierBadge,
  SellerLink,
  StatTile,
  ViewerBar,
} from "@/components/ui";
import { getTrackedFeeds } from "@/lib/whatnot/feeds";

export const dynamic = "force-dynamic";

export default async function Overview({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();

  const ds = await getDataSource(platform);
  const shows = await ds.getLiveShows();

  const trackedFeeds = platform === "whatnot" ? getTrackedFeeds() : [];
  const trackedLabels = trackedFeeds.map((f) => f.label).join(", ");

  const live = shows
    .filter((s) => s.status === "PLAYING")
    .sort((a, b) => b.activeViewers - a.activeViewers);
  const totalViewers = live.reduce((s, x) => s + x.activeViewers, 0);
  const demand = categoryDemand(shows);
  const hours = bestTimeToGoLive(shows);
  const peakHour = [...hours].sort((a, b) => b.totalViewers - a.totalViewers)[0];
  const maxHour = Math.max(1, ...hours.map((h) => h.totalViewers));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">
          {platform === "whatnot" ? "Live snapshot" : "Market Overview"}
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          {platform === "whatnot" ? (
            <>
              {live.length} live {live.length === 1 ? "show" : "shows"} across{" "}
              {trackedFeeds.length} tracked {trackedFeeds.length === 1 ? "category" : "categories"}
              {trackedLabels ? `: ${trackedLabels}` : ""}. Sample from top shows per feed — not
              all of Whatnot.
            </>
          ) : (
            <>Live TikTok Shop activity, right now.</>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Shows live now"
          value={live.length}
          sub={platform === "whatnot" ? `of ${shows.length} fetched` : undefined}
        />
        <StatTile label="Concurrent viewers" value={totalViewers.toLocaleString()} />
        <StatTile label="Active categories" value={demand.filter((d) => d.liveShows > 0).length} />
        <StatTile
          label="Peak hour (UTC)"
          value={`${String(peakHour.hour).padStart(2, "0")}:00`}
          sub={`${peakHour.totalViewers.toLocaleString()} viewers`}
        />
      </div>

      <Card
        title="Live now — by concurrent viewers"
        action={<span className="text-xs text-black/40 dark:text-white/40">{live.length} shows</span>}
      >
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {live.map((s) => (
            <li key={s.id} className="px-4 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <LiveDot />
                  <Link
                    href={`/${platform}/shows/${s.id}`}
                    className="text-sm font-medium hover:underline line-clamp-1"
                  >
                    {s.title}
                  </Link>
                </div>
                <div className="mt-0.5 text-xs text-black/50 dark:text-white/50">
                  <SellerLink platform={platform} username={s.seller.username} />
                  {s.seller.isPremierShop && <PremierBadge />}
                  {" · "}
                  {s.categories.join(", ")}
                  {" · "}
                  {formatTimeLive(s.startTime)}
                  {s.totalWatchlistUsers > 0 && (
                    <>
                      {" · "}
                      {s.totalWatchlistUsers.toLocaleString()} watchlisted
                    </>
                  )}
                </div>
              </div>
              <ViewerBar viewers={s.activeViewers} totalViewers={totalViewers} />
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Best time to go live (UTC hour)">
        <div className="p-4">
          <div className="flex items-end gap-1 h-32">
            {hours.map((h) => (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1" title={`${h.hour}:00 — ${h.totalViewers} viewers`}>
                <div
                  className="w-full rounded-t bg-indigo-500/80"
                  style={{ height: `${Math.round((h.totalViewers / maxHour) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-black/40 dark:text-white/40">
            <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
          </div>
          <p className="mt-3 text-xs text-black/60 dark:text-white/60">
            👉 Busiest window is <b>{String(peakHour.hour).padStart(2, "0")}:00 UTC</b> — go live
            around then to catch the most buyers.
          </p>
        </div>
      </Card>
    </div>
  );
}
