import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { ProjectLinks } from "@/components/projects/ProjectLinks";
import { ProjectPreview } from "@/components/projects/ProjectPreview";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

const STATUS_LABEL: Record<string, string> = {
  live: "Live",
  "in-development": "In development",
  archived: "Archived",
  tbd: "Unlisted",
};

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-label uppercase text-ink-faint">{label}</h2>
      <div className="mt-2 leading-relaxed">{children}</div>
    </section>
  );
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <article className="max-w-3xl space-y-8 py-10 sm:space-y-10 sm:py-16">
      <header>
        <p className="font-mono text-label uppercase text-ink-faint">
          {project.category.replace("-", " ")} &middot;{" "}
          {STATUS_LABEL[project.status] ?? project.status}
        </p>
        <h1 className="mt-3 font-display text-display-sm font-medium md:text-display-md">
          {project.title}
        </h1>
        <p className="mt-4 text-base text-ink-dim sm:text-lg">{project.oneLiner}</p>
      </header>

      {/* Live sites render as a real, scrollable embed rather than a screenshot. */}
      <ProjectPreview project={project} />

      {project.role && <Block label="Role">{project.role}</Block>}
      {project.problem && <Block label="The problem">{project.problem}</Block>}
      {project.contribution && <Block label="My contribution">{project.contribution}</Block>}
      {project.solution && <Block label="The solution">{project.solution}</Block>}

      <Block label="Technical system">
        <ul className="flex flex-wrap gap-2">
          {project.techStack.map((t) => (
            <li
              key={t}
              className="border border-line px-2.5 py-1 font-mono text-label uppercase text-ink-dim"
            >
              {t}
            </li>
          ))}
        </ul>
      </Block>

      {project.challenges && project.challenges.length > 0 && (
        <Block label="Challenges">
          <ul className="list-disc space-y-2 pl-5">
            {project.challenges.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Block>
      )}

      {project.outcome && project.outcome.length > 0 && (
        <Block label="Outcome">
          <ul className="list-disc space-y-2 pl-5">
            {project.outcome.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </Block>
      )}

      <ProjectLinks project={project} />
    </article>
  );
}
