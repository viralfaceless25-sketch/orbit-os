export default function ReadmePage() {
  const sections = [
    {
      id: "about",
      body: (
        <>
          <p># Hello</p>
          <p className="mt-2">
            I&apos;m Keyush Patel, a developer and product builder. I work across websites, AI
            systems, product prototypes, and experiments that begin with questions like:
          </p>
          <p className="mt-2">&quot;Could we make this?&quot;</p>
          <p>&quot;Would this be useful?&quot;</p>
          <p>&quot;What happens if we try?&quot;</p>
        </>
      ),
    },
    {
      id: "philosophy",
      body: (
        <p>
          Most of what I build starts as someone&apos;s rough idea, not a finished spec. I&apos;d
          rather ship a working first version fast and improve it against real feedback than
          polish something nobody has used yet.
        </p>
      ),
    },
    {
      id: "how-i-work",
      body: (
        <p>
          Fast, collaborative, and hands-on across the whole stack: design, frontend, backend,
          and deployment. I work directly with whoever has the idea, not through a long chain of
          handoffs.
        </p>
      ),
    },
    {
      id: "currently-building",
      body: (
        <p>
          ORBIT OS (this site). AMS, a multi-agent orchestrator. DIMS, a cross-office diamond
          inventory system. OSPA, a native macOS companion for non-technical users.
        </p>
      ),
    },
    {
      id: "tools-i-use",
      body: (
        <p>
          Next.js, TypeScript, Tailwind CSS, Python, Swift, Supabase, and a growing set of AI
          tooling.
        </p>
      ),
    },
    {
      id: "outside-code",
      body: <p>Still figuring out the best way to say this. Check back soon.</p>,
    },
    {
      id: "contact",
      body: (
        <p>
          Best way in is the{" "}
          <a href="/start-a-project" className="underline">
            Start a Project
          </a>{" "}
          flow.
        </p>
      ),
    },
  ];

  const timeline = [
    "Started building websites",
    "Began helping friends with applications",
    "Explored product development",
    "Started developing AI systems",
    "Now combining everything into one practice",
  ];

  return (
    <div className="max-w-2xl space-y-10 py-12 font-mono text-sm">
      {sections.map((s) => (
        <section key={s.id}>
          <p className="mb-2 text-xs text-ink-dim">/{s.id}</p>
          <div className="font-sans text-base">{s.body}</div>
        </section>
      ))}
      <section>
        <p className="mb-2 text-xs text-ink-dim">/timeline</p>
        <ul className="space-y-1 font-sans">
          {timeline.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
