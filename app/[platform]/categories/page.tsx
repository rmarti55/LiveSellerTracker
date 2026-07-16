import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { categoryDemand, heatVerdict } from "@/lib/metrics";
import { Bar, Card, VerdictBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();

  const ds = await getDataSource(platform);
  const shows = await ds.getLiveShows();
  const demand = categoryDemand(shows);
  const max = Math.max(1, ...demand.map((d) => d.totalViewers));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Category Demand</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Where the eyeballs are — concurrent viewers and watchlist interest by category.
        </p>
      </div>
      <Card title={`${demand.length} categories`}>
        <table className="w-full text-sm">
          <thead className="text-xs text-black/40 dark:text-white/40">
            <tr className="border-b border-black/5 dark:border-white/10">
              <th className="text-left font-medium px-4 py-2">Category</th>
              <th className="text-left font-medium px-4 py-2">Demand</th>
              <th className="text-right font-medium px-4 py-2">Live shows</th>
              <th className="text-right font-medium px-4 py-2">Watchlist</th>
              <th className="text-right font-medium px-4 py-2">Viewers</th>
              <th className="px-4 py-2 w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {demand.map((d) => (
              <tr key={d.category}>
                <td className="px-4 py-2.5">{d.category}</td>
                <td className="px-4 py-2.5"><VerdictBadge verdict={heatVerdict(d.totalViewers, max)} /></td>
                <td className="px-4 py-2.5 text-right tabular-nums">{d.liveShows}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-black/50 dark:text-white/50">
                  {d.totalWatchlist.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {d.totalViewers.toLocaleString()}
                </td>
                <td className="px-4 py-2.5">
                  <Bar value={d.totalViewers} max={max} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
