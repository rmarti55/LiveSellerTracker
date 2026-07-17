import type { DataSource } from "@/lib/core/datasource";
import type { LiveShow, Listing, Seller } from "@/lib/core/types";
import { feedBySlug } from "./category-slug";
import { FIXTURE_LISTINGS, FIXTURE_SELLERS, FIXTURE_SHOWS } from "./fixtures";

/**
 * StubWhatnot — serves the real data captured during the spike (see fixtures.ts).
 * Lets the whole dashboard + metrics be built and tested with zero network,
 * before RealWhatnot is wired. Selected via WHATNOT_SOURCE (default) in index.ts.
 */
export class StubWhatnot implements DataSource {
  async getLiveShows(opts?: { category?: string; limit?: number }): Promise<LiveShow[]> {
    let shows = FIXTURE_SHOWS;
    if (opts?.category) {
      const feed = feedBySlug(opts.category);
      if (feed) {
        shows = shows.filter((s) => s.categories.some((cat) => cat === feed.label));
      } else {
        const c = opts.category.toLowerCase();
        shows = shows.filter((s) =>
          s.categories.some((cat) => cat.toLowerCase().includes(c)),
        );
      }
    }
    shows = [...shows].sort((a, b) => b.activeViewers - a.activeViewers);
    return opts?.limit ? shows.slice(0, opts.limit) : shows;
  }

  async getShowListings(showId: string): Promise<Listing[]> {
    return FIXTURE_LISTINGS[showId] ?? [];
  }

  async getSeller(username: string): Promise<Seller | null> {
    return FIXTURE_SELLERS[username] ?? null;
  }
}
