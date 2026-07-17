import type { DataSource } from "@/lib/core/datasource";
import type { LiveShow } from "@/lib/core/types";
import { pricePoints, type PricePoints } from "./index";

const MAX_SHOWS_PER_CATEGORY = 3;

/**
 * Median/low/high price bands per category from live show listings.
 * Bounded fan-out: top N live shows per category only.
 */
export async function categoryPriceBands(
  ds: DataSource,
  shows: LiveShow[],
): Promise<Map<string, PricePoints>> {
  const byCat = new Map<string, LiveShow[]>();
  for (const s of shows.filter((x) => x.status === "PLAYING")) {
    const cat = s.categories[0] ?? "Uncategorized";
    const list = byCat.get(cat) ?? [];
    list.push(s);
    byCat.set(cat, list);
  }

  const result = new Map<string, PricePoints>();
  await Promise.all(
    [...byCat.entries()].map(async ([cat, catShows]) => {
      const top = [...catShows]
        .sort((a, b) => b.activeViewers - a.activeViewers)
        .slice(0, MAX_SHOWS_PER_CATEGORY);
      const listings = (
        await Promise.all(top.map((s) => ds.getShowListings(s.id)))
      ).flat();
      result.set(cat, pricePoints(listings));
    }),
  );
  return result;
}
