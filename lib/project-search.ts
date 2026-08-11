import type { Project } from "@/data/projects";

/**
 * Case-insensitive match across the fields a visitor would actually search:
 * what it is called, what it does, what it is built with, and what problem it
 * solved. Searching only titles makes a technology filter useless.
 */
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
