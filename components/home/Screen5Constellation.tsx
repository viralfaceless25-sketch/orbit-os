import { projects } from "@/data/projects";
import { SectionHeader } from "./SectionHeader";

const ACCENT: Record<string, string> = {
  ai: "var(--color-accent-ai)",
  web: "var(--color-accent-web)",
  prototype: "var(--color-accent-exp)",
  "open-source": "var(--color-accent-oss)",
};

const CATEGORY_LABEL: Record<string, string> = {
  ai: "AI system",
  web: "Client work",
  prototype: "Product prototype",
  "open-source": "Open source",
};

export function Screen5Constellation() {
  const featured = projects.filter((p) => p.tier === "featured");

  return (
    <section id="projects" className="scroll-mt-20 py-20">
      <SectionHeader index="01" eyebrow="Selected work" title="What these systems solved" />

      <div className="grid gap-px bg-line sm:grid-cols-2">
        {featured.map((p) => (
          <a
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="group flex flex-col gap-4 bg-graphite p-6 outline-none transition-colors hover:bg-panel"
          >
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: ACCENT[p.category] }}
              />
              <span className="font-mono text-label uppercase text-ink-faint">
                {CATEGORY_LABEL[p.category] ?? p.category}
              </span>
            </div>

            <h3 className="font-display text-xl font-medium">{p.title}</h3>

            {/* The problem is what a client recognises — lead with it, not the stack. */}
            <p className="text-sm leading-relaxed text-ink-dim">{p.problem}</p>

            <div className="mt-auto flex items-baseline gap-3 pt-2">
              <span className="shrink-0 font-mono text-label uppercase text-ink-faint">
                Result
              </span>
              <span className="text-sm leading-relaxed text-ink">{p.outcome[0]}</span>
            </div>

            <span className="font-mono text-label uppercase text-ink-faint transition-colors group-hover:text-ink">
              Read the case →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
