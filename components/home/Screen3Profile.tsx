export function Screen3Profile() {
  const signals = ["DESIGNING", "BUILDING", "INTEGRATING", "DEPLOYING", "EXPERIMENTING"];

  return (
    <section className="mx-auto grid max-w-3xl gap-8 py-16 md:grid-cols-2">
      <div className="space-y-2 font-mono text-sm">
        <p className="text-[--color-text-dim]">BUILDER PROFILE</p>
        <p>Name: Keyush Patel</p>
        <p>Primary function: Product development</p>
        <p>Specialties: Websites · AI · Prototypes</p>
        <p>Working style: Fast, collaborative, experimental</p>
        <p>Current status: Open for selected projects</p>
      </div>
      <div className="space-y-4">
        <ul className="flex flex-wrap gap-2 font-mono text-xs">
          {signals.map((s) => (
            <li key={s} className="rounded border border-white/10 px-2 py-1">
              {s}
            </li>
          ))}
        </ul>
        <p className="text-sm text-[--color-text-dim]">
          I enjoy taking ideas that are unclear, ambitious, or slightly unusual and turning them
          into products people can actually use. Sometimes that means building a polished
          website. Sometimes it means creating an AI workflow, prototyping a new app, or helping
          solve a difficult technical problem.
        </p>
      </div>
    </section>
  );
}
