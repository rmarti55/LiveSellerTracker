"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TRACK_USERNAME_KEY } from "./track-my-shop";
import type { SellerVelocityTrend } from "@/lib/history/metrics";

export function MyShopProgressLink({ platform }: { platform: string }) {
  const [line, setLine] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(TRACK_USERNAME_KEY);
    if (!stored) return;
    setUsername(stored);

    fetch(
      `/api/history/seller/${encodeURIComponent(stored)}?platform=${platform}`,
    )
      .then((r) => r.json())
      .then((data: { available?: boolean; trend?: SellerVelocityTrend }) => {
        if (!data.available || !data.trend) {
          setLine(`Tracking @${stored} — history building`);
          return;
        }
        const { deltaReviews, direction } = data.trend;
        const sign = deltaReviews >= 0 ? "+" : "";
        const mood =
          direction === "up"
            ? "You're growing"
            : direction === "down"
              ? "Trending down"
              : "Holding steady";
        setLine(`${mood}: ${sign}${deltaReviews.toLocaleString()} reviews this week`);
      })
      .catch(() => setLine(null));
  }, [platform]);

  if (!username || !line) return null;

  return (
    <p className="text-sm text-ink-muted">
      <Link
        href={`/${platform}/sellers/${encodeURIComponent(username)}`}
        className="font-semibold text-signal hover:underline"
      >
        {line} →
      </Link>
    </p>
  );
}

export function YourProgressBadge({
  sellerUsername,
}: {
  sellerUsername: string;
}) {
  const [isYou, setIsYou] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(TRACK_USERNAME_KEY);
    setIsYou(stored?.toLowerCase() === sellerUsername.toLowerCase());
  }, [sellerUsername]);

  if (!isYou) return null;

  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-teal-600/15 px-2 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-300">
      Your shop
    </span>
  );
}
