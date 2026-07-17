import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { bestTimeToGoLive } from "@/lib/metrics";
import { HourDemandChart } from "@/components/hour-demand-chart";
import { Card, PageHeader, StatTile } from "@/components/ui";
import { formatPacificHour } from "@/lib/time/pacific";

export const dynamic = "force-dynamic";

export default async function BestTimePage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();

  const ds = await getDataSource(platform);
  const shows = await ds.getLiveShows();
  const hours = bestTimeToGoLive(shows);
  const peakHour = [...hours].sort((a, b) => b.totalViewers - a.totalViewers)[0];
  const showsWithStartTime = shows.filter((s) => s.startTime > 0).length;
  const hasData = hours.some((h) => h.totalViewers > 0);
  const peakLabel = formatPacificHour(peakHour.hour);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Best time to go live">
        When buyers are already watching — weighted by concurrent viewers in the current snapshot,
        by hour of show start.
      </PageHeader>

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
          label="Peak viewers"
          value={hasData ? peakHour.totalViewers.toLocaleString() : "—"}
          sub={hasData ? `at ${peakLabel}` : undefined}
        />
        <StatTile
          label="Shows at peak"
          value={hasData ? peakHour.showCount : "—"}
          sub={hasData ? "live in busiest hour" : undefined}
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
