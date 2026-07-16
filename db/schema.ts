import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * One row per live show, per collection run. Snapshotting repeatedly over time is
 * what makes the time-series metrics (sales velocity, trends, best-time) possible.
 * The collector (app/api/cron/collect) inserts a batch each time it runs.
 */
export const showSnapshots = pgTable(
  "show_snapshots",
  {
    id: serial("id").primaryKey(),
    capturedAt: timestamp("captured_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    platform: text("platform").notNull().default("whatnot"),
    showId: text("show_id").notNull(),
    title: text("title"),
    status: text("status"),
    activeViewers: integer("active_viewers").notNull().default(0),
    watchlist: integer("watchlist").notNull().default(0),
    startTime: bigint("start_time", { mode: "number" }),
    category: text("category"),
    sellerUsername: text("seller_username"),
    sellerNumReviews: integer("seller_num_reviews"),
    isPremier: boolean("is_premier").default(false),
  },
  (t) => [
    index("captured_idx").on(t.capturedAt),
    index("seller_idx").on(t.sellerUsername),
    index("show_idx").on(t.showId),
    index("platform_idx").on(t.platform),
  ],
);

export type ShowSnapshotRow = typeof showSnapshots.$inferSelect;
export type NewShowSnapshot = typeof showSnapshots.$inferInsert;
