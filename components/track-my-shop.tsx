"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "liveintel:username";

export function TrackMyShop({ platform }: { platform: string }) {
  const [saved, setSaved] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSaved(stored);
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim().replace(/^@/, "");
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setSaved(trimmed);
    setDraft("");
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);
    setSaved(null);
  }

  if (platform !== "whatnot") return null;

  if (saved) {
    return (
      <div className="rounded-xl border border-line bg-panel px-4 py-3 text-sm">
        <span className="text-ink-muted">Tracking </span>
        <Link
          href={`/${platform}/sellers/${encodeURIComponent(saved)}`}
          className="font-semibold text-signal hover:underline"
        >
          @{saved}
        </Link>
        <button
          type="button"
          onClick={handleClear}
          className="ml-3 text-xs text-ink-faint hover:text-ink"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-xl border border-line bg-panel px-4 py-3 flex flex-wrap items-center gap-2"
    >
      <label htmlFor="track-username" className="text-sm text-ink-muted shrink-0">
        Track my shop
      </label>
      <input
        id="track-username"
        type="text"
        placeholder="Whatnot username"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="flex-1 min-w-[140px] rounded-lg border border-line-soft bg-canvas px-3 py-1.5 text-sm"
      />
      <button
        type="submit"
        className="rounded-lg bg-signal px-3 py-1.5 text-xs font-medium text-white"
      >
        Save
      </button>
    </form>
  );
}

export function getStoredUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export { STORAGE_KEY as TRACK_USERNAME_KEY };
