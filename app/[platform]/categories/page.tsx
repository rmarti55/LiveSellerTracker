import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { categoryDemand, heatVerdict } from "@/lib/metrics";
import { Bar, Card, PageHeader, VerdictBadge } from "@/components/ui";

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
      <PageHeader title="Category Demand">
        Where the eyeballs are — concurrent viewers and watchlist interest by category.
      </PageHeader>
      <Card title={`${demand.length} categories`}>
        <table className="w-full text-sm">
          <thead className="text-xs text-ink-faint">
            <tr className="border-b border-line-soft">
              <th className="text-left font-medium px-4 py-2">Category</th>
              <th className="text-left font-medium px-4 py-2">Demand</th>
              <th className="text-right font-medium px-4 py-2">Live shows</th>
              <th className="text-right font-medium px-4 py-2">Watchlist</th>
              <th className="text-right font-medium px-4 py-2">Viewers</th>
              <th className="px-4 py-2 w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {demand.map((d) => (
              <tr key={d.category}>
                <td className="px-4 py-2.5 font-semibold">{d.category}</td>
                <td className="px-4 py-2.5">
                  <VerdictBadge verdict={heatVerdict(d.totalViewers, max)} />
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
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
