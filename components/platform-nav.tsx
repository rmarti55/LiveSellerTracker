"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLATFORMS, type Platform } from "@/lib/core";
import { isSectionActive, sectionPathForPathname } from "@/lib/navigation/section-path";

export const SECTIONS = [
  { seg: "", label: "Overview" },
  { seg: "whats-selling", label: "What's Selling" },
  { seg: "best-time", label: "Best Time" },
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
    <header className="relative border-b border-line bg-panel/90 backdrop-blur-sm">
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% 0%, color-mix(in srgb, var(--color-signal) 18%, transparent), transparent)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-4 sm:gap-6 h-14">
          <Link
            href={`/${platform}`}
            className="font-display text-xl font-bold tracking-tight shrink-0 text-ink"
          >
            Live<span className="text-teal-700">Intel</span>
          </Link>

          <div className="flex items-center rounded-md border border-line bg-background p-0.5 text-sm shrink-0 shadow-sm">
            {PLATFORMS.map((p) => (
              <Link
                key={p.id}
                href={`/${p.id}${sectionPath}`}
                className={`px-3 py-1.5 rounded-[5px] transition-all duration-200 whitespace-nowrap font-medium ${
                  p.id === platform
                    ? "platform-active shadow-sm"
                    : "text-ink hover:text-ink"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>

          <span className="ml-auto text-[11px] uppercase tracking-wide rounded-md border border-line-soft px-2 py-1 text-ink-faint shrink-0">
            {sourceLabel}
          </span>
        </div>

        <nav
          className="-mx-4 px-4 flex items-center gap-5 sm:gap-8 overflow-x-auto border-t border-line-soft scrollbar-none"
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
                className={`shrink-0 py-3 text-sm transition-colors duration-200 whitespace-nowrap border-b-2 -mb-px ${
                  active
                    ? "border-teal-700 text-ink font-semibold"
                    : "border-transparent text-ink-muted hover:text-ink font-medium"
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
