import type { DataSource } from "@/lib/core/datasource";
import type { Listing, LiveShow, Seller } from "@/lib/core/types";

// RealTikTok — key-gated adapter to a managed TikTok scraper provider.
//
// WHY a provider (not direct scraping like Whatnot): in 2026 TikTok requires
// per-request signatures (X-Bogus / X-Gnarly / X-Argus / msToken / ttwid) +
// residential US proxies + browser-fingerprint matching. Naive server-side
// requests return empty/blocked. Managed providers (Apify, Bright Data) handle all
// of that and return structured JSON. This adapter targets an Apify actor's
// run-sync API; swap ENDPOINT/mapping to match whichever actor/provider you enable.
//
// Enable by setting TIKTOK_SOURCE=real and TIKTOK_PROVIDER_TOKEN (+ optional
// TIKTOK_PROVIDER_ACTOR). Until then, StubTikTok serves the UI. The mapping below
// is typed and defensive; verify field names against your chosen actor's output.

const DEFAULT_ACTOR = "scraper-engine~tiktok-shop-data-scraper";

type ProviderItem = Record<string, unknown>;

function cfg() {
  const token = process.env.TIKTOK_PROVIDER_TOKEN;
  if (!token) {
    throw new Error(
      "TikTok real source not configured. Set TIKTOK_PROVIDER_TOKEN (and optionally " +
        "TIKTOK_PROVIDER_ACTOR) to enable, or leave TIKTOK_SOURCE unset to use sample data.",
    );
  }
  const actor = process.env.TIKTOK_PROVIDER_ACTOR || DEFAULT_ACTOR;
  return { token, actor };
}

async function runActor(input: Record<string, unknown>): Promise<ProviderItem[]> {
  const { token, actor } = cfg();
  const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`TikTok provider error: HTTP ${res.status}`);
  }
  const data = (await res.json()) as ProviderItem[];
  return Array.isArray(data) ? data : [];
}

// --- defensive field pickers (provider schemas vary) ------------------------
const str = (o: ProviderItem, ...k: string[]): string | undefined => {
  for (const key of k) if (typeof o[key] === "string") return o[key] as string;
  return undefined;
};
const num = (o: ProviderItem, ...k: string[]): number | undefined => {
  for (const key of k) {
    const v = o[key];
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)))
      return Number(v);
  }
  return undefined;
};
/** Provider prices are usually dollars; store cents. */
const cents = (o: ProviderItem, ...k: string[]): number =>
  Math.round((num(o, ...k) ?? 0) * 100);

function mapShow(o: ProviderItem): LiveShow {
  return {
    id: str(o, "id", "roomId", "liveId", "url") ?? cryptoishId(o),
    title: str(o, "title", "roomTitle", "name") ?? "",
    status: (str(o, "status") ?? "PLAYING").toUpperCase(),
    activeViewers: num(o, "viewerCount", "viewers", "activeViewers", "audienceCount") ?? 0,
    totalWatchlistUsers: num(o, "followerCount", "watchlist") ?? 0,
    startTime: num(o, "startTime", "createTime") ?? 0,
    categories: [str(o, "category", "categoryName", "productCategory") ?? "Uncategorized"],
    seller: {
      id: str(o, "sellerId", "shopId", "authorId") ?? "",
      username: str(o, "sellerName", "shopName", "author", "username") ?? "unknown",
      numReviews: num(o, "reviewCount", "sellerReviews", "shopReviews"),
      rating: num(o, "rating", "shopRating", "sellerRating"),
      isPremierShop: Boolean(o["isVerified"] ?? o["mall"] ?? false),
    },
  };
}

function mapListing(o: ProviderItem): Listing {
  return {
    title: str(o, "title", "productName", "name") ?? "",
    subtitle: str(o, "subtitle", "brand"),
    price: { amount: cents(o, "price", "salePrice", "currentPrice"), currency: str(o, "currency") ?? "USD" },
    quantity: num(o, "stock", "quantity", "availableQuantity"),
    transactionType: "BUY_NOW",
    publicStatus: str(o, "status"),
    soldCount: num(o, "soldCount", "sales", "sold", "unitsSold"),
  };
}

/** Stable-ish fallback id when the provider omits one. */
function cryptoishId(o: ProviderItem): string {
  return "tt-" + Math.abs(hash(JSON.stringify(o))).toString(36);
}
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

export class RealTikTok implements DataSource {
  async getLiveShows(opts?: { category?: string; limit?: number }): Promise<LiveShow[]> {
    const items = await runActor({
      mode: "live",
      category: opts?.category,
      maxItems: opts?.limit ?? 30,
    });
    return items.map(mapShow).sort((a, b) => b.activeViewers - a.activeViewers);
  }

  async getShowListings(showId: string): Promise<Listing[]> {
    const items = await runActor({ mode: "listings", roomId: showId, maxItems: 50 });
    return items.map(mapListing);
  }

  async getSeller(username: string): Promise<Seller | null> {
    const shows = await this.getLiveShows({ limit: 50 });
    return shows.find((s) => s.seller.username === username)?.seller ?? null;
  }
}
