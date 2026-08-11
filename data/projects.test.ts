import { describe, it, expect } from "vitest";
import {
  projects,
  featuredProjects,
  supportingProjects,
  archiveProjects,
} from "./projects";

describe("projects registry", () => {
  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("splits cleanly into the three tiers", () => {
    expect(featuredProjects.length + supportingProjects.length + archiveProjects.length).toBe(
      projects.length
    );
    expect(featuredProjects.length).toBeGreaterThanOrEqual(4);
  });

  it("every project has the fields the listing pages need", () => {
    for (const p of projects) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.oneLiner.length).toBeGreaterThan(0);
      expect(p.techStack.length).toBeGreaterThan(0);
    }
  });

  it("every featured project carries a full case study", () => {
    for (const p of featuredProjects) {
      expect(p.problem, `${p.slug} problem`).toBeTruthy();
      expect(p.contribution, `${p.slug} contribution`).toBeTruthy();
      expect(p.solution, `${p.slug} solution`).toBeTruthy();
      expect(p.outcome?.length, `${p.slug} outcome`).toBeGreaterThan(0);
    }
  });

  it("includes the core featured work", () => {
    const slugs = featuredProjects.map((p) => p.slug);
    for (const slug of ["ams", "ospa", "jewel-stone", "dims"]) {
      expect(slugs).toContain(slug);
    }
  });

  it("only marks a project live when it has a live URL", () => {
    for (const p of projects.filter((x) => x.status === "live")) {
      expect(p.liveUrl, `${p.slug} is live but has no liveUrl`).toBeTruthy();
    }
  });

  it("uses absolute https URLs for every link", () => {
    for (const p of projects) {
      if (p.liveUrl) expect(p.liveUrl.startsWith("https://")).toBe(true);
      if (p.githubUrl) expect(p.githubUrl.startsWith("https://")).toBe(true);
    }
  });
});
