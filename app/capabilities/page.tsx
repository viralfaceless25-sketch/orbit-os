import { capabilities } from "@/data/capabilities";

export default function CapabilitiesPage() {
  return (
    <div className="max-w-2xl space-y-8 py-12">
      <h1 className="text-3xl font-display">Capabilities</h1>
      {capabilities.map((c) => (
        <section key={c.name} className="rounded border border-line p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-mono text-sm">{c.name.toUpperCase()}</h2>
            <span className="font-mono text-xs text-accent-web">{c.status}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-4">
            <div>
              <p className="font-mono text-xs text-ink-dim">USEFUL FOR</p>
              <ul className="mt-1 space-y-0.5 text-xs sm:text-sm">
                {c.usefulFor.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs text-ink-dim">OUTPUTS</p>
              <ul className="mt-1 space-y-0.5 text-xs sm:text-sm">
                {c.outputs.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
