import Link from "next/link";
import type { ReactNode } from "react";

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
    <div className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-black/[.02] dark:bg-white/[.03]">
      <div className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {sub != null && (
        <div className="mt-0.5 text-xs text-black/50 dark:text-white/50">{sub}</div>
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
    <section className="rounded-xl border border-black/10 dark:border-white/15 overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/15">
        <h2 className="text-sm font-semibold">{title}</h2>
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
    <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10">
      <div
        className="h-2 rounded-full bg-indigo-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function VerdictBadge({ verdict }: { verdict: "hot" | "warm" | "cold" | "unknown" }) {
  const map = {
    hot: { emoji: "🔥", label: "Selling fast", cls: "bg-red-500/15 text-red-600 dark:text-red-400" },
    warm: { emoji: "🟡", label: "Moving", cls: "bg-amber-400/20 text-amber-700 dark:text-amber-300" },
    cold: { emoji: "🐢", label: "Slow", cls: "bg-black/10 dark:bg-white/10 text-black/50 dark:text-white/50" },
    unknown: { emoji: "•", label: "Live", cls: "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40" },
  }[verdict];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${map.cls}`}>
      {map.emoji} {map.label}
    </span>
  );
}

export function PremierBadge() {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
      Premier
    </span>
  );
}

export function LiveDot() {
  return (
    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> LIVE
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
      className="font-medium hover:underline"
    >
      {username}
    </Link>
  );
}
