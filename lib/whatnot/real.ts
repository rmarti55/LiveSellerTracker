import type { DataSource } from "@/lib/core/datasource";
import type { LiveShow, Listing, Seller } from "@/lib/core/types";
import { withWhatnotCache } from "./cache";
import {
  categoryFeedId,
  getTrackedFeeds,
  PER_FEED_LIMIT,
  type TrackedFeed,
} from "./feeds";

// RealWhatnot — hits Whatnot's public GraphQL API server-side (anonymous,
// cookie-less; proven in spike/probe.mjs and spike/captures/*_real.json). HTML
// routes are Cloudflare-gated (403), but this API route returns 200 to plain
// requests. Introspection is disabled, so these query bodies were lifted from the
// live web app's Apollo documents and trimmed to the fields we use, then validated
// against the endpoint (see spike/SPIKE-FINDINGS.md).

const ENDPOINT = "https://www.whatnot.com/services/graphql/";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

export type WhatnotFeedSnapshot = {
  slug: string;
  label: string;
  totalCount: number;
  fetched: number;
};

export type WhatnotLiveShowsScope = {
  feeds: WhatnotFeedSnapshot[];
  mergedCount: number;
};

type GqlResult<T> = { data?: T; errors?: Array<{ message: string }> };

async function gql<T>(
  operationName: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(`${ENDPOINT}?operationName=${operationName}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": UA,
    },
    body: JSON.stringify({ operationName, query, variables }),
    cache: "no-store",
  });
  const json = (await res.json()) as GqlResult<T>;
  if (json.errors?.length) {
    throw new Error(`${operationName} GraphQL error: ${json.errors[0].message}`);
  }
  if (!json.data) throw new Error(`${operationName}: empty response`);
  return json.data;
}

const LIVE_SHOWS_QUERY = /* GraphQL */ `
  query GetLiveShowsMin($feedId: ID!, $objectSize: Int, $objectCursor: String) {
    feed: getFeedFromOnboardingOption(id: $feedId) {
      id
      title
      objects(first: $objectSize, after: $objectCursor) {
        totalCount
        edges {
          node {
            __typename
            ... on FeedEntity {
              object {
                __typename
                ... on LiveStream {
                  id
                  title
                  status
                  activeViewers
                  totalWatchlistUsers
                  startTime
                  categoryNodes { label }
                  user {
                    id
                    username
                    premierShopStatus { isPremierShop }
                    sellerRating { numReviews overall }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const LISTINGS_QUERY = /* GraphQL */ `
  query LiveShopListings($liveId: ID!, $first: Int) {
    liveShop(liveId: $liveId) {
      feed(query: "") {
        objects(first: $first) {
          edges {
            node {
              ... on FeedEntity {
                object {
                  __typename
                  ... on ListingNode {
                    title
                    subtitle
                    price { amount currency }
                    listingStatus: publicStatus
                    transactionType
                    quantity
                    currentBid { amount currency }
                    currentBidCount
                    transactionProps { auction { durationSeconds } }
                    liveAuctionInfo: auctionState(channelType: LIVE, channelId: $liveId) {
                      bidCount
                      currentPrice { amount currency }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapShow(ls: any): LiveShow {
  return {
    id: ls.id,
    title: ls.title ?? "",
    status: ls.status ?? "PLAYING",
    activeViewers: ls.activeViewers ?? 0,
    totalWatchlistUsers: ls.totalWatchlistUsers ?? 0,
    startTime: ls.startTime ?? 0,
    categories: (ls.categoryNodes ?? []).map((c: any) => c?.label).filter(Boolean),
    seller: {
      id: ls.user?.id ?? "",
      username: ls.user?.username ?? "",
      isPremierShop: ls.user?.premierShopStatus?.isPremierShop ?? false,
      numReviews: ls.user?.sellerRating?.numReviews,
      rating: ls.user?.sellerRating?.overall,
    },
  };
}

function mapListing(l: any): Listing {
  // Prefer the live auction state (real hammer price) over the static start price.
  const liveBid = l.liveAuctionInfo?.currentPrice ?? l.currentBid ?? null;
  const bidCount = l.liveAuctionInfo?.bidCount ?? l.currentBidCount ?? null;
  return {
    title: l.title ?? "",
    subtitle: l.subtitle ?? undefined,
    price: l.price
      ? { amount: l.price.amount, currency: l.price.currency }
      : { amount: 0, currency: "USD" },
    quantity: l.quantity ?? undefined,
    transactionType: l.transactionType ?? "AUCTION",
    publicStatus: l.listingStatus ?? undefined,
    auctionDurationSec: l.transactionProps?.auction?.durationSeconds ?? null,
    currentBid: liveBid ? { amount: liveBid.amount, currency: liveBid.currency } : null,
    currentBidCount: bidCount,
  };
}

function feedObjects(edges: any[], typename: string): any[] {
  return edges
    .map((e) => e?.node?.object)
    .filter((o) => o && o.__typename === typename);
}

function mergeShows(showLists: LiveShow[][]): LiveShow[] {
  const byId = new Map<string, LiveShow>();
  for (const shows of showLists) {
    for (const show of shows) {
      const existing = byId.get(show.id);
      if (!existing || show.activeViewers > existing.activeViewers) {
        byId.set(show.id, show);
      }
    }
  }
  return [...byId.values()].sort((a, b) => {
    if (a.status === "PLAYING" && b.status !== "PLAYING") return -1;
    if (b.status === "PLAYING" && a.status !== "PLAYING") return 1;
    return b.activeViewers - a.activeViewers;
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export class RealWhatnot implements DataSource {
  /** Set after each multi-feed getLiveShows call (for UI scope copy). */
  lastScope: WhatnotLiveShowsScope | null = null;

  private async fetchFeedShows(
    feed: TrackedFeed,
    limit: number,
  ): Promise<{ feed: WhatnotFeedSnapshot; shows: LiveShow[] }> {
    const feedId = categoryFeedId(feed.tagId);
    const cacheKey = `shows:${feedId}:${limit}`;

    return withWhatnotCache(cacheKey, async () => {
      const data = await gql<{
        feed?: { objects?: { totalCount?: number; edges?: unknown[] } };
      }>("GetLiveShowsMin", LIVE_SHOWS_QUERY, {
        feedId,
        objectSize: limit,
        objectCursor: null,
      });
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const edges = (data.feed?.objects?.edges ?? []) as any[];
      const shows = feedObjects(edges, "LiveStream").map(mapShow);
      return {
        feed: {
          slug: feed.slug,
          label: feed.label,
          totalCount: data.feed?.objects?.totalCount ?? shows.length,
          fetched: shows.length,
        },
        shows,
      };
    });
  }

  private async fetchSingleFeedShows(
    feedId: string,
    limit: number,
  ): Promise<LiveShow[]> {
    const cacheKey = `shows:${feedId}:${limit}`;
    return withWhatnotCache(cacheKey, async () => {
      const data = await gql<{
        feed?: { objects?: { edges?: unknown[] } };
      }>("GetLiveShowsMin", LIVE_SHOWS_QUERY, {
        feedId,
        objectSize: limit,
        objectCursor: null,
      });
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const edges = (data.feed?.objects?.edges ?? []) as any[];
      return feedObjects(edges, "LiveStream").map(mapShow);
    });
  }

  async getLiveShows(opts?: { category?: string; limit?: number }): Promise<LiveShow[]> {
    if (opts?.category?.startsWith("CATEGORY_FEED_V2:")) {
      this.lastScope = null;
      const limit = opts.limit ?? 30;
      return this.fetchSingleFeedShows(opts.category, limit);
    }

    const tracked = getTrackedFeeds();
    const perFeedLimit = opts?.limit ?? PER_FEED_LIMIT;
    const results = await Promise.all(
      tracked.map((feed) => this.fetchFeedShows(feed, perFeedLimit)),
    );

    const shows = mergeShows(results.map((r) => r.shows));
    this.lastScope = {
      feeds: results.map((r) => r.feed),
      mergedCount: shows.length,
    };
    return shows;
  }

  async getShowListings(showId: string): Promise<Listing[]> {
    return withWhatnotCache(`listings:${showId}`, async () => {
      const data = await gql<{
        liveShop?: { feed?: { objects?: { edges?: unknown[] } } };
      }>("LiveShopListings", LISTINGS_QUERY, { liveId: showId, first: 24 });
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const edges = (data.liveShop?.feed?.objects?.edges ?? []) as any[];
      return feedObjects(edges, "ListingNode").map(mapListing);
    });
  }

  async getSeller(username: string): Promise<Seller | null> {
    // Seller rating/premier data is embedded in live shows, so derive it from the
    // current feed rather than a separate user query (sufficient for the MVP).
    const shows = await this.getLiveShows();
    return shows.find((s) => s.seller.username === username)?.seller ?? null;
  }
}
