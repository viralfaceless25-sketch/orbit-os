export interface PaletteCommand {
  id: string;
  label: string;
  href: string;
}

export const paletteCommands: PaletteCommand[] = [
  { id: "search-projects", label: "Search projects", href: "/projects" },
  { id: "view-ai", label: "View AI systems", href: "/projects" },
  { id: "client-work", label: "See client work", href: "/projects" },
  { id: "about", label: "Read about me", href: "/readme" },
  { id: "start-project", label: "Start a project", href: "/start-a-project" },
  { id: "github", label: "Open GitHub", href: "https://github.com/viralfaceless25-sketch" },
];

export function filterCommands(
  query: string,
  commands: PaletteCommand[] = paletteCommands
): PaletteCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return commands;
  return commands.filter((c) => c.label.toLowerCase().includes(q));
}
