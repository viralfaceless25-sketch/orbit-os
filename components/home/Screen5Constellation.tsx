import { projects } from "@/data/projects";

export function Screen5Constellation() {
  const featured = projects.filter((p) => p.tier === "featured");

  return (
    <section id="projects" className="py-16">
      <h2 className="mb-6 text-2xl font-display">Featured</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {featured.map((p) => (
          <a
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="rounded border border-white/10 p-4 hover:border-white/30"
          >
            <p className="font-mono text-xs text-[--color-text-dim]">{p.category.toUpperCase()}</p>
            <p className="mt-1 text-lg font-medium">{p.title}</p>
            <p className="mt-1 text-sm text-[--color-text-dim]">{p.oneLiner}</p>
            <p className="mt-2 font-mono text-xs uppercase">{p.status.replace("-", " ")}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
