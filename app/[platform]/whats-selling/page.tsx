import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { formatMoney } from "@/lib/core/types";
import {
  hasDemandSignal,
  productDemand,
  sellThroughByCategory,
  type DemandItem,
} from "@/lib/metrics";
import { Bar, Card, SellerLink, StatTile, VerdictBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

const MAX_SHOWS = 10; // bound the fan-out of getShowListings

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

export default async function WhatsSellingPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();

  const ds = await getDataSource(platform);
  const shows = await ds.getLiveShows();
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
  const cats = sellThroughByCategory(rows);
  const signal = hasDemandSignal(rows);
  const money = (c: number) => formatMoney({ amount: c, currency: "USD" });
  const priced = rows.filter((r) => r.priceCents > 0);
  const medPrice = median(priced.map((r) => r.priceCents));
  const maxCatDemand = Math.max(1, ...cats.map((c) => c.demandScore));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">What&apos;s Selling — right now</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          {signal
            ? "What's actually moving across the busiest live shows, so you source what sells — not a dead pile. Demand = units sold."
            : "The live catalog + price ranges across the busiest shows. On Whatnot, per-item sell-through isn't exposed in a snapshot — true velocity unlocks once the collector has history."}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Items live" value={rows.length} />
        <StatTile label="Shows scanned" value={live.length} />
        {signal ? (
          <StatTile
            label="Selling fast"
            value={rows.filter((r) => r.verdict === "hot").length}
            sub="🔥 high demand"
          />
        ) : (
          <StatTile label="Median price" value={medPrice ? money(medPrice) : "—"} />
        )}
        <StatTile label="Categories" value={cats.length} />
      </div>

      {rows.length === 0 ? (
        <Card title="No listing data">
          <p className="px-4 py-6 text-sm text-black/50 dark:text-white/50">
            No live listings to analyze right now
            {platform === "tiktok" ? " (TikTok sample data is limited)." : "."}
          </p>
        </Card>
      ) : (
        <>
          <Card title={signal ? "What category is selling — source into demand" : "Categories live now — price ranges"}>
            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {[...cats]
                .sort((a, b) => (signal ? b.demandScore - a.demandScore : b.items - a.items))
                .map((c) => (
                  <li key={c.category} className="px-4 py-3 flex items-center gap-3 text-sm">
                    <span className="flex-1 truncate font-medium">{c.category}</span>
                    <span className="text-xs text-black/40 dark:text-white/40">{c.items} items</span>
                    {signal ? <VerdictBadge verdict={c.verdict} /> : null}
                    <span className="w-24 text-right tabular-nums text-black/50 dark:text-white/50">
                      ~{money(c.medianPriceCents)}
                    </span>
                    {signal && (
                      <span className="w-24">
                        <Bar value={c.demandScore} max={maxCatDemand} />
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </Card>

          <Card
            title={signal ? "Hottest items right now" : "Live listings — by price"}
            action={<span className="text-xs text-black/40 dark:text-white/40">{signal ? "by demand" : "highest first"}</span>}
          >
            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {[...rows]
                .sort((a, b) => (signal ? 0 : b.priceCents - a.priceCents))
                .slice(0, 30)
                .map((r, i) => (
                  <li key={`${r.title}-${i}`} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">{r.title}</div>
                      <div className="text-xs text-black/50 dark:text-white/50">
                        {r.category} · <SellerLink platform={platform} username={r.seller} />
                      </div>
                    </div>
                    <VerdictBadge verdict={r.verdict} />
                    {r.demandScore > 0 && (
                      <span className="text-xs tabular-nums text-black/40 dark:text-white/40 w-20 text-right">
                        {r.demandScore.toLocaleString()} {r.demandBasis === "sold" ? "sold" : "bids"}
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
