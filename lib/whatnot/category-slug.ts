import { getTrackedFeeds, type TrackedFeed } from "./feeds";

/** Resolve a feed slug from a show's primary category label, if tracked. */
export function slugForCategoryLabel(label: string): string | null {
  const feed = getTrackedFeeds().find((f) => f.label === label);
  return feed?.slug ?? null;
}

/** Find a tracked feed by slug (used in ?category= query params). */
export function feedBySlug(slug: string | undefined): TrackedFeed | null {
  if (!slug) return null;
  return getTrackedFeeds().find((f) => f.slug === slug) ?? null;
}

/** Build a page href preserving an optional category filter. */
export function withCategoryParam(
  basePath: string,
  categorySlug: string | undefined,
): string {
  if (!categorySlug) return basePath;
  const sep = basePath.includes("?") ? "&" : "?";
  return `${basePath}${sep}category=${encodeURIComponent(categorySlug)}`;
}
