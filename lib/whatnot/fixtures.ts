import type { LiveShow, Listing, Seller } from "@/lib/core/types";

// REAL data captured from Whatnot during the feasibility spike on 2026-07-14
// (category: trading_card_games). Provenance: spike/captures/*.json + the live
// Apollo cache. Used by StubWhatnot so the dashboard/metrics are buildable and
// testable offline, before RealWhatnot is wired. Amounts are minor units (cents).

export const FIXTURE_SHOWS: LiveShow[] = [
  { id: "a8704f15-df50-404e-bf5c-e7eb0aee490b", title: "🔥FREE PHANTASMAL ZARD & RAPID FIRE SLABS 🔥", status: "PLAYING", activeViewers: 1642, totalWatchlistUsers: 36, startTime: 1784084111092, categories: ["Pokémon Cards"], seller: { id: "1113397", username: "novatcg", isPremierShop: true, numReviews: 144437, rating: 4.9 } },
  { id: "f6bae233-570b-47da-b90a-939efb419fcf", title: "THE BEST SINGLES ON WHATNOT!!! FREE PITCH BLACK GIVEAWAYS ALL NIGHT!!!!", status: "PLAYING", activeViewers: 286, totalWatchlistUsers: 224, startTime: 1784080636690, categories: ["Pokémon Cards"], seller: { id: "51815672", username: "screenworkstcg", isPremierShop: false } },
  { id: "685f22f6-034f-4ab9-b965-a900bc390c0c", title: "Are you a collector? The rarest Zard with A-Real-One", status: "PLAYING", activeViewers: 157, totalWatchlistUsers: 87, startTime: 1784076426339, categories: ["Pokémon Cards"], seller: { id: "13424612", username: "saw_tcg", isPremierShop: false } },
  { id: "30d1891f-1bcd-4121-abe0-edfb60e63e81", title: "🐐$1 Starts RTYH Ascended Heroes w/Billy 🐐", status: "PLAYING", activeViewers: 156, totalWatchlistUsers: 29, startTime: 1784067365156, categories: ["Pokémon Cards"], seller: { id: "29949710", username: "kayspokeshop", isPremierShop: true } },
  { id: "51e8f49d-89c1-4915-887f-56d46c727c3a", title: "🍀$1 START RTYH CHAOS RISING W/SAV🍀", status: "PLAYING", activeViewers: 146, totalWatchlistUsers: 31, startTime: 1784088543085, categories: ["Pokémon Cards"], seller: { id: "908610", username: "fluffcardhouse", isPremierShop: true } },
  { id: "5c9b2e6f-f379-4374-b46b-39965e0f6ec3", title: "1000 Rapid Fire Slabs W/ J", status: "PLAYING", activeViewers: 142, totalWatchlistUsers: 47, startTime: 1784074145128, categories: ["Pokémon Cards"], seller: { id: "4467180", username: "legacy_auction_house", isPremierShop: false } },
  { id: "23bc9799-f766-42d8-9380-66b13dcb0872", title: "Rip or Ship Pop Up W/ Jason!", status: "PLAYING", activeViewers: 113, totalWatchlistUsers: 2, startTime: 1784091727567, categories: ["Pokémon Cards"], seller: { id: "408585", username: "vortexbreaks", isPremierShop: false } },
  { id: "be904dd8-ca09-472f-8dcf-300c1fb912c1", title: "AFTER HOURS SLABS w/Daniel", status: "PLAYING", activeViewers: 104, totalWatchlistUsers: 22, startTime: 1784091994550, categories: ["Pokémon Cards"], seller: { id: "705181", username: "mastersetgames", isPremierShop: false } },
  { id: "044d3a70-81c8-42f1-910c-6c68de5799db", title: "🍀TUESDAY TAG TEAM HUNT! TEAM UP, COSMIC, UNIFIED, UNBROKEN & HIDDEN FATES!🍀", status: "PLAYING", activeViewers: 101, totalWatchlistUsers: 79, startTime: 1784080893918, categories: ["Pokémon Cards"], seller: { id: "714170", username: "clovrcards", isPremierShop: true } },
  { id: "12ce36b2-d352-4fbe-80ef-eafd570b77e8", title: "$1 START EARLY PITCH BLACK RIP TILL YOU HIT", status: "PLAYING", activeViewers: 93, totalWatchlistUsers: 8, startTime: 1784090411981, categories: ["Pokémon Cards"], seller: { id: "1050351", username: "traders_shop", isPremierShop: true } },
  { id: "100ee2d8-e50d-412c-beae-e09a60c551a0", title: "BIGGEST PSA SLAB SHOW w/ AMAAN", status: "PLAYING", activeViewers: 71, totalWatchlistUsers: 2, startTime: 1784077981983, categories: ["Pokémon Cards"], seller: { id: "18548414", username: "pokeswish", isPremierShop: false } },
  { id: "c11a2449-24fe-4f9a-bee7-6a58cc42947f", title: "$1000 CASE HIT MYSTERY BAG BREAK!!!!", status: "PLAYING", activeViewers: 70, totalWatchlistUsers: 7, startTime: 1784088908609, categories: ["Pokémon Cards"], seller: { id: "23100488", username: "expeditionbreaks", isPremierShop: true } },
  { id: "2ff23f94-28f0-4b22-b7ff-547706212d7f", title: "SAPPHIRE SUDDEN DEATH AUCTIONS!!💀🐈‍⬛", status: "PLAYING", activeViewers: 69, totalWatchlistUsers: 41, startTime: 1784068313662, categories: ["VeeFriends"], seller: { id: "6258293", username: "wethehobby_galaxy", isPremierShop: false } },
  // Scheduled (not yet live)
  { id: "8c10099e-a4e4-47e4-bb85-a89c5e5fec23", title: "🇯🇵 Live in Our Store", status: "CREATED", activeViewers: 0, totalWatchlistUsers: 16, startTime: 1784095200000, categories: ["Pokémon Cards"], seller: { id: "32064901", username: "sunlinkbyamtaf", isPremierShop: false } },
  { id: "916d61d8-c7e6-4393-aafc-05bea7a8f8b2", title: "🇯🇵 Japan Trading Card Auction 🇯🇵", status: "CREATED", activeViewers: 0, totalWatchlistUsers: 14, startTime: 1784098800000, categories: ["Pokémon Cards"], seller: { id: "62685225", username: "tcgcardjp", isPremierShop: false } },
  { id: "ff0223b2-623b-47fc-9aab-4f31036bdb29", title: "🇯🇵 Squirtle 007/018 McDonald's Promo / Many Singles 🇯🇵", status: "CREATED", activeViewers: 0, totalWatchlistUsers: 51, startTime: 1784109600000, categories: ["Pokémon Cards"], seller: { id: "55879194", username: "supertcgjapan", isPremierShop: false } },
  { id: "8955c1b2-3808-4848-8d1a-a4b33f2c84e2", title: "🇯🇵 OP day ?!", status: "CREATED", activeViewers: 0, totalWatchlistUsers: 84, startTime: 1784111400000, categories: ["One Piece Cards"], seller: { id: "57063537", username: "japan_hobby_tcg", isPremierShop: false } },
];

// Listings captured from novatcg's live show (show id a8704f15…).
export const FIXTURE_LISTINGS: Record<string, Listing[]> = {
  "a8704f15-df50-404e-bf5c-e7eb0aee490b": [
    { title: "HIGH END!", subtitle: "Near Mint", price: { amount: 100, currency: "USD" }, quantity: 728, transactionType: "AUCTION", publicStatus: "ACTIVE", auctionDurationSec: 30, currentBid: { amount: 1200, currency: "USD" }, currentBidCount: 7 },
    { title: "SLABS!", subtitle: "Graded · Card", price: { amount: 2300, currency: "USD" }, quantity: 314, transactionType: "AUCTION", publicStatus: "ACTIVE", currentBid: { amount: 4100, currency: "USD" }, currentBidCount: 12 },
    { title: "FREE MASSIVE GIVVY !", subtitle: "New", price: { amount: 0, currency: "USD" }, transactionType: "GIVEAWAY", publicStatus: "ACTIVE" },
  ],
};

export const FIXTURE_SELLERS: Record<string, Seller> = Object.fromEntries(
  FIXTURE_SHOWS.map((s) => [s.seller.username, s.seller]),
);
