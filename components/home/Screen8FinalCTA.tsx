export function Screen8FinalCTA() {
  return (
    <section className="border-t border-line py-24">
      <p className="font-mono text-label uppercase text-ink-faint">Have an idea?</p>
      <h2 className="mt-5 max-w-2xl font-display text-display-sm font-medium text-balance md:text-display-md">
        You do not need a finished spec. Bring the rough idea.
      </h2>
      <p className="mt-5 max-w-lg text-ink-dim">
        Tell me what you are trying to build and where you are stuck. We can shape it from
        there.
      </p>
      <a
        href="/start-a-project"
        className="mt-9 inline-block rounded-sm bg-ink px-6 py-3 font-mono text-label uppercase text-graphite transition-opacity hover:opacity-85"
      >
        Start a Project
      </a>
    </section>
  );
}
