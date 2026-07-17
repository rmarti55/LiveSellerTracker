import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

export type HistoryDb = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Optional Postgres for history reads. Returns null when DATABASE_URL is unset
 * so the dashboard falls back to live snapshots without throwing.
 */
export function getHistoryDb(): HistoryDb | null {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) return null;

  const client = postgres(url, {
    prepare: false,
    max: 1,
    ssl: url.includes("localhost") ? false : "require",
  });
  return drizzle(client, { schema });
}
