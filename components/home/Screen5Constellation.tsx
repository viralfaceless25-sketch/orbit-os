import { projects } from "@/data/projects";
import { Section } from "./Section";
import { RevealStagger } from "@/components/fx/Reveal";

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
    <Section
      id="projects"
      index="01"
      eyebrow="Selected work"
      title="What these systems solved"
    >

      <RevealStagger className="grid gap-4 sm:grid-cols-2">
        {featured.map((p) => (
          <a
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="hud group flex h-full flex-col gap-4 border border-line bg-graphite/60 p-6 outline-none backdrop-blur-sm transition-colors hover:border-line-bright hover:bg-panel/80"
          >
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="led h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: ACCENT[p.category], color: ACCENT[p.category] }}
              />
              <span className="font-mono text-label uppercase text-ink-faint">
                {CATEGORY_LABEL[p.category] ?? p.category}
              </span>
            </div>

            <h3 className="font-display text-xl font-medium">{p.title}</h3>

            {/* The problem is what a client recognises. Lead with it, not the stack. */}
            <p className="text-sm leading-relaxed text-ink-dim">{p.problem}</p>

            <div className="mt-auto flex items-baseline gap-3 pt-2">
              <span className="shrink-0 font-mono text-label uppercase text-ink-faint">
                Result
              </span>
              <span className="text-sm leading-relaxed text-ink">{p.outcome[0]}</span>
            </div>

            {/* Stack readout. The technical fingerprint of the system */}
            <ul className="flex flex-wrap gap-x-3 gap-y-1 border-t border-line pt-4">
              {p.techStack.slice(0, 4).map((t) => (
                <li key={t} className="font-mono text-label uppercase text-ink-faint">
                  {t}
                </li>
              ))}
              {p.techStack.length > 4 && (
                <li className="font-mono text-label uppercase text-ink-faint">
                  +{p.techStack.length - 4}
                </li>
              )}
            </ul>

            <span className="font-mono text-label uppercase text-ink-dim transition-colors group-hover:text-ink">
              Read the case →
            </span>
          </a>
        ))}
      </RevealStagger>
    </Section>
  );
}
