// Back-compat shim — the seam wiring now lives in lib/core (getDataSource takes a
// platform arg). Prefer: import { getDataSource } from "@/lib/core".
export * from "@/lib/core";
export { StubWhatnot } from "./stub";
