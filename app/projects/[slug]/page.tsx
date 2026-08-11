import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { ProjectLinks } from "@/components/projects/ProjectLinks";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <article className="max-w-2xl space-y-8 py-12">
      <header>
        <p className="font-mono text-xs text-ink-dim">
          {project.category.toUpperCase()} · {project.status.replace("-", " ").toUpperCase()}
        </p>
        <h1 className="text-3xl font-display">{project.title}</h1>
        <p className="mt-2 text-ink-dim">{project.oneLiner}</p>
      </header>

      <section>
        <h2 className="font-mono text-xs text-ink-dim">THE PROBLEM</h2>
        <p className="mt-1">{project.problem}</p>
      </section>

      <section>
        <h2 className="font-mono text-xs text-ink-dim">MY CONTRIBUTION</h2>
        <p className="mt-1">{project.contribution}</p>
      </section>

      <section>
        <h2 className="font-mono text-xs text-ink-dim">THE SOLUTION</h2>
        <p className="mt-1">{project.solution}</p>
      </section>

      <section>
        <h2 className="font-mono text-xs text-ink-dim">TECHNICAL SYSTEM</h2>
        <ul className="mt-1 flex flex-wrap gap-2 font-mono text-xs">
          {project.techStack.map((t) => (
            <li key={t} className="rounded border border-line px-2 py-1">
              {t}
            </li>
          ))}
        </ul>
      </section>

      {project.challenges.length > 0 && (
        <section>
          <h2 className="font-mono text-xs text-ink-dim">CHALLENGES</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {project.challenges.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-mono text-xs text-ink-dim">OUTCOME</h2>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {project.outcome.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      <ProjectLinks project={project} />
    </article>
  );
}
