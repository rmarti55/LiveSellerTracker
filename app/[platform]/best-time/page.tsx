import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { bestTimeToGoLive } from "@/lib/metrics";
import {
  bestTimeFromHistory,
  loadHistoryContext,
} from "@/lib/history";
import { HourDemandChart } from "@/components/hour-demand-chart";
import { HistoryBanner } from "@/components/history-banner";
import { CategoryFilter } from "@/components/category-filter";
import { Card, PageHeader, StatTile } from "@/components/ui";
import { formatPacificHour } from "@/lib/time/pacific";
import { feedBySlug } from "@/lib/whatnot/category-slug";

export const dynamic = "force-dynamic";

export default async function BestTimePage({
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

  const useHistory = history.mode === "history" && history.rows.length > 0;
  const hours = useHistory ? bestTimeFromHistory(history.rows) : bestTimeToGoLive(shows);
  const peakHour = [...hours].sort((a, b) => b.totalViewers - a.totalViewers)[0];
  const showsWithStartTime = shows.filter((s) => s.startTime > 0).length;
  const hasData = hours.some((h) => h.totalViewers > 0);
  const peakLabel = formatPacificHour(peakHour.hour);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Best time to go live">
        {useHistory
          ? "When buyers watch — weighted by concurrent viewers across the last 7 days of snapshots."
          : "When buyers are already watching — weighted by concurrent viewers in the current snapshot, by hour of show start."}
        {activeFeed && (
          <span className="block mt-1 text-xs text-ink-faint">
            Filtered to {activeFeed.label}
          </span>
        )}
      </PageHeader>

      {platform === "whatnot" && (
        <CategoryFilter
          platform={platform}
          basePath={`/${platform}/best-time`}
          activeSlug={activeFeed?.slug}
        />
      )}

      <HistoryBanner mode={history.mode} daysAvailable={history.daysAvailable} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Peak hour"
          value={hasData ? peakLabel : "—"}
          sub={
            hasData
              ? `${peakHour.totalViewers.toLocaleString()} viewers`
              : "No demand data yet"
          }
        />
        <StatTile
          label="Data source"
          value={useHistory ? "7-day panel" : "Snapshot"}
          sub={useHistory ? "from collected history" : "from right now"}
        />
        <StatTile
          label="Shows at peak"
          value={hasData ? peakHour.showCount : "—"}
          sub={hasData ? "in busiest hour" : undefined}
        />
        <StatTile
          label="Shows with start time"
          value={showsWithStartTime}
          sub={`of ${shows.length} in snapshot`}
        />
      </div>

      <Card title="Viewer demand by hour">
        <div className="p-4">
          <HourDemandChart hours={hours} />
          {hasData && (
            <p className="mt-3 text-xs text-ink-muted">
              Busiest window is{" "}
              <span className="font-display font-bold text-ink">{peakLabel}</span> — go live around
              then to catch the most buyers.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
