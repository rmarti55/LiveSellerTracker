import type { HourDemand } from "@/lib/metrics";

const TRACK_HEIGHT_PX = 128;

export function HourDemandChart({ hours }: { hours: HourDemand[] }) {
  const maxHour = Math.max(1, ...hours.map((h) => h.totalViewers));
  const hasData = hours.some((h) => h.totalViewers > 0);

  if (!hasData) {
    return (
      <p className="text-sm text-ink-muted">
        No start times in this snapshot — we can&apos;t chart demand by hour yet. Check back after
        the next collect, or switch to a data source that includes show start times.
      </p>
    );
  }

  return (
    <>
      <div className="flex h-32 items-end gap-1" role="img" aria-label="Viewer demand by UTC hour">
        {hours.map((h) => {
          const heightPx =
            h.totalViewers > 0
              ? Math.max(2, Math.round((h.totalViewers / maxHour) * TRACK_HEIGHT_PX))
              : 0;
          return (
            <div
              key={h.hour}
              className="flex flex-1 flex-col justify-end"
              title={`${String(h.hour).padStart(2, "0")}:00 — ${h.totalViewers.toLocaleString()} viewers · ${h.showCount} ${h.showCount === 1 ? "show" : "shows"}`}
            >
              <div
                className="w-full rounded-t bg-teal-600"
                style={{ height: `${heightPx}px` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-faint">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
    </>
  );
}
