import { notFound } from "next/navigation";
import { PlatformNav } from "@/components/platform-nav";
import { isPlatform, type Platform } from "@/lib/core";

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
      <PlatformNav platform={platform} sourceLabel={sourceLabel(platform)} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 flex-1">{children}</main>
      <footer className="border-t border-line py-4 text-center text-xs text-ink-faint">
        Public market data · built for live-sellers · Times in Pacific Time
      </footer>
    </>
  );
}
