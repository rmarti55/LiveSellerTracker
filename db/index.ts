import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/**
 * Supabase / serverless Postgres via postgres.js. Uses prepare: false for
 * PgBouncer transaction-mode poolers (Supabase POSTGRES_URL). DB access is
 * confined to the collector route; the dashboard reads through the DataSource
 * seam and needs no DB.
 */
export function getDb() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — required for the collector. See .env.example.",
    );
  }
  const client = postgres(url, {
    prepare: false,
    max: 1,
    ssl: "require",
  });
  return drizzle(client, { schema });
}

export { schema };
