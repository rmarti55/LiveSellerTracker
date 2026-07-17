import type { Platform } from "@/lib/core";

/** Top-level section path after platform (e.g. "/categories" or ""). */
export function sectionPathForPathname(pathname: string, platform: Platform): string {
  const prefix = `/${platform}`;
  if (!pathname.startsWith(prefix)) return "";
  const rest = pathname.slice(prefix.length).replace(/^\//, "");
  if (!rest) return "";
  const firstSeg = rest.split("/")[0];
  if (
    firstSeg === "whats-selling" ||
    firstSeg === "best-time" ||
    firstSeg === "sellers" ||
    firstSeg === "categories"
  ) {
    return `/${firstSeg}`;
  }
  return "";
}

export function isSectionActive(pathname: string, platform: Platform, seg: string): boolean {
  const sectionPath = sectionPathForPathname(pathname, platform);
  if (seg === "") return sectionPath === "";
  return sectionPath === `/${seg}`;
}
