/**
 * Phase 5 — always-on listing poller (deferred).
 *
 * Vercel Cron runs hourly; hammer prices clear in seconds during live auctions.
 * When Phase 3 category momentum is insufficient for Bri, deploy this worker on
 * Railway/Fly to poll top live shows every 2–5 minutes and insert into
 * `listing_snapshots` (see db/schema.ts).
 *
 * Detection: listing title disappears or bidCount resets → mark prior row hammered.
 * Not implemented until explicitly needed.
 */
export const LISTING_POLLER_INTERVAL_MS = 5 * 60 * 1000;
export const LISTING_POLLER_MAX_SHOWS = 10;
