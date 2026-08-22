import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { ProjectLinks } from "@/components/projects/ProjectLinks";
import { ProjectPreview } from "@/components/projects/ProjectPreview";
import { SiriDemo } from "@/components/projects/SiriDemo";
import { SiriShots } from "@/components/projects/SiriShots";
import { SiriDiagrams } from "@/components/projects/SiriDiagrams";
import { SiriCaptures } from "@/components/projects/SiriCaptures";

/*
  Per-project share cards. Each project has its own generated image, so a link
  pasted into a chat or a feed arrives with the project's own name on it rather
  than a blank rectangle or the same site-wide card every time.
*/
export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return {};

  const title = `${project.title} · ORBIT OS`;
  const image = `/og/${project.slug}.jpg`;

  return {
    title,
    description: project.oneLiner,
    openGraph: {
      type: "article",
      title,
      description: project.oneLiner,
      url: `/projects/${project.slug}`,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.oneLiner,
      images: [image],
    },
  };
}

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

      {/* Live sites render as a real, scrollable embed rather than a screenshot.
          The voice agent has no URL to embed, so it shows its own pipeline instead. */}
      {project.slug === "siri-mac-agent" ? (
        <>
          <SiriDemo />
          <SiriCaptures />
          <SiriShots />
          <SiriDiagrams />
        </>
      ) : (
        <ProjectPreview project={project} />
      )}

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
