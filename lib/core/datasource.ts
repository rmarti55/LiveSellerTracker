import type { LiveShow, Listing, Seller } from "./types";

/**
 * The seam. Everything that reads market data goes through this interface, so the
 * dashboard/metrics/collector never know whether they're talking to captured
 * fixtures, Whatnot's live GraphQL, or a TikTok scraper provider.
 */
export interface DataSource {
  /** Live + scheduled shows, optionally filtered to a category. */
  getLiveShows(opts?: { category?: string; limit?: number }): Promise<LiveShow[]>;
  /** Item listings for a single show (prices, auction state, quantities, sold counts). */
  getShowListings(showId: string): Promise<Listing[]>;
  /** Public seller profile (rating, review count, premier status). */
  getSeller(username: string): Promise<Seller | null>;
}
