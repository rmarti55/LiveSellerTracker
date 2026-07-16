import Link from "next/link";
import { notFound } from "next/navigation";
import { getDataSource, isPlatform } from "@/lib/core";
import { bestTimeToGoLive, categoryDemand, topSellers } from "@/lib/metrics";
import { Bar, Card, LiveDot, PremierBadge, SellerLink, StatTile } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Overview({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  if (!isPlatform(platform)) notFound();

  const ds = await getDataSource(platform);
  const shows = await ds.getLiveShows();

  const live = shows
    .filter((s) => s.status === "PLAYING")
    .sort((a, b) => b.activeViewers - a.activeViewers);
  const totalViewers = live.reduce((s, x) => s + x.activeViewers, 0);
  const sellers = topSellers(shows);
  const demand = categoryDemand(shows);
  const hours = bestTimeToGoLive(shows);
  const peakHour = [...hours].sort((a, b) => b.totalViewers - a.totalViewers)[0];
  const maxViewers = Math.max(1, ...live.map((s) => s.activeViewers));
  const maxHour = Math.max(1, ...hours.map((h) => h.totalViewers));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Market Overview</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Live {platform === "tiktok" ? "TikTok Shop" : "Whatnot"} shopping activity, right now.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Shows live now" value={live.length} />
        <StatTile label="Concurrent viewers" value={totalViewers.toLocaleString()} />
        <StatTile label="Active categories" value={demand.filter((d) => d.liveShows > 0).length} />
        <StatTile
          label="Peak hour (UTC)"
          value={`${String(peakHour.hour).padStart(2, "0")}:00`}
          sub={`${peakHour.totalViewers.toLocaleString()} viewers`}
        />
      </div>

      <Card
        title="Live now — by concurrent viewers"
        action={<span className="text-xs text-black/40 dark:text-white/40">{live.length} shows</span>}
      >
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {live.map((s) => (
            <li key={s.id} className="px-4 py-3 flex items-center gap-3">
              <div className="w-28 shrink-0 text-sm tabular-nums flex items-center gap-2">
                <LiveDot />
                <span>{s.activeViewers.toLocaleString()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/${platform}/shows/${s.id}`} className="text-sm font-medium hover:underline line-clamp-1">
                  {s.title}
                </Link>
                <div className="text-xs text-black/50 dark:text-white/50">
                  <SellerLink platform={platform} username={s.seller.username} />
                  {s.seller.isPremierShop && <PremierBadge />}
                  {" · "}
                  {s.categories.join(", ")}
                </div>
              </div>
              <div className="w-40 shrink-0">
                <Bar value={s.activeViewers} max={maxViewers} />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Category demand" action={<Link href={`/${platform}/categories`} className="text-xs text-indigo-500 hover:underline">all</Link>}>
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {demand.slice(0, 6).map((d) => (
              <li key={d.category} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                <span className="flex-1 truncate">{d.category}</span>
                <span className="tabular-nums text-black/60 dark:text-white/60">
                  {d.totalViewers.toLocaleString()}
                </span>
                <span className="w-24">
                  <Bar value={d.totalViewers} max={demand[0].totalViewers} />
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Best time to go live (UTC hour)">
          <div className="p-4">
            <div className="flex items-end gap-1 h-32">
              {hours.map((h) => (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1" title={`${h.hour}:00 — ${h.totalViewers} viewers`}>
                  <div
                    className="w-full rounded-t bg-indigo-500/80"
                    style={{ height: `${Math.round((h.totalViewers / maxHour) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-black/40 dark:text-white/40">
              <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
            </div>
            <p className="mt-3 text-xs text-black/60 dark:text-white/60">
              👉 Busiest window is <b>{String(peakHour.hour).padStart(2, "0")}:00 UTC</b> — go live
              around then to catch the most buyers.
            </p>
          </div>
        </Card>
      </div>

      <Card title="Top sellers live" action={<Link href={`/${platform}/sellers`} className="text-xs text-indigo-500 hover:underline">all</Link>}>
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {sellers.slice(0, 6).map((s, i) => (
            <li key={s.username} className="px-4 py-2.5 flex items-center gap-3 text-sm">
              <span className="w-5 text-black/40 dark:text-white/40 tabular-nums">{i + 1}</span>
              <span className="flex-1 truncate">
                <SellerLink platform={platform} username={s.username} />
                {s.isPremierShop && <PremierBadge />}
              </span>
              {s.numReviews != null && (
                <span className="text-xs text-black/40 dark:text-white/40 tabular-nums">
                  {s.numReviews.toLocaleString()} reviews
                </span>
              )}
              <span className="tabular-nums text-black/60 dark:text-white/60 w-16 text-right">
                {s.totalViewers.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
