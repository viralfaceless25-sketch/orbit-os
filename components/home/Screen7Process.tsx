"use client";
import { useState } from "react";
import { SectionHeader } from "./SectionHeader";

/* Numbering is real here: these stages happen in this order. */
const STAGES = [
  {
    id: "01",
    name: "Discover",
    short: "Clarify the idea, audience, and objective.",
    detail:
      "We get specific about what you are actually solving, who it is for, and what success looks like — before any code gets written.",
  },
  {
    id: "02",
    name: "Prototype",
    short: "Build the first useful version quickly.",
    detail:
      "A fast, rough version you can react to, so we validate direction before investing in polish.",
  },
  {
    id: "03",
    name: "Build",
    short: "Develop the product and core systems.",
    detail: "The real implementation: architecture, integrations, and the product logic.",
  },
  {
    id: "04",
    name: "Launch",
    short: "Deploy, test, and prepare for real users.",
    detail: "Getting it live, tested, and ready for people to actually use.",
  },
  {
    id: "05",
    name: "Improve",
    short: "Use feedback to make the product stronger.",
    detail: "Once it is live, real usage tells us what to fix and what to build next.",
  },
] as const;

export function Screen7Process() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="py-20">
      <SectionHeader index="04" eyebrow="How it runs" title="Process" />

      <div className="border-t border-line">
        {STAGES.map((stage) => {
          const open = openId === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setOpenId(open ? null : stage.id)}
              aria-expanded={open}
              className="block w-full border-b border-line py-5 text-left outline-none transition-colors hover:bg-panel/60"
            >
              <div className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4">
                <span className="font-mono text-label text-ink-faint tabular-nums">
                  {stage.id}
                </span>
                <span>
                  <span className="font-display text-lg font-medium">{stage.name}</span>
                  <span className="ml-3 text-sm text-ink-dim">{stage.short}</span>
                </span>
                <span
                  aria-hidden
                  className="font-mono text-label text-ink-faint transition-transform duration-300 ease-instrument"
                  style={{ transform: open ? "rotate(45deg)" : "none" }}
                >
                  +
                </span>
              </div>
              {open && (
                <p className="mt-4 max-w-xl pl-[3.5rem] text-sm leading-relaxed text-ink-dim">
                  {stage.detail}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
