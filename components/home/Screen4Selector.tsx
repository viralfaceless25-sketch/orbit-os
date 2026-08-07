"use client";
import { useState } from "react";
import { projects } from "@/data/projects";

const MODULES = [
  {
    label: "Website",
    description: "Marketing sites, portfolio sites, platforms, dashboards, and web applications.",
    matches: (category: string) => category === "web",
  },
  {
    label: "AI System",
    description: "AI assistants, automation workflows, knowledge systems, and custom tools.",
    matches: (category: string) => category === "ai",
  },
  {
    label: "Product Prototype",
    description: "Turn an early idea into something functional, testable, and presentable.",
    matches: (category: string) => category === "prototype",
  },
  {
    label: "Technical Support",
    description: "Architecture, integrations, debugging, deployment, and product development help.",
    matches: () => false,
  },
] as const;

export function Screen4Selector() {
  const [selected, setSelected] = useState<(typeof MODULES)[number]["label"] | null>(null);
  const activeModule = MODULES.find((m) => m.label === selected);
  const matches = activeModule ? projects.filter((p) => activeModule.matches(p.category)) : [];

  return (
    <section className="mx-auto max-w-3xl py-16">
      <h2 className="mb-6 text-2xl font-display">What are you trying to build?</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {MODULES.map((m) => (
          <button
            key={m.label}
            onClick={() => setSelected(m.label)}
            className="rounded border border-white/10 p-4 text-left hover:border-white/30"
          >
            <p className="font-medium">{m.label}</p>
            <p className="mt-1 text-sm text-[--color-text-dim]">{m.description}</p>
          </button>
        ))}
      </div>
      {activeModule && (
        <div className="mt-6 font-mono text-sm">
          <p>You selected: {activeModule.label}</p>
          {matches.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {matches.map((p) => (
                <li key={p.slug}>
                  {"→ "}
                  <span>{p.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[--color-text-dim]">
              → Get in touch — this is exactly the kind of work I take on.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
