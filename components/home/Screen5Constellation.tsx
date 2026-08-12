import Link from "next/link";
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

/* Two columns on a phone leave no room for "Product prototype" to fit unclipped. */
const CATEGORY_LABEL_SHORT: Record<string, string> = {
  ai: "AI system",
  web: "Client work",
  prototype: "Prototype",
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

      <RevealStagger className="grid grid-cols-2 gap-2 sm:gap-4">
        {featured.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="hud group flex h-full flex-col gap-2.5 border border-line bg-graphite/60 p-3 outline-none backdrop-blur-sm transition-colors hover:border-line-bright hover:bg-panel/80 sm:gap-4 sm:p-6"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="led h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: ACCENT[p.category], color: ACCENT[p.category] }}
              />
              <span className="truncate font-mono text-label uppercase text-ink-faint">
                <span className="sm:hidden">
                  {CATEGORY_LABEL_SHORT[p.category] ?? p.category}
                </span>
                <span className="hidden sm:inline">
                  {CATEGORY_LABEL[p.category] ?? p.category}
                </span>
              </span>
            </div>

            <h3 className="font-display text-base font-medium sm:text-xl">{p.title}</h3>

            {/* The problem is what a client recognises. Lead with it, not the stack. */}
            <p className="line-clamp-3 text-xs leading-relaxed text-ink-dim sm:line-clamp-none sm:text-sm">
              {p.problem}
            </p>

            {p.outcome?.[0] && (
              <div className="mt-auto hidden items-baseline gap-3 pt-2 sm:flex">
                <span className="shrink-0 font-mono text-label uppercase text-ink-faint">
                  Result
                </span>
                <span className="text-sm leading-relaxed text-ink">{p.outcome[0]}</span>
              </div>
            )}

            {/* Stack readout. The technical fingerprint of the system. Hidden below
                sm — at two columns on a phone there is no room to show it and
                still keep the problem statement readable. */}
            <ul className="mt-auto hidden flex-wrap gap-x-3 gap-y-1 border-t border-line pt-4 sm:flex">
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
              <span className="sm:hidden">Read →</span>
              <span className="hidden sm:inline">Read the case →</span>
            </span>
          </Link>
        ))}
      </RevealStagger>

      <Link
        href="/projects"
        className="mt-8 inline-block font-mono text-label uppercase text-ink-dim transition-colors hover:text-ink"
      >
        View all {projects.length} projects &rarr;
      </Link>
    </Section>
  );
}
