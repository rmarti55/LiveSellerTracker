import { PER_FEED_LIMIT } from "@/lib/whatnot/feeds";
import type { WhatnotLiveShowsScope } from "@/lib/whatnot/real";

export function ScopeBanner({ scope }: { scope: WhatnotLiveShowsScope }) {
  const totalAvailable = scope.feeds.reduce((s, f) => s + f.totalCount, 0);
  const feedCount = scope.feeds.length;

  return (
    <p className="rounded-lg border border-line-soft bg-panel px-4 py-3 text-sm text-ink-muted">
      Scanned{" "}
      <span className="font-semibold text-ink">{scope.mergedCount.toLocaleString()}</span> live
      shows across {feedCount} {feedCount === 1 ? "category" : "categories"} (top{" "}
      {PER_FEED_LIMIT} per feed
      {totalAvailable > scope.mergedCount
        ? ` · ~${totalAvailable.toLocaleString()} total in those feeds`
        : ""}
      ). Sample — not all of Whatnot.
    </p>
  );
}
