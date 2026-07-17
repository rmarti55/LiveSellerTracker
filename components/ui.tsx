import Link from "next/link";
import type { ReactNode } from "react";

/** Page title + optional muted subtitle (and optional back link). */
export function PageHeader({
  title,
  children,
  back,
}: {
  title: ReactNode;
  children?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <div>
      {back}
      <h1
        className={`font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink ${back ? "mt-1" : ""}`}
      >
        {title}
      </h1>
      {children != null && (
        <div className="mt-2 text-sm sm:text-base font-normal text-ink-muted">{children}</div>
      )}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-widest text-ink-muted">{label}</div>
      <div className="mt-1 font-display text-3xl font-bold tabular-nums text-ink">{value}</div>
      {sub != null && (
        <div className="mt-0.5 text-xs font-normal text-ink-faint">{sub}</div>
      )}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-panel overflow-hidden shadow-sm">
      <header className="flex items-center justify-between px-4 py-3 border-b border-line-soft">
        <h2 className="text-xs font-medium uppercase tracking-widest text-ink-muted">{title}</h2>
        {action}
      </header>
      <div className="p-0">{children}</div>
    </section>
  );
}

/** Horizontal magnitude bar for a value relative to a max. */
export function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="bar-track">
      <div className="bar-fill transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Human-readable duration since a show went live. */
export function formatTimeLive(startTime: number, now = Date.now()): string {
  const mins = Math.max(0, Math.floor((now - startTime) / 60_000));
  if (mins < 60) return `live ${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `live ${hrs}h ${rem}m` : `live ${hrs}h`;
}

function formatAudienceShare(viewers: number, totalViewers: number): string {
  if (totalViewers <= 0 || viewers <= 0) return "0% of live audience";
  const pct = (viewers / totalViewers) * 100;
  if (pct < 1) return "<1% of live audience";
  if (pct >= 10) return `${Math.round(pct)}% of live audience`;
  return `${pct.toFixed(1)}% of live audience`;
}

/** Live viewer count, bar, and share-of-audience label as one unit. */
export function ViewerBar({
  viewers,
  totalViewers,
  barMax,
}: {
  viewers: number;
  totalViewers: number;
  /** Top show's viewer count — scales bar width for readable comparison. */
  barMax: number;
}) {
  return (
    <div className="w-44 shrink-0 text-right">
      <div className="font-display text-base font-bold tabular-nums text-ink">
        {viewers.toLocaleString()}{" "}
        <span className="text-xs font-normal font-sans text-ink-faint">viewers</span>
      </div>
      <div className="mt-1.5">
        <Bar value={viewers} max={barMax} />
      </div>
      <div className="mt-1 text-xs font-normal text-ink-faint">
        {formatAudienceShare(viewers, totalViewers)}
      </div>
    </div>
  );
}

export function VerdictBadge({ verdict }: { verdict: "hot" | "warm" | "cold" | "unknown" }) {
  const map = {
    hot: { emoji: "🔥", label: "Selling fast", cls: "bg-red-500/15 text-red-600 dark:text-red-400" },
    warm: { emoji: "🟡", label: "Moving", cls: "bg-amber-400/20 text-amber-700 dark:text-amber-300" },
    cold: { emoji: "🐢", label: "Slow", cls: "bg-line-soft text-ink-muted" },
    unknown: { emoji: "•", label: "Live", cls: "bg-panel text-ink-faint" },
  }[verdict];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${map.cls}`}>
      {map.emoji} {map.label}
    </span>
  );
}

export function PremierBadge() {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-400/20 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
      Premier
    </span>
  );
}

/** Soft live indicator — pulse + small LIVE so titles stay primary. */
export function LiveDot() {
  return (
    <span
      className="inline-flex items-center gap-1.5 shrink-0 text-red-600 dark:text-red-400"
      role="status"
      aria-label="Live"
    >
      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
      <span className="text-[10px] font-semibold tracking-widest uppercase opacity-90">Live</span>
    </span>
  );
}

export function SellerLink({
  platform,
  username,
}: {
  platform: string;
  username: string;
}) {
  return (
    <Link
      href={`/${platform}/sellers/${encodeURIComponent(username)}`}
      className="text-sm font-medium text-ink hover:text-signal hover:underline"
    >
      {username}
    </Link>
  );
}
