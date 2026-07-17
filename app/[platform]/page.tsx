import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { bestTimeToGoLive, categoryDemand } from "@/lib/metrics";
import {
  bestTimeFromHistory,
  loadHistoryContext,
} from "@/lib/history";
import { CategoryFilter } from "@/components/category-filter";
import { DoThisNext } from "@/components/do-this-next";
import { ScopeBanner } from "@/components/scope-banner";
import { HistoryBanner } from "@/components/history-banner";
import { TrackMyShop } from "@/components/track-my-shop";
import { MyShopProgressLink } from "@/components/my-shop-progress";
import {
  Card,
  formatTimeLive,
  PageHeader,
  PremierBadge,
  SellerLink,
  StatTile,
  ViewerBar,
} from "@/components/ui";
import { feedBySlug } from "@/lib/whatnot/category-slug";
import { getWhatnotScope } from "@/lib/whatnot/scope";
import { getTrackedFeeds } from "@/lib/whatnot/feeds";

export const dynamic = "force-dynamic";

export default async function Overview({
  params,
  searchParams,
}: {
  params: Promise<{ platform: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { platform } = await params;
  const { category: categorySlug } = await searchParams;
  if (!isPlatform(platform)) notFound();

  const activeFeed = feedBySlug(categorySlug);
  const [ds, history] = await Promise.all([
    getDataSource(platform),
    loadHistoryContext(platform),
  ]);
  const shows = await ds.getLiveShows(
    activeFeed ? { category: activeFeed.slug } : undefined,
  );
  const scope = platform === "whatnot" ? getWhatnotScope(ds) : null;

  const trackedFeeds = platform === "whatnot" ? getTrackedFeeds() : [];
  const trackedLabels = trackedFeeds.map((f) => f.label).join(", ");

  const live = shows
    .filter((s) => s.status === "PLAYING")
    .sort((a, b) => b.activeViewers - a.activeViewers);
  const totalViewers = live.reduce((s, x) => s + x.activeViewers, 0);
  const demand = categoryDemand(shows);
  const scheduled = shows.filter((s) => s.status === "CREATED").length;
  const maxViewers = Math.max(1, ...live.map((s) => s.activeViewers));
  const hotCategory = demand.find((d) => d.liveShows > 0)?.category ?? demand[0]?.category ?? null;
  const useHistory = history.mode === "history" && history.rows.length > 0;
  const hours = useHistory
    ? bestTimeFromHistory(history.rows)
    : bestTimeToGoLive(shows);
  const peakHour = hours.some((h) => h.totalViewers > 0)
    ? [...hours].sort((a, b) => b.totalViewers - a.totalViewers)[0].hour
    : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={platform === "whatnot" ? "Live snapshot" : "Market Overview"}>
        {platform === "whatnot" ? (
          <>
            {live.length} live {live.length === 1 ? "show" : "shows"} across{" "}
            {trackedFeeds.length} tracked {trackedFeeds.length === 1 ? "category" : "categories"}
            {trackedLabels ? `: ${trackedLabels}` : ""}.
            {!scope && " Sample from top shows per feed — not all of Whatnot."}
          </>
        ) : (
          <>Live TikTok Shop activity, right now.</>
        )}
      </PageHeader>

      {platform === "whatnot" && (
        <CategoryFilter
          platform={platform}
          basePath={`/${platform}`}
          activeSlug={activeFeed?.slug}
        />
      )}

      {scope && <ScopeBanner scope={scope} />}

      <HistoryBanner mode={history.mode} daysAvailable={history.daysAvailable} />

      <DoThisNext platform={platform} hotCategory={hotCategory} peakHour={peakHour} />

      {platform === "whatnot" && (
        <>
          <TrackMyShop platform={platform} />
          <MyShopProgressLink platform={platform} />
        </>
      )}

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
        {live.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">
            Nothing live in this snapshot right now. Check{" "}
            <Link href={`/${platform}/best-time`} className="text-signal hover:underline">
              Best Time
            </Link>{" "}
            for peak hours, or try another category.
          </p>
        ) : (
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
        )}
      </Card>
    </div>
  );
}
