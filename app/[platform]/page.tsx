import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { categoryDemand } from "@/lib/metrics";
import {
  Card,
  formatTimeLive,
  PageHeader,
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
  const scheduled = shows.filter((s) => s.status === "CREATED").length;
  const maxViewers = Math.max(1, ...live.map((s) => s.activeViewers));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={platform === "whatnot" ? "Live snapshot" : "Market Overview"}>
        {platform === "whatnot" ? (
          <>
            {live.length} live {live.length === 1 ? "show" : "shows"} across{" "}
            {trackedFeeds.length} tracked {trackedFeeds.length === 1 ? "category" : "categories"}
            {trackedLabels ? `: ${trackedLabels}` : ""}. Sample from top shows per feed — not all
            of Whatnot.
          </>
        ) : (
          <>Live TikTok Shop activity, right now.</>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Shows live now"
          value={live.length}
          sub={platform === "whatnot" ? `of ${shows.length} fetched` : undefined}
        />
        <StatTile label="Concurrent viewers" value={totalViewers.toLocaleString()} />
        <StatTile label="Active categories" value={demand.filter((d) => d.liveShows > 0).length} />
        <StatTile
          label="Scheduled shows"
          value={scheduled}
          sub={scheduled > 0 ? "starting soon" : undefined}
        />
      </div>

      <Card
        title="Live now — by concurrent viewers"
        action={<span className="text-xs text-ink-faint">{live.length} shows</span>}
      >
        <ul className="divide-y divide-line-soft">
          {live.map((s) => (
            <li key={s.id} className="px-4 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/${platform}/shows/${s.id}`}
                  className="text-base font-semibold hover:text-signal hover:underline line-clamp-1"
                >
                  {s.title}
                </Link>
                <div className="mt-0.5 text-xs">
                  <SellerLink platform={platform} username={s.seller.username} />
                  {s.seller.isPremierShop && <PremierBadge />}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-normal text-ink-muted">
                  <span>{s.categories.join(", ")}</span>
                  <span>{formatTimeLive(s.startTime)}</span>
                  {s.totalWatchlistUsers > 0 && (
                    <span>{s.totalWatchlistUsers.toLocaleString()} watchlisted</span>
                  )}
                </div>
              </div>
              <ViewerBar
                viewers={s.activeViewers}
                totalViewers={totalViewers}
                barMax={maxViewers}
              />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
