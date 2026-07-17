import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { formatMoney } from "@/lib/core/types";
import { categoryDemand, heatVerdict } from "@/lib/metrics";
import { categoryPriceBands } from "@/lib/metrics/category-prices";
import {
  categoryTrendDeltas,
  formatTrendDelta,
  loadHistoryContext,
} from "@/lib/history";
import { CategoryFilter } from "@/components/category-filter";
import { HistoryBanner } from "@/components/history-banner";
import { Bar, Card, PageHeader, VerdictBadge } from "@/components/ui";
import { feedBySlug, slugForCategoryLabel, withCategoryParam } from "@/lib/whatnot/category-slug";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
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
  const demand = categoryDemand(shows);
  const max = Math.max(1, ...demand.map((d) => d.totalViewers));
  const priceBands = await categoryPriceBands(ds, shows);
  const trends =
    history.mode === "history"
      ? categoryTrendDeltas(history.rows)
      : [];
  const trendByCat = new Map(trends.map((t) => [t.category, t]));
  const money = (c: number) => formatMoney({ amount: c, currency: "USD" });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Category Demand">
        Where the eyeballs are — concurrent viewers and watchlist interest by category.
        {activeFeed && (
          <span className="block mt-1 text-xs text-ink-faint">
            Filtered to {activeFeed.label}
          </span>
        )}
      </PageHeader>

      <CategoryFilter
        platform={platform}
        basePath={`/${platform}/categories`}
        activeSlug={activeFeed?.slug}
      />

      <HistoryBanner mode={history.mode} daysAvailable={history.daysAvailable} />

      {demand.length === 0 ? (
        <Card title="No categories">
          <p className="px-4 py-6 text-sm text-ink-muted">
            No category data right now
            {activeFeed ? ` for ${activeFeed.label}` : ""}. Check{" "}
            <Link href={`/${platform}/best-time`} className="text-signal hover:underline">
              Best Time
            </Link>{" "}
            for peak hours.
          </p>
        </Card>
      ) : (
        <Card title={`${demand.length} categories`}>
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-faint">
              <tr className="border-b border-line-soft">
                <th className="text-left font-medium px-4 py-2">Category</th>
                <th className="text-left font-medium px-4 py-2">Demand</th>
                <th className="text-right font-medium px-4 py-2">7-day trend</th>
                <th className="text-right font-medium px-4 py-2">Price band</th>
                <th className="text-right font-medium px-4 py-2">Live shows</th>
                <th className="text-right font-medium px-4 py-2">Watchlist</th>
                <th className="text-right font-medium px-4 py-2">Viewers</th>
                <th className="px-4 py-2 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {demand.map((d) => {
                const pp = priceBands.get(d.category);
                const trend = trendByCat.get(d.category);
                const catSlug = slugForCategoryLabel(d.category);
                const filterHref = catSlug
                  ? withCategoryParam(`/${platform}/whats-selling`, catSlug)
                  : null;

                return (
                  <tr key={d.category}>
                    <td className="px-4 py-2.5 font-semibold">
                      {filterHref ? (
                        <Link href={filterHref} className="hover:text-signal hover:underline">
                          {d.category}
                        </Link>
                      ) : (
                        d.category
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <VerdictBadge verdict={heatVerdict(d.totalViewers, max)} />
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-xs text-ink-muted">
                      {trend ? formatTrendDelta(trend.deltaPct) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-xs text-ink-muted">
                      {pp && pp.count > 0 ? (
                        <>
                          {money(pp.medianCents)}
                          <span className="text-ink-faint">
                            {" "}
                            ({money(pp.minCents)}–{money(pp.maxCents)})
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{d.liveShows}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">
                      {d.totalWatchlist.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                      {d.totalViewers.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <Bar value={d.totalViewers} max={max} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
