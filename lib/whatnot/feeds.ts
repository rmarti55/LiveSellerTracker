/** Curated Whatnot category feeds — Bri-aligned defaults, not whole-market ingest. */

export type TrackedFeed = {
  slug: string;
  tagId: number;
  label: string;
};

/** Default cherry-pick (tag IDs confirmed via live API scan 2026-07-16). */
export const TRACKED_FEEDS: readonly TrackedFeed[] = [
  { slug: "womens_fashion", tagId: 1092, label: "Women's Fashion" },
  { slug: "beauty", tagId: 946, label: "Beauty" },
  { slug: "sneakers_shoes", tagId: 956, label: "Sneakers & Shoes" },
  { slug: "bags_accessories", tagId: 1038, label: "Bags & Accessories" },
  { slug: "estate_liquidation", tagId: 1100, label: "Estate Sales & Storage Units" },
] as const;

export const PER_FEED_LIMIT = 20;

/** Build Whatnot's CATEGORY_FEED_V2 id from a LivestreamTagNode numeric id. */
export function categoryFeedId(tagId: number): string {
  const node = `LivestreamTagNode:${tagId}`;
  return `CATEGORY_FEED_V2:${Buffer.from(node, "utf8").toString("base64")}`;
}

/** Active tracked feeds — override via WHATNOT_TRACKED_FEEDS=womens_fashion,beauty,... */
export function getTrackedFeeds(): TrackedFeed[] {
  const raw = process.env.WHATNOT_TRACKED_FEEDS?.trim();
  if (!raw) return [...TRACKED_FEEDS];

  const bySlug = new Map(TRACKED_FEEDS.map((f) => [f.slug, f]));
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((slug) => bySlug.get(slug))
    .filter((f): f is TrackedFeed => f != null);
}

export function getTrackedFeedLabels(): string[] {
  return getTrackedFeeds().map((f) => f.label);
}
