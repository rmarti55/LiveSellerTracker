"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLATFORMS, type Platform } from "@/lib/core";
import { isSectionActive, sectionPathForPathname } from "@/lib/navigation/section-path";

export const SECTIONS = [
  { seg: "", label: "Overview" },
  { seg: "whats-selling", label: "What's Selling" },
  { seg: "sellers", label: "Top Sellers" },
  { seg: "categories", label: "Categories" },
] as const;

export function PlatformNav({
  platform,
  sourceLabel,
}: {
  platform: Platform;
  sourceLabel: string;
}) {
  const pathname = usePathname();
  const sectionPath = sectionPathForPathname(pathname, platform);

  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-4 sm:gap-6 h-14">
          <Link href={`/${platform}`} className="font-semibold tracking-tight shrink-0">
            Live<span className="text-indigo-500">Intel</span>
          </Link>

          <div className="flex items-center rounded-full border border-black/10 dark:border-white/15 p-0.5 text-sm shrink-0">
            {PLATFORMS.map((p) => (
              <Link
                key={p.id}
                href={`/${p.id}${sectionPath}`}
                className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap ${
                  p.id === platform
                    ? "bg-indigo-500 text-white"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>

          <span className="ml-auto text-xs rounded-full border border-black/10 dark:border-white/15 px-2 py-0.5 text-black/50 dark:text-white/50 shrink-0">
            {sourceLabel}
          </span>
        </div>

        <nav
          className="-mx-4 px-4 flex items-center gap-1 overflow-x-auto pb-3 scrollbar-none"
          aria-label="Section navigation"
        >
          {SECTIONS.map((s) => {
            const active = isSectionActive(pathname, platform, s.seg);
            const href = `/${platform}${s.seg ? `/${s.seg}` : ""}`;
            return (
              <Link
                key={s.seg || "overview"}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
