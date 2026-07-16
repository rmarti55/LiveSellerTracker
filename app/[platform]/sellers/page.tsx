import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { topSellers } from "@/lib/metrics";
import { Bar, Card, PremierBadge, SellerLink } from "@/components/ui";

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
      <div>
        <h1 className="text-xl font-semibold">Top Sellers Live</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Ranked by concurrent viewers across their live shows. Review count is a
          public lifetime-sales proxy.
        </p>
      </div>
      <Card title={`${sellers.length} sellers live`}>
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {sellers.map((s, i) => (
            <li key={s.username} className="px-4 py-3 flex items-center gap-3">
              <span className="w-6 text-black/40 dark:text-white/40 tabular-nums">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <SellerLink platform={platform} username={s.username} />
                  {s.isPremierShop && <PremierBadge />}
                </div>
                <div className="text-xs text-black/50 dark:text-white/50">
                  {s.liveShows} live show{s.liveShows === 1 ? "" : "s"}
                  {s.numReviews != null && ` · ${s.numReviews.toLocaleString()} reviews`}
                </div>
              </div>
              <div className="w-40 shrink-0 flex items-center gap-2">
                <Bar value={s.totalViewers} max={max} />
                <span className="w-14 text-right tabular-nums text-sm">
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
