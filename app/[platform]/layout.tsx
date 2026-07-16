import Link from "next/link";
import { notFound } from "next/navigation";
import { isPlatform, PLATFORMS, type Platform } from "@/lib/core";

const SECTIONS = [
  { seg: "", label: "Overview" },
  { seg: "whats-selling", label: "What's Selling" },
  { seg: "sellers", label: "Top Sellers" },
  { seg: "categories", label: "Categories" },
];

function sourceLabel(platform: Platform): string {
  const env = platform === "tiktok" ? process.env.TIKTOK_SOURCE : process.env.WHATNOT_SOURCE;
  return env === "real" ? "live data" : "sample data";
}

export default async function PlatformLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();

  return (
    <>
      <header className="border-b border-black/10 dark:border-white/15">
        <div className="mx-auto max-w-6xl px-4 flex items-center gap-6 h-14">
          <Link href={`/${platform}`} className="font-semibold tracking-tight">
            Live<span className="text-indigo-500">Intel</span>
          </Link>

          {/* Platform toggle */}
          <div className="flex items-center rounded-full border border-black/10 dark:border-white/15 p-0.5 text-sm">
            {PLATFORMS.map((p) => (
              <Link
                key={p.id}
                href={`/${p.id}`}
                className={`px-3 py-1 rounded-full transition-colors ${
                  p.id === platform
                    ? "bg-indigo-500 text-white"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>

          <nav className="hidden sm:flex items-center gap-4 text-sm">
            {SECTIONS.map((s) => (
              <Link
                key={s.seg}
                href={`/${platform}${s.seg ? `/${s.seg}` : ""}`}
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              >
                {s.label}
              </Link>
            ))}
          </nav>

          <span className="ml-auto text-xs rounded-full border border-black/10 dark:border-white/15 px-2 py-0.5 text-black/50 dark:text-white/50">
            {sourceLabel(platform)}
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 flex-1">{children}</main>
      <footer className="border-t border-black/10 dark:border-white/15 py-4 text-center text-xs text-black/40 dark:text-white/40">
        Public market data · built for live-sellers
      </footer>
    </>
  );
}
