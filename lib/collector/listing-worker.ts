/**
 * Phase 5 — always-on listing poller (deferred).
 *
 * Vercel Cron runs hourly; hammer prices clear in seconds during live auctions.
 * When Phase 3 category momentum is insufficient for Bri, deploy this worker on
 * Railway/Fly to poll top live shows every 2–5 minutes and insert into
 * `listing_snapshots` (see db/schema.ts).
 *
 * Hammer detection: same listingTitle disappears or bidCount resets → mark hammered.
 */

export const LISTING_POLL_INTERVAL_MS = 5 * 60 * 1000;
export const LISTING_POLL_MAX_SHOWS = 10;

export type ListingPollConfig = {
  platform: "whatnot";
  maxShows: number;
  intervalMs: number;
};

export const DEFAULT_LISTING_POLL_CONFIG: ListingPollConfig = {
  platform: "whatnot",
  maxShows: LISTING_POLL_MAX_SHOWS,
  intervalMs: LISTING_POLL_INTERVAL_MS,
};

/** Not implemented — placeholder for Phase 5 worker entrypoint. */
export async function runListingPollCycle(): Promise<{ inserted: number }> {
  throw new Error(
    "Listing poll worker not deployed. See lib/collector/listing-worker.ts and db/schema listing_snapshots.",
  );
}
