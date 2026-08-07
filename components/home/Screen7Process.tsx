"use client";
import { useState } from "react";

const STAGES = [
  {
    id: "01",
    name: "DISCOVER",
    short: "Clarify the idea, audience, and objective.",
    detail:
      "We start by getting specific about what you're actually trying to solve, who it's for, and what success looks like — before any code gets written.",
  },
  {
    id: "02",
    name: "PROTOTYPE",
    short: "Create the first useful version quickly.",
    detail: "A fast, rough version you can react to, so we validate direction before investing in polish.",
  },
  {
    id: "03",
    name: "BUILD",
    short: "Develop the product and core systems.",
    detail: "The real implementation: architecture, integrations, and the actual product logic.",
  },
  {
    id: "04",
    name: "LAUNCH",
    short: "Deploy, test, and prepare for real users.",
    detail: "Getting it live, tested, and ready for people to actually use it.",
  },
  {
    id: "05",
    name: "IMPROVE",
    short: "Use feedback to make the product stronger.",
    detail: "Once it's live, real usage tells us what to fix and what to build next.",
  },
] as const;

export function Screen7Process() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="py-16">
      <h2 className="mb-6 text-2xl font-display">Process</h2>
      <div className="space-y-2">
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setOpenId(openId === stage.id ? null : stage.id)}
            className="block w-full rounded border border-white/10 p-4 text-left"
          >
            <p className="font-mono text-sm">
              {stage.id} {stage.name}
            </p>
            <p className="text-sm text-[--color-text-dim]">{stage.short}</p>
            {openId === stage.id && (
              <p className="mt-2 text-sm text-[--color-text-dim]">{stage.detail}</p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
