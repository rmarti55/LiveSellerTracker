#!/usr/bin/env node
/** Smoke-test multi-feed RealWhatnot fetch (WHATNOT_SOURCE=real). */
import { RealWhatnot } from "../lib/whatnot/real.ts";
import { getTrackedFeeds } from "../lib/whatnot/feeds.ts";

async function main() {
  const ds = new RealWhatnot();
  const shows = await ds.getLiveShows();
  const live = shows.filter((s) => s.status === "PLAYING");
  const categories = [...new Set(shows.flatMap((s) => s.categories))].sort();
  const tcg = shows.filter((s) =>
    s.categories.some((c) => /pokémon|pokemon|trading card|tcg/i.test(c)),
  );

  console.log("tracked feeds:", getTrackedFeeds().map((f) => f.label).join(", "));
  console.log("total fetched:", shows.length);
  console.log("live now:", live.length);
  console.log("unique categories:", categories.length);
  console.log("sample categories:", categories.slice(0, 15).join(" | "));
  console.log("tcg-heavy shows:", tcg.length);
  console.log(
    "scope feeds:",
    ds.lastScope?.feeds.map((f) => `${f.label}:${f.fetched}`).join(", "),
  );

  if (shows.length <= 30) {
    console.warn("WARN: expected >30 merged shows from 5 feeds");
    process.exitCode = 1;
  }
  if (tcg.length === shows.length) {
    console.warn("WARN: all shows look TCG-heavy");
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
