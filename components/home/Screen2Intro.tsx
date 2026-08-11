import Link from "next/link";
import { projects } from "@/data/projects";
import { Reveal } from "@/components/fx/Reveal";
import { ScrambleText } from "@/components/fx/ScrambleText";

const ACCENT: Record<string, string> = {
  ai: "var(--color-accent-ai)",
  web: "var(--color-accent-web)",
  prototype: "var(--color-accent-exp)",
  "open-source": "var(--color-accent-oss)",
};

const STATUS_LABEL: Record<string, string> = {
  live: "Live",
  "in-development": "In development",
  archived: "Archived",
  tbd: "Unlisted",
};

export function Screen2Intro() {
  const featured = projects.filter((p) => p.tier === "featured");

  return (
    <section className="pt-20 pb-24 md:pt-28">
      <p className="tick font-mono text-label uppercase text-ink-faint">
        <ScrambleText text={`${featured.length} SYSTEMS ONLINE`} speed={34} delay={150} />
      </p>

      <Reveal delay={0.12}>
        <h1 className="mt-7 max-w-4xl font-display text-display-md font-medium text-balance md:text-display-lg">
          A living system of websites, AI products, experiments, and ideas.
        </h1>
      </Reveal>

      <Reveal delay={0.24}>
        <p className="mt-7 max-w-xl text-ink-dim">
          Freelance developer and product builder helping businesses, startups, and creative
          people design, build, and launch technology.
        </p>
      </Reveal>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <Link
          href="/start-a-project"
          className="rounded-sm bg-ink px-5 py-2.5 font-mono text-label uppercase text-graphite transition-opacity hover:opacity-85"
        >
          Start a Project
        </Link>
        <a
          href="#projects"
          className="rounded-sm border border-line px-5 py-2.5 font-mono text-label uppercase text-ink-dim transition-colors hover:border-line-bright hover:text-ink"
        >
          Explore projects
        </a>
        <span className="hidden font-mono text-label uppercase text-ink-faint sm:inline">
          or press ⌘K
        </span>
      </div>

      {/* The faceplate: four real systems, their category and current state. */}
      <div className="mt-16 border-t border-line">
        {featured.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line py-4 outline-none transition-colors hover:bg-panel/60 sm:grid-cols-[auto_10rem_1fr_auto] sm:gap-6"
          >
            <span
              aria-hidden
              className="led h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: ACCENT[p.category], color: ACCENT[p.category] }}
            />
            <span className="font-display text-base font-medium text-ink transition-colors">
              {p.title}
            </span>
            <span className="hidden truncate text-sm text-ink-dim sm:block">{p.oneLiner}</span>
            <span className="justify-self-end font-mono text-label uppercase text-ink-faint">
              {STATUS_LABEL[p.status] ?? p.status}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
