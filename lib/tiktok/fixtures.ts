import type { LiveShow, Listing, Seller } from "@/lib/core/types";

// Representative TikTok Shop sample data for the stub. NOTE: unlike the Whatnot
// fixtures (which are real captures), TikTok has no free anonymous API — live data
// requires a paid scraper provider (see lib/tiktok/real.ts). These are illustrative
// but realistic (categories/price/sold-count shapes match TikTok Shop live selling).
// Money.amount is minor units (cents); soldCount is the headline TikTok metric.

export const FIXTURE_SHOWS: LiveShow[] = [
  { id: "tt-1001", title: "🔥 MEGA GLOW SALE — Serums up to 70% OFF! Restock LIVE", status: "PLAYING", activeViewers: 8420, totalWatchlistUsers: 1203, startTime: 1784080000000, categories: ["Beauty & Personal Care"], seller: { id: "tt-glow", username: "glowbeautyco", isPremierShop: true, numReviews: 412903, rating: 4.9 } },
  { id: "tt-1002", title: "OUTFIT DROPS EVERY 2 MIN 👗 $9.99 STEALS", status: "PLAYING", activeViewers: 6110, totalWatchlistUsers: 940, startTime: 1784083000000, categories: ["Womenswear & Underwear"], seller: { id: "tt-thread", username: "trendythreadslive", isPremierShop: true, numReviews: 288471, rating: 4.8 } },
  { id: "tt-1003", title: "GADGET GIVEAWAYS + $1 FLASH DEALS ⚡", status: "PLAYING", activeViewers: 5230, totalWatchlistUsers: 1502, startTime: 1784081500000, categories: ["Phones & Electronics"], seller: { id: "tt-gad", username: "gadgetgurulive", isPremierShop: false, numReviews: 97210, rating: 4.7 } },
  { id: "tt-1004", title: "KITCHEN RESTOCK 🍳 Viral pans back in stock!", status: "PLAYING", activeViewers: 3980, totalWatchlistUsers: 610, startTime: 1784082200000, categories: ["Home Supplies"], seller: { id: "tt-kit", username: "kitchenwareking", isPremierShop: true, numReviews: 154880, rating: 4.9 } },
  { id: "tt-1005", title: "SKINCARE SCIENCE 🧪 Dermatologist picks LIVE", status: "PLAYING", activeViewers: 3110, totalWatchlistUsers: 425, startTime: 1784084500000, categories: ["Beauty & Personal Care"], seller: { id: "tt-skin", username: "skincarescience", isPremierShop: true, numReviews: 201559, rating: 4.9 } },
  { id: "tt-1006", title: "SNEAKER VAULT 👟 Grails & steals every drop", status: "PLAYING", activeViewers: 2740, totalWatchlistUsers: 880, startTime: 1784083800000, categories: ["Shoes"], seller: { id: "tt-snk", username: "sneakervaultlive", isPremierShop: false, numReviews: 63340, rating: 4.6 } },
  { id: "tt-1007", title: "HOME HACKS 🏠 Organize your life for $5", status: "PLAYING", activeViewers: 2020, totalWatchlistUsers: 300, startTime: 1784085000000, categories: ["Home Supplies"], seller: { id: "tt-home", username: "homehacksdaily", isPremierShop: false, numReviews: 44112, rating: 4.7 } },
  { id: "tt-1008", title: "JEWELRY GLOW UP ✨ 925 silver blowout", status: "PLAYING", activeViewers: 1560, totalWatchlistUsers: 210, startTime: 1784084800000, categories: ["Fashion Accessories"], seller: { id: "tt-jew", username: "shinejewelrylive", isPremierShop: false, numReviews: 51899, rating: 4.8 } },
  { id: "tt-1009", title: "SUPPLEMENT STACK 💪 Bundle deals dropping", status: "PLAYING", activeViewers: 980, totalWatchlistUsers: 140, startTime: 1784085300000, categories: ["Health"], seller: { id: "tt-sup", username: "fuelsupplements", isPremierShop: false, numReviews: 30277, rating: 4.6 } },
  // Scheduled / upcoming
  { id: "tt-2001", title: "🌙 MIDNIGHT BEAUTY RESTOCK — set a reminder!", status: "CREATED", activeViewers: 0, totalWatchlistUsers: 2044, startTime: 1784108400000, categories: ["Beauty & Personal Care"], seller: { id: "tt-glow", username: "glowbeautyco", isPremierShop: true, numReviews: 412903, rating: 4.9 } },
  { id: "tt-2002", title: "FALL FASHION PREVIEW 🍂 New arrivals first look", status: "CREATED", activeViewers: 0, totalWatchlistUsers: 760, startTime: 1784112000000, categories: ["Womenswear & Underwear"], seller: { id: "tt-thread", username: "trendythreadslive", isPremierShop: true, numReviews: 288471, rating: 4.8 } },
];

// Listings captured-style for the top show (glowbeautyco). soldCount is the metric
// TikTok surfaces most prominently; price is the current live price.
export const FIXTURE_LISTINGS: Record<string, Listing[]> = {
  "tt-1001": [
    { title: "Vitamin C Brightening Serum 30ml", subtitle: "Best seller", price: { amount: 1499, currency: "USD" }, quantity: 5000, transactionType: "BUY_NOW", publicStatus: "ACTIVE", soldCount: 18420 },
    { title: "Hydrating Hyaluronic Acid Toner", subtitle: "Restock", price: { amount: 1299, currency: "USD" }, quantity: 3200, transactionType: "BUY_NOW", publicStatus: "ACTIVE", soldCount: 9755 },
    { title: "Retinol Night Cream Bundle (2-pack)", subtitle: "Bundle", price: { amount: 2999, currency: "USD" }, quantity: 1500, transactionType: "BUY_NOW", publicStatus: "ACTIVE", soldCount: 6210 },
    { title: "FREE Mini Lip Mask w/ any order", subtitle: "Gift", price: { amount: 0, currency: "USD" }, transactionType: "GIVEAWAY", publicStatus: "ACTIVE", soldCount: 0 },
  ],
};

export const FIXTURE_SELLERS: Record<string, Seller> = Object.fromEntries(
  FIXTURE_SHOWS.map((s) => [s.seller.username, s.seller]),
);
