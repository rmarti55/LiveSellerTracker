// Shared, platform-agnostic domain types. Both Whatnot and TikTok data sources map
// their data into these, so metrics + UI work identically across platforms.
// Money.amount is in MINOR units (cents): amount 100 = $1.00.

export type Platform = "whatnot" | "tiktok";

export type Money = {
  amount: number; // minor units (cents)
  currency: string; // e.g. "USD"
};

export type ShowStatus = "PLAYING" | "CREATED" | "ENDED" | string;
export type TransactionType = "AUCTION" | "GIVEAWAY" | "BUY_NOW" | string;

export type Seller = {
  id: string;
  username: string;
  /** Public lifetime-sales proxy: each review ≈ a settled order. */
  numReviews?: number;
  /** Overall star rating (0–5). */
  rating?: number;
  isPremierShop?: boolean;
};

export type LiveShow = {
  id: string;
  title: string;
  status: ShowStatus; // PLAYING = live now, CREATED = scheduled
  activeViewers: number;
  totalWatchlistUsers: number;
  /** Epoch milliseconds. */
  startTime: number;
  categories: string[];
  seller: Seller;
};

export type Listing = {
  title: string;
  subtitle?: string;
  price: Money; // start/current price
  quantity?: number;
  transactionType: TransactionType;
  publicStatus?: string;
  auctionDurationSec?: number | null;
  currentBid?: Money | null;
  currentBidCount?: number | null;
  /** Units sold — the key TikTok Shop metric (Whatnot listings leave this undefined). */
  soldCount?: number;
};

/** A point-in-time capture of the live marketplace, for time-series metrics. */
export type Snapshot = {
  capturedAt: number; // epoch ms
  shows: LiveShow[];
};

export const dollars = (m: Money | null | undefined): number =>
  m ? m.amount / 100 : 0;

export const formatMoney = (m: Money | null | undefined): string =>
  m ? `$${(m.amount / 100).toFixed(2)}` : "—";
