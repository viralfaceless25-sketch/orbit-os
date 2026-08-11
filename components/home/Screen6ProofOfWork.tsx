import { SectionHeader } from "./SectionHeader";
import { RevealStagger } from "@/components/fx/Reveal";

const OUTPUT = [
  "Built a multi-agent AI orchestrator with a live dashboard",
  "Shipped a 3D-driven jewelry e-commerce storefront",
  "Building a cross-office diamond inventory system with document extraction",
  "Developed a native macOS desktop companion app",
];

export function Screen6ProofOfWork() {
  return (
    <section className="py-20">
      <SectionHeader index="03" eyebrow="Recent output" title="What has shipped lately" />

      <RevealStagger>
        {OUTPUT.map((line, i) => (
          <div
            key={line}
            className="grid grid-cols-[2.5rem_1fr] items-baseline gap-4 border-b border-line py-4"
          >
            <span className="font-mono text-label text-ink-faint tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-ink-dim">{line}</span>
          </div>
        ))}
      </RevealStagger>
    </section>
  );
}
