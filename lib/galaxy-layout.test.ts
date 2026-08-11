import { describe, it, expect } from "vitest";
import { buildNodes, buildEdges, matchesQuery } from "./galaxy-layout";
import { projects } from "@/data/projects";

describe("buildNodes", () => {
  it("places every project exactly once", () => {
    const nodes = buildNodes();
    expect(nodes).toHaveLength(projects.length);
    expect(new Set(nodes.map((n) => n.project.slug)).size).toBe(projects.length);
  });

  it("is deterministic, so the map does not rearrange between visits", () => {
    const a = buildNodes().map((n) => `${n.project.slug}:${n.x.toFixed(3)},${n.y.toFixed(3)}`);
    const b = buildNodes().map((n) => `${n.project.slug}:${n.x.toFixed(3)},${n.y.toFixed(3)}`);
    expect(a).toEqual(b);
  });

  it("sizes featured work larger than archive work", () => {
    const nodes = buildNodes();
    const featured = nodes.find((n) => n.project.tier === "featured");
    const archived = nodes.find((n) => n.project.tier === "archive");
    expect(featured!.radius).toBeGreaterThan(archived!.radius);
  });

  it("keeps a category's nodes together rather than scattering them", () => {
    const nodes = buildNodes().filter((n) => n.project.category === "ai");
    const cx = nodes.reduce((sum, n) => sum + n.x, 0) / nodes.length;
    // Every AI node should sit within a sane radius of its own cluster centre.
    for (const n of nodes) {
      expect(Math.abs(n.x - cx)).toBeLessThan(400);
    }
  });

  it("gives no two projects the same position", () => {
    const seen = new Set(buildNodes().map((n) => `${n.x.toFixed(2)},${n.y.toFixed(2)}`));
    expect(seen.size).toBe(projects.length);
  });
});

describe("buildEdges", () => {
  it("only connects projects that genuinely share a technology", () => {
    const nodes = buildNodes();
    for (const edge of buildEdges(nodes)) {
      const a = nodes[edge.a].project.techStack.map((t) => t.toLowerCase());
      const b = nodes[edge.b].project.techStack.map((t) => t.toLowerCase());
      expect(a).toContain(edge.shared.toLowerCase());
      expect(b).toContain(edge.shared.toLowerCase());
    }
  });

  it("never connects a project to itself", () => {
    for (const edge of buildEdges(buildNodes())) {
      expect(edge.a).not.toBe(edge.b);
    }
  });
});

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

  it("does not match unrelated text", () => {
    expect(matchesQuery(project, "kubernetes")).toBe(false);
  });
});
