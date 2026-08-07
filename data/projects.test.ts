import { describe, it, expect } from "vitest";
import { projects } from "./projects";

describe("projects registry", () => {
  it("has exactly four featured projects for Phase 1", () => {
    const featured = projects.filter((p) => p.tier === "featured");
    expect(featured).toHaveLength(4);
  });

  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every project has non-empty narrative fields", () => {
    for (const p of projects) {
      expect(p.oneLiner.length).toBeGreaterThan(0);
      expect(p.problem.length).toBeGreaterThan(0);
      expect(p.contribution.length).toBeGreaterThan(0);
      expect(p.solution.length).toBeGreaterThan(0);
      expect(p.techStack.length).toBeGreaterThan(0);
      expect(p.outcome.length).toBeGreaterThan(0);
    }
  });

  it("includes ams, ospa, jewel-stone, and dims", () => {
    const slugs = projects.map((p) => p.slug).sort();
    expect(slugs).toEqual(["ams", "dims", "jewel-stone", "ospa"]);
  });
});
