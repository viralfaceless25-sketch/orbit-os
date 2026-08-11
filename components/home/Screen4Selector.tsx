"use client";
import { useState } from "react";
import { projects } from "@/data/projects";
import { SectionHeader } from "./SectionHeader";

const MODULES = [
  {
    label: "A website",
    description: "Marketing sites, platforms, dashboards, and web applications.",
    category: "web" as const,
  },
  {
    label: "An AI system",
    description: "Assistants, automation workflows, knowledge systems, custom tools.",
    category: "ai" as const,
  },
  {
    label: "A prototype",
    description: "Turn an early idea into something functional and testable.",
    category: "prototype" as const,
  },
  {
    label: "Technical help",
    description: "Architecture, integrations, debugging, and deployment.",
    category: null,
  },
];

export function Screen4Selector() {
  const [selected, setSelected] = useState<string | null>(null);
  const active = MODULES.find((m) => m.label === selected);
  const matches = active?.category
    ? projects.filter((p) => p.category === active.category)
    : [];

  return (
    <section className="py-20">
      <SectionHeader index="02" eyebrow="Start here" title="What are you trying to build?" />

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => {
          const isActive = selected === m.label;
          return (
            <button
              key={m.label}
              onClick={() => setSelected(isActive ? null : m.label)}
              aria-pressed={isActive}
              className={`hud border p-6 text-left outline-none backdrop-blur-sm transition-colors ${
                isActive
                  ? "border-line-bright bg-panel/80"
                  : "border-line bg-graphite/60 hover:border-line-bright hover:bg-panel/60"
              }`}
            >
              <p className="font-display text-lg font-medium">{m.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">{m.description}</p>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mt-6 border-l-2 border-line-bright pl-5">
          {matches.length > 0 ? (
            <>
              <p className="font-mono text-label uppercase text-ink-faint">
                Relevant work
              </p>
              <ul className="mt-3 space-y-2">
                {matches.map((p) => (
                  <li key={p.slug}>
                    <a
                      href={`/projects/${p.slug}`}
                      className="group flex items-baseline gap-3 outline-none"
                    >
                      <span className="font-display font-medium transition-colors group-hover:text-ink">
                        {p.title}
                      </span>
                      <span className="text-sm text-ink-dim">{p.oneLiner}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-ink-dim">
              This is exactly the kind of work I take on — there is no public case study for
              it yet.
            </p>
          )}
          <a
            href={`/start-a-project${active.category ? `?interest=${active.category}` : ""}`}
            className="mt-5 inline-block font-mono text-label uppercase text-ink-faint transition-colors hover:text-ink"
          >
            Start this conversation →
          </a>
        </div>
      )}
    </section>
  );
}
