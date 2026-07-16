import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Serverless Postgres (Neon / Vercel Postgres) over HTTP — works in Vercel
 * functions and locally. DB access is confined to the collector route; the
 * dashboard reads through the DataSource seam and needs no DB, so the app runs
 * fine without DATABASE_URL set (only the collector requires it).
 */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — required for the collector. See .env.example.",
    );
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export { schema };
