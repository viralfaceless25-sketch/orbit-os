import { describe, it, expect } from "vitest";
import { matchesQuery } from "./project-search";
import { projects } from "@/data/projects";

describe("matchesQuery", () => {
  const project = projects.find((p) => p.slug === "jewel-stone")!;

  it("returns everything for an empty query", () => {
    expect(matchesQuery(project, "   ")).toBe(true);
  });

  it("matches on title regardless of case", () => {
    expect(matchesQuery(project, "JEWEL")).toBe(true);
  });

  it("matches on a technology in the stack", () => {
    expect(matchesQuery(project, "stripe")).toBe(true);
  });

  it("matches on the problem text, so searching a domain works", () => {
    const dims = projects.find((p) => p.slug === "dims")!;
    expect(matchesQuery(dims, "chicago")).toBe(true);
  });

  it("does not match unrelated text", () => {
    expect(matchesQuery(project, "kubernetes")).toBe(false);
  });
});
