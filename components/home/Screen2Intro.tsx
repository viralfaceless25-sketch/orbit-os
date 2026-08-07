export function Screen2Intro() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="max-w-2xl font-display text-4xl md:text-5xl">
        A living system of websites, AI products, experiments, and ideas.
      </h1>
      <p className="max-w-xl text-[--color-text-dim]">
        Freelance developer and product builder helping businesses, startups, and creative people
        design, build, and launch technology.
      </p>
      <div className="flex gap-3">
        <a href="#projects" className="rounded bg-white px-4 py-2 text-sm font-medium text-black">
          Explore Projects
        </a>
        <a
          href="/start-a-project"
          className="rounded border border-white/20 px-4 py-2 text-sm font-medium"
        >
          Start a Project
        </a>
      </div>
      <p className="font-mono text-xs text-[--color-text-dim]">Press ⌘K to explore</p>
    </section>
  );
}
