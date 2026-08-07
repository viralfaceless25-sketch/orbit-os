import type { Project } from "@/data/projects";

export function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap gap-3">
      {project.liveUrl && (
        <a href={project.liveUrl} className="rounded bg-white px-4 py-2 text-sm text-black">
          Open Live Project
        </a>
      )}
      {project.githubUrl && (
        <a href={project.githubUrl} className="rounded border border-white/20 px-4 py-2 text-sm">
          View GitHub
        </a>
      )}
      <a
        href={`/start-a-project?interest=${encodeURIComponent(project.category)}`}
        className="rounded border border-white/20 px-4 py-2 text-sm"
      >
        Discuss a Similar Project
      </a>
    </div>
  );
}
