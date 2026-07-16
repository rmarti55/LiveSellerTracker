import type { DataSource } from "./datasource";
import type { Platform } from "./types";

export * from "./types";
export type { DataSource } from "./datasource";

/** Platform metadata for nav/routing. */
export const PLATFORMS: {
  id: Platform;
  label: string;
  /** How this platform models a "show" — used for copy. */
  noun: string;
}[] = [
  { id: "whatnot", label: "Whatnot", noun: "live show" },
  { id: "tiktok", label: "TikTok", noun: "live shop" },
];

export function isPlatform(x: string): x is Platform {
  return x === "whatnot" || x === "tiktok";
}

/**
 * Single wiring point for the data seam. Each platform picks stub vs real via its
 * own env flag (WHATNOT_SOURCE / TIKTOK_SOURCE). Real clients are dynamically
 * imported so the stub path pulls in zero network/provider code.
 */
export async function getDataSource(platform: Platform): Promise<DataSource> {
  switch (platform) {
    case "tiktok": {
      if (process.env.TIKTOK_SOURCE === "real") {
        const { RealTikTok } = await import("@/lib/tiktok/real");
        return new RealTikTok();
      }
      const { StubTikTok } = await import("@/lib/tiktok/stub");
      return new StubTikTok();
    }
    case "whatnot":
    default: {
      if (process.env.WHATNOT_SOURCE === "real") {
        const { RealWhatnot } = await import("@/lib/whatnot/real");
        return new RealWhatnot();
      }
      const { StubWhatnot } = await import("@/lib/whatnot/stub");
      return new StubWhatnot();
    }
  }
}
