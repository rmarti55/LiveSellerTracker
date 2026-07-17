import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { topSellers } from "@/lib/metrics";
import { Bar, Card, PageHeader, PremierBadge, SellerLink } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SellersPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();

  const ds = await getDataSource(platform);
  const shows = await ds.getLiveShows();
  const sellers = topSellers(shows);
  const max = Math.max(1, ...sellers.map((s) => s.totalViewers));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Top Sellers Live">
        Ranked by concurrent viewers across their live shows. Review count is a public
        lifetime-sales proxy.
      </PageHeader>
      <Card title={`${sellers.length} sellers live`}>
        <ul className="divide-y divide-line-soft">
          {sellers.map((s, i) => (
            <li key={s.username} className="px-4 py-3 flex items-center gap-3">
              <span className="w-6 text-ink-faint tabular-nums text-sm">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <SellerLink platform={platform} username={s.username} />
                  {s.isPremierShop && <PremierBadge />}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs font-normal text-ink-muted">
                  <span>
                    {s.liveShows} live show{s.liveShows === 1 ? "" : "s"}
                  </span>
                  {s.numReviews != null && (
                    <span>{s.numReviews.toLocaleString()} reviews</span>
                  )}
                </div>
              </div>
              <div className="w-40 shrink-0 flex items-center gap-2">
                <Bar value={s.totalViewers} max={max} />
                <span className="w-14 text-right tabular-nums text-base font-display font-bold">
                  {s.totalViewers.toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
