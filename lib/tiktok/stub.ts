import type { DataSource } from "@/lib/core/datasource";
import type { LiveShow, Listing, Seller } from "@/lib/core/types";
import { FIXTURE_LISTINGS, FIXTURE_SELLERS, FIXTURE_SHOWS } from "./fixtures";

/**
 * StubTikTok — serves representative TikTok Shop sample data (see fixtures.ts) so
 * the /tiktok dashboard is fully usable without a paid scraper provider. Selected
 * when TIKTOK_SOURCE is unset/stub. Same interface as every other source.
 */
export class StubTikTok implements DataSource {
  async getLiveShows(opts?: { category?: string; limit?: number }): Promise<LiveShow[]> {
    let shows = FIXTURE_SHOWS;
    if (opts?.category) {
      const c = opts.category.toLowerCase();
      shows = shows.filter((s) =>
        s.categories.some((cat) => cat.toLowerCase().includes(c)),
      );
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
