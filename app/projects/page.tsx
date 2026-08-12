import Link from "next/link";
import { SystemMonitor } from "@/components/monitor/SystemMonitor";
import {
  featuredProjects,
  supportingProjects,
  archiveProjects,
  type Project,
} from "@/data/projects";

export const metadata = {
  title: "Projects · ORBIT OS",
  description: "Everything built so far: client work, AI systems, prototypes, and archive.",
};

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

function Row({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line py-5 outline-none transition-colors hover:bg-panel/50 sm:grid-cols-[auto_12rem_1fr_auto] sm:gap-6"
    >
      <span
        aria-hidden
        className="led h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: ACCENT[project.category], color: ACCENT[project.category] }}
      />
      <span className="font-display text-base font-medium">{project.title}</span>
      <span className="hidden text-sm text-ink-dim sm:block">{project.oneLiner}</span>
      <span className="justify-self-end font-mono text-label uppercase text-ink-faint">
        {STATUS_LABEL[project.status] ?? project.status}
      </span>
    </Link>
  );
}

function Group({
  index,
  title,
  note,
  items,
}: {
  index: string;
  title: string;
  note: string;
  items: Project[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="grid gap-6 border-t border-line py-10 sm:gap-8 sm:py-16 lg:grid-cols-[15rem_1fr] lg:gap-16">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <p className="flex items-baseline gap-3 font-mono text-label uppercase text-ink-faint">
          <span className="tabular-nums text-ink-dim">{index}</span>
          {title}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">{note}</p>
        <p className="mt-4 font-mono text-label uppercase text-ink-faint">
          {items.length} {items.length === 1 ? "project" : "projects"}
        </p>
      </div>
      <div className="border-t border-line">
        {items.map((p) => (
          <Row key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
}

export default function ProjectsIndexPage() {
  const total = featuredProjects.length + supportingProjects.length + archiveProjects.length;

  return (
    <div className="py-10 sm:py-16">
      <header className="max-w-2xl">
        <p className="font-mono text-label uppercase text-ink-faint">
          Index &middot; {total} projects
        </p>
        <h1 className="mt-4 font-display text-display-sm font-medium md:text-display-md">
          Everything built so far.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-ink-dim sm:text-base">
          Grouped by how much of the story is written up. Not every repository is a case
          study, and pretending otherwise would waste your time.
        </p>
      </header>

      <SystemMonitor />

      <Group
        index="01"
        title="Featured"
        note="Full case studies with the problem, the approach, and what came out of it."
        items={featuredProjects}
      />
      <Group
        index="02"
        title="Supporting"
        note="Real shipped work with a shorter write-up and a link to the source."
        items={supportingProjects}
      />
      <Group
        index="03"
        title="Archive"
        note="Earlier builds, experiments, and things since superseded. Kept for honesty."
        items={archiveProjects}
      />
    </div>
  );
}
