import Link from "next/link";
import { getTrackedFeeds } from "@/lib/whatnot/feeds";
import { withCategoryParam } from "@/lib/whatnot/category-slug";

export function CategoryFilter({
  platform,
  basePath,
  activeSlug,
}: {
  platform: string;
  basePath: string;
  activeSlug?: string;
}) {
  if (platform !== "whatnot") return null;

  const feeds = getTrackedFeeds();

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={basePath}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          !activeSlug
            ? "bg-signal text-white"
            : "border border-line bg-panel text-ink-muted hover:text-ink"
        }`}
      >
        All
      </Link>
      {feeds.map((f) => (
        <Link
          key={f.slug}
          href={withCategoryParam(basePath, f.slug)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeSlug === f.slug
              ? "bg-signal text-white"
              : "border border-line bg-panel text-ink-muted hover:text-ink"
          }`}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}
