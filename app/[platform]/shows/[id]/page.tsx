import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { formatMoney } from "@/lib/core/types";
import { pricePoints } from "@/lib/metrics";
import { Card, LiveDot, PageHeader, PremierBadge, SellerLink, StatTile } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ShowPage({
  params,
}: {
  params: Promise<{ platform: string; id: string }>;
}) {
  const { platform, id } = await params;
  if (!isPlatform(platform)) notFound();

  const ds = await getDataSource(platform);
  const shows = await ds.getLiveShows();
  const show = shows.find((s) => s.id === id);
  if (!show) notFound();

  const listings = await ds.getShowListings(id);
  const pp = pricePoints(listings);
  const cents = (c: number) => formatMoney({ amount: c, currency: "USD" });
  const totalSold = listings.reduce((s, l) => s + (l.soldCount ?? 0), 0);
  const hasSold = listings.some((l) => l.soldCount != null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={show.title}
        back={
          <Link href={`/${platform}`} className="text-xs font-medium text-signal hover:underline">
            ← Overview
          </Link>
        }
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {show.status === "PLAYING" && <LiveDot />}
          <SellerLink platform={platform} username={show.seller.username} />
          {show.seller.isPremierShop && <PremierBadge />}
          <span className="text-ink-muted">{show.categories.join(", ")}</span>
        </span>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Viewers" value={show.activeViewers.toLocaleString()} />
        <StatTile
          label={hasSold ? "Units sold" : "Watchlist"}
          value={(hasSold ? totalSold : show.totalWatchlistUsers).toLocaleString()}
        />
        <StatTile label="Listings priced" value={pp.count} />
        <StatTile label="Median price" value={pp.count ? cents(pp.medianCents) : "—"} />
      </div>

      {pp.count > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Low" value={cents(pp.minCents)} />
            <StatTile label="Average" value={cents(pp.avgCents)} />
            <StatTile label="High" value={cents(pp.maxCents)} />
          </div>
          <p className="text-sm text-ink-muted">
            Charge around{" "}
            <span className="font-semibold text-ink">{cents(pp.medianCents)}</span>
            {" — "}
            most items here land between {cents(pp.minCents)} and {cents(pp.maxCents)}.
          </p>
        </>
      )}

      <Card title={`Listings (${listings.length})`}>
        {listings.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">No listing data captured for this show yet.</p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {listings.map((l, i) => (
              <li key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold line-clamp-1">{l.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs font-normal text-ink-muted">
                    {l.subtitle && <span>{l.subtitle}</span>}
                    <span>{l.transactionType}</span>
                    {l.soldCount != null && l.soldCount > 0 && (
                      <span>{l.soldCount.toLocaleString()} sold</span>
                    )}
                    {l.quantity != null && <span>qty {l.quantity.toLocaleString()}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-semibold tabular-nums">
                    {l.currentBid ? formatMoney(l.currentBid) : formatMoney(l.price)}
                  </div>
                  <div className="text-xs font-normal text-ink-faint">
                    {l.currentBid
                      ? `bid · ${l.currentBidCount ?? 0} bids`
                      : l.transactionType === "GIVEAWAY"
                        ? "giveaway"
                        : l.soldCount != null
                          ? "price"
                          : "start"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
