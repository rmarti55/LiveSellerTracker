import { describe, expect, it } from "vitest";
import { sectionPathForPathname } from "./section-path";

describe("sectionPathForPathname", () => {
  it("returns empty for overview", () => {
    expect(sectionPathForPathname("/whatnot", "whatnot")).toBe("");
  });

  it("returns section for top-level routes", () => {
    expect(sectionPathForPathname("/whatnot/categories", "whatnot")).toBe("/categories");
    expect(sectionPathForPathname("/whatnot/sellers", "whatnot")).toBe("/sellers");
    expect(sectionPathForPathname("/whatnot/whats-selling", "whatnot")).toBe("/whats-selling");
    expect(sectionPathForPathname("/whatnot/best-time", "whatnot")).toBe("/best-time");
  });

  it("returns parent section for nested routes", () => {
    expect(sectionPathForPathname("/whatnot/sellers/jane", "whatnot")).toBe("/sellers");
    expect(sectionPathForPathname("/whatnot/shows/abc", "whatnot")).toBe("");
  });

  it("preserves section when switching platform context", () => {
    expect(sectionPathForPathname("/tiktok/categories", "tiktok")).toBe("/categories");
  });
});
