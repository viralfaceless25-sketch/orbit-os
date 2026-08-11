import { Reveal } from "@/components/fx/Reveal";

const SPEC = [
  ["Name", "Keyush Patel"],
  ["Primary function", "Product development"],
  ["Specialties", "Websites · AI · Prototypes"],
  ["Working style", "Fast, collaborative, experimental"],
  ["Current status", "Open for selected projects"],
] as const;

export function Screen3Profile() {
  return (
    <Reveal className="grid gap-10 border-t border-line py-20 md:grid-cols-[1fr_1.2fr] md:gap-16">
      <div>
        <p className="font-mono text-label uppercase text-ink-faint">Builder profile</p>
        <dl className="mt-6 space-y-0">
          {SPEC.map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[9rem_1fr] items-baseline gap-4 border-b border-line py-3"
            >
              <dt className="font-mono text-label uppercase text-ink-faint">{label}</dt>
              <dd className="text-sm text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <p className="text-lg leading-relaxed text-balance">
          I enjoy taking ideas that are unclear, ambitious, or slightly unusual and turning
          them into products people can actually use.
        </p>
        <p className="mt-5 leading-relaxed text-ink-dim">
          Sometimes that means building a polished website. Sometimes it means creating an AI
          workflow, prototyping a new app, or helping solve a difficult technical problem.
        </p>
      </div>
    </Reveal>
  );
}
