import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataSource, isPlatform, type Platform } from "@/lib/core";
import { formatMoney } from "@/lib/core/types";
import {
  hasDemandSignal,
  productDemand,
  sellThroughByCategory,
  type DemandItem,
} from "@/lib/metrics";
import { CategoryFilter } from "@/components/category-filter";
import {
  categoryTrendDeltas,
  formatTrendDelta,
  loadHistoryContext,
} from "@/lib/history";
import { HistoryBanner } from "@/components/history-banner";
import { Bar, Card, PageHeader, SellerLink, StatTile, VerdictBadge } from "@/components/ui";
import { feedBySlug } from "@/lib/whatnot/category-slug";

export const dynamic = "force-dynamic";

const MAX_SHOWS = 10; // bound the fan-out of getShowListings

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function demandSubtitle(platform: Platform, signal: boolean): string {
  if (platform === "tiktok" && signal) {
    return "What's actually moving across the busiest live shows, so you source what sells — not a dead pile. Demand = units sold.";
  }
  if (platform === "tiktok") {
    return "The live catalog + price ranges across the busiest shows.";
  }
  if (signal) {
    return "What's moving across busy live shows. On Whatnot, demand = bids on the item currently being auctioned — not full sell-through.";
  }
  return "The live catalog + price ranges across the busiest shows. On Whatnot, per-item sell-through isn't exposed in a snapshot — true velocity unlocks once the collector has history.";
}

export default async function WhatsSellingPage({
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
  const live = shows
    .filter((s) => s.status === "PLAYING")
    .sort((a, b) => b.activeViewers - a.activeViewers)
    .slice(0, MAX_SHOWS);

  const perShow = await Promise.all(
    live.map((s) => ds.getShowListings(s.id).then((ls) => ({ s, ls }))),
  );
  const items: DemandItem[] = perShow.flatMap(({ s, ls }) =>
    ls.map((l) => ({
      title: l.title,
      category: s.categories[0] ?? "Uncategorized",
      seller: s.seller.username,
      priceCents: l.currentBid?.amount ?? l.price.amount,
      soldCount: l.soldCount,
      bidCount: l.currentBidCount ?? undefined,
      transactionType: l.transactionType,
    })),
  );

  const rows = productDemand(items);
  let cats = sellThroughByCategory(rows);
  const trends =
    history.mode === "history"
      ? categoryTrendDeltas(history.rows)
      : [];
  const trendByCat = new Map(trends.map((t) => [t.category, t]));

  if (trends.length > 0) {
    cats = [...cats].sort((a, b) => {
      const da = trendByCat.get(a.category)?.deltaPct ?? 0;
      const db = trendByCat.get(b.category)?.deltaPct ?? 0;
      return db - da;
    });
  }

  const signal = hasDemandSignal(rows);
  const money = (c: number) => formatMoney({ amount: c, currency: "USD" });
  const priced = rows.filter((r) => r.priceCents > 0);
  const medPrice = median(priced.map((r) => r.priceCents));
  const maxCatDemand = Math.max(1, ...cats.map((c) => c.demandScore));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="What's Selling — right now">
        {demandSubtitle(platform, signal)}
        {activeFeed && (
          <span className="block mt-1 text-xs text-ink-faint">
            Filtered to {activeFeed.label}
          </span>
        )}
      </PageHeader>

      <CategoryFilter
        platform={platform}
        basePath={`/${platform}/whats-selling`}
        activeSlug={activeFeed?.slug}
      />

      <HistoryBanner mode={history.mode} daysAvailable={history.daysAvailable} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Items live" value={rows.length} />
        <StatTile label="Shows scanned" value={live.length} />
        {signal ? (
          <StatTile
            label="Selling fast"
            value={rows.filter((r) => r.verdict === "hot").length}
            sub="high demand"
          />
        ) : (
          <StatTile label="Median price" value={medPrice ? money(medPrice) : "—"} />
        )}
        <StatTile label="Categories" value={cats.length} />
      </div>

      {rows.length === 0 ? (
        <Card title="No listing data">
          <p className="px-4 py-6 text-sm text-ink-muted">
            No live listings to analyze right now
            {activeFeed ? ` in ${activeFeed.label}` : ""}. Check{" "}
            <Link href={`/${platform}/best-time`} className="text-signal hover:underline">
              Best Time
            </Link>{" "}
            for peak hours, or try another category.
          </p>
        </Card>
      ) : (
        <>
          <Card
            title={
              trends.length > 0
                ? "Categories by momentum — source into what's rising"
                : signal
                  ? "What category is selling — source into demand"
                  : "Categories live now — price ranges"
            }
          >
            <ul className="divide-y divide-line-soft">
              {[...cats]
                .sort((a, b) => (signal ? b.demandScore - a.demandScore : b.items - a.items))
                .map((c) => {
                  const trend = trendByCat.get(c.category);
                  return (
                  <li key={c.category} className="px-4 py-3 flex items-center gap-3 text-sm">
                    <span className="flex-1 truncate font-semibold">{c.category}</span>
                    {trend && (
                      <span className="text-xs tabular-nums text-ink-muted w-16 text-right">
                        {formatTrendDelta(trend.deltaPct)}
                      </span>
                    )}
                    <span className="text-xs text-ink-faint">{c.items} items</span>
                    {signal ? <VerdictBadge verdict={c.verdict} /> : null}
                    <span className="w-24 text-right tabular-nums text-ink-muted">
                      ~{money(c.medianPriceCents)}
                    </span>
                    {signal && (
                      <span className="w-24">
                        <Bar value={c.demandScore} max={maxCatDemand} />
                      </span>
                    )}
                  </li>
                  );
                })}
            </ul>
          </Card>

          <Card
            title={signal ? "Hottest items right now" : "Live listings — by price"}
            action={
              <span className="text-xs text-ink-faint">
                {signal ? "by demand" : "highest first"}
              </span>
            }
          >
            <ul className="divide-y divide-line-soft">
              {[...rows]
                .sort((a, b) => (signal ? 0 : b.priceCents - a.priceCents))
                .slice(0, 30)
                .map((r, i) => (
                  <li key={`${r.title}-${i}`} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold line-clamp-1">{r.title}</div>
                      <div className="mt-0.5 text-xs text-ink-muted">
                        <span>{r.category}</span>
                        {" · "}
                        <SellerLink platform={platform} username={r.seller} />
                      </div>
                    </div>
                    <VerdictBadge verdict={r.verdict} />
                    {r.demandScore > 0 && (
                      <span className="text-xs tabular-nums text-ink-faint w-20 text-right">
                        {r.demandScore.toLocaleString()}{" "}
                        {r.demandBasis === "sold" ? "sold" : "bids"}
                      </span>
                    )}
                    <span className="text-sm tabular-nums font-medium w-16 text-right">
                      {money(r.priceCents)}
                    </span>
                  </li>
                ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
