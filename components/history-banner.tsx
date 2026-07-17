import { HISTORY_FULL_DAYS, type HistoryMode } from "@/lib/history/metrics";

export function HistoryBanner({
  mode,
  daysAvailable,
}: {
  mode: HistoryMode;
  daysAvailable: number;
}) {
  if (mode === "snapshot") return null;

  const daysRounded = Math.min(Math.floor(daysAvailable), HISTORY_FULL_DAYS);

  if (mode === "building") {
    return (
      <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-ink-muted">
        Building history — day {daysRounded} of {HISTORY_FULL_DAYS}. Trend labels unlock
        once a full week of snapshots is collected.
      </p>
    );
  }

  return (
    <p className="rounded-lg border border-teal-600/30 bg-teal-600/10 px-4 py-3 text-sm text-ink-muted">
      Based on the last {HISTORY_FULL_DAYS} days of collected snapshots — more stable than
      a single live snapshot.
    </p>
  );
}
