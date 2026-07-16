import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { formatMoney } from "@/lib/core/types";
import { pricePoints, productDemand, type DemandItem } from "@/lib/metrics";
import { Bar, Card, LiveDot, PremierBadge, StatTile, VerdictBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SellerPage({
  params,
}: {
  params: Promise<{ platform: string; username: string }>;
}) {
  const { platform, username } = await params;
  if (!isPlatform(platform)) notFound();

  const uname = decodeURIComponent(username);
  const ds = await getDataSource(platform);
  const [seller, shows] = await Promise.all([ds.getSeller(uname), ds.getLiveShows()]);
  const theirShows = shows.filter((s) => s.seller.username === uname);
  const live = theirShows.filter((s) => s.status === "PLAYING");
  const scheduled = theirShows.filter((s) => s.status === "CREATED");
  const viewers = live.reduce((s, x) => s + x.activeViewers, 0);
  const ref = seller ?? theirShows[0]?.seller;

  // Teardown: pull what they're selling across their live shows.
  const perShow = await Promise.all(
    live.map((s) => ds.getShowListings(s.id).then((ls) => ({ s, ls }))),
  );
  const listings = perShow.flatMap(({ ls }) => ls);
  const pp = pricePoints(listings);
  const demandItems: DemandItem[] = perShow.flatMap(({ s, ls }) =>
    ls.map((l) => ({
      title: l.title,
      category: s.categories[0] ?? "Uncategorized",
      seller: uname,
      priceCents: l.currentBid?.amount ?? l.price.amount,
      soldCount: l.soldCount,
      bidCount: l.currentBidCount ?? undefined,
      transactionType: l.transactionType,
    })),
  );
  const topItems = productDemand(demandItems).slice(0, 8);

  // Category focus.
  const catCounts = new Map<string, number>();
  for (const s of theirShows)
    for (const c of s.categories) catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
  const categories = [...catCounts.entries()].sort((a, b) => b[1] - a[1]);
  const money = (c: number) => formatMoney({ amount: c, currency: "USD" });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/${platform}/sellers`} className="text-xs text-indigo-500 hover:underline">← Top Sellers</Link>
        <h1 className="text-xl font-semibold mt-1">
          {uname}
          {ref?.isPremierShop && <PremierBadge />}
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Competitor teardown — how they sell, what they price at, and what&apos;s moving.
        </p>
      </div>

      {/* Reach & cadence */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Live now" value={live.length} sub={`${viewers.toLocaleString()} viewers`} />
        <StatTile label="Scheduled" value={scheduled.length} sub="upcoming shows" />
        <StatTile label="Reviews (sales proxy)" value={ref?.numReviews?.toLocaleString() ?? "—"} />
        <StatTile label="Rating" value={ref?.rating?.toFixed(1) ?? "—"} />
      </div>

      {/* What they price at */}
      {pp.count > 0 && (
        <Card title="What they price at">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
            <StatTile label="Low" value={money(pp.minCents)} />
            <StatTile label="Median" value={money(pp.medianCents)} />
            <StatTile label="Average" value={money(pp.avgCents)} />
            <StatTile label="High" value={money(pp.maxCents)} />
          </div>
        </Card>
      )}

      {/* Category focus */}
      {categories.length > 0 && (
        <Card title="Category focus">
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {categories.map(([cat, n]) => (
              <li key={cat} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                <span className="flex-1 truncate">{cat}</span>
                <span className="text-xs text-black/40 dark:text-white/40">{n} show{n === 1 ? "" : "s"}</span>
                <span className="w-24"><Bar value={n} max={categories[0][1]} /></span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* What's moving for them */}
      {topItems.length > 0 && (
        <Card title="What's moving for them">
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {topItems.map((r, i) => (
              <li key={`${r.title}-${i}`} className="px-4 py-3 flex items-center gap-3">
                <span className="flex-1 min-w-0 text-sm font-medium line-clamp-1">{r.title}</span>
                <VerdictBadge verdict={r.verdict} />
                {r.demandScore > 0 && (
                  <span className="text-xs tabular-nums text-black/40 dark:text-white/40 w-20 text-right">
                    {r.demandScore.toLocaleString()} {r.demandBasis === "sold" ? "sold" : "bids"}
                  </span>
                )}
                <span className="text-sm tabular-nums font-medium w-16 text-right">{money(r.priceCents)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Shows */}
      <Card title="Shows">
        {theirShows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-black/50 dark:text-white/50">No current shows for this seller.</p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {theirShows.map((s) => (
              <li key={s.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/${platform}/shows/${s.id}`} className="text-sm font-medium hover:underline line-clamp-1">
                    {s.title}
                  </Link>
                  <div className="text-xs text-black/50 dark:text-white/50">{s.categories.join(", ")}</div>
                </div>
                <div className="text-sm tabular-nums flex items-center gap-2">
                  {s.status === "PLAYING" ? <LiveDot /> : <span className="text-black/40 dark:text-white/40">scheduled</span>}
                  {s.status === "PLAYING" && s.activeViewers.toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
