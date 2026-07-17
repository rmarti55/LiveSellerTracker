import type { DataSource } from "@/lib/core/datasource";
import type { WhatnotLiveShowsScope } from "./real";

/** Read scope metadata after a RealWhatnot fetch (null for stub / TikTok). */
export function getWhatnotScope(ds: DataSource): WhatnotLiveShowsScope | null {
  if ("lastScope" in ds && ds.lastScope) {
    return ds.lastScope as WhatnotLiveShowsScope;
  }
  return null;
}
