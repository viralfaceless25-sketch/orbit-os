import { projects, type Project, type ProjectCategory } from "@/data/projects";

/*
  Layout maths for the Project Galaxy, kept out of the canvas component so it
  can be reasoned about and tested without a browser.

  Positions are deterministic: projects sit in fixed constellations by category,
  and each node's place within its cluster is derived from its index rather than
  from randomness. A galaxy that rearranges itself on every visit would stop
  being a map of the work and become decoration.
*/

export interface GalaxyNode {
  project: Project;
  /** Layout-space coordinates, independent of canvas size or zoom. */
  x: number;
  y: number;
  radius: number;
  color: string;
}

export interface GalaxyEdge {
  a: number;
  b: number;
  /** What the two projects have in common, shown when a node is selected. */
  shared: string;
}

const ACCENT: Record<ProjectCategory, string> = {
  ai: "#7c5cff",
  web: "#3fd0e0",
  prototype: "#ff7a5c",
  "open-source": "#4fd07a",
};

/*
  Constellation centres are assigned to the categories that actually have work
  in them, in this order. Reserving a fixed quadrant for an empty category
  leaves a conspicuous hole in the map and crowds everything else.
*/
const CLUSTER_SLOTS = [
  { x: -250, y: -130 },
  { x: 255, y: -120 },
  { x: -215, y: 175 },
  { x: 250, y: 190 },
];

const CATEGORY_ORDER: ProjectCategory[] = ["ai", "web", "prototype", "open-source"];

function assignCentres(present: Set<ProjectCategory>) {
  const centres = new Map<ProjectCategory, { x: number; y: number }>();
  let slot = 0;
  for (const category of CATEGORY_ORDER) {
    if (!present.has(category)) continue;
    centres.set(category, CLUSTER_SLOTS[slot % CLUSTER_SLOTS.length]);
    slot++;
  }
  return centres;
}

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  ai: "AI systems",
  web: "Client work",
  prototype: "Prototypes",
  "open-source": "Open source",
};

/** Node size carries tier: the strongest work reads as the brightest star. */
function radiusFor(project: Project): number {
  if (project.tier === "featured") return 13;
  if (project.tier === "supporting") return 9;
  return 6;
}

export function buildNodes(list: Project[] = projects): GalaxyNode[] {
  const byCategory = new Map<ProjectCategory, Project[]>();
  for (const p of list) {
    const group = byCategory.get(p.category) ?? [];
    group.push(p);
    byCategory.set(p.category, group);
  }

  const nodes: GalaxyNode[] = [];
  const centres = assignCentres(new Set(byCategory.keys()));

  byCategory.forEach((group, category) => {
    const centre = centres.get(category) ?? CLUSTER_SLOTS[0];
    // Featured first so the important nodes sit nearest the cluster centre.
    const ordered = [...group].sort((a, b) => radiusFor(b) - radiusFor(a));

    ordered.forEach((project, i) => {
      if (i === 0) {
        nodes.push({ project, x: centre.x, y: centre.y, radius: radiusFor(project), color: ACCENT[category] });
        return;
      }
      // Ring placement: each successive node steps out along a spiral so
      // clusters stay readable as they grow.
      const angle = i * 2.399; // golden angle, avoids spokes lining up
      const distance = 58 + i * 20;
      nodes.push({
        project,
        x: centre.x + Math.cos(angle) * distance,
        y: centre.y + Math.sin(angle) * distance * 0.78,
        radius: radiusFor(project),
        color: ACCENT[category],
      });
    });
  });

  return nodes;
}

/**
 * Connects projects that share a technology. These are the lines revealed when
 * a node is selected, so the visitor can see how the work relates rather than
 * reading a flat list.
 */
export function buildEdges(nodes: GalaxyNode[]): GalaxyEdge[] {
  const edges: GalaxyEdge[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i].project.techStack;
      const b = new Set(nodes[j].project.techStack.map((t) => t.toLowerCase()));
      const shared = a.find((t) => b.has(t.toLowerCase()));
      if (shared) edges.push({ a: i, b: j, shared });
    }
  }

  return edges;
}

/** Case-insensitive match across the fields a visitor would actually search. */
export function matchesQuery(project: Project, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    project.title.toLowerCase().includes(q) ||
    project.oneLiner.toLowerCase().includes(q) ||
    project.category.toLowerCase().includes(q) ||
    project.techStack.some((t) => t.toLowerCase().includes(q)) ||
    (project.problem?.toLowerCase().includes(q) ?? false)
  );
}
