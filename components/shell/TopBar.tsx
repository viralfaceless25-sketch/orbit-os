"use client";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const WORDMARKS = ["KEYUSH PATEL", "ORBIT OS"] as const;

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % WORDMARKS.length), 4000);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-graphite/85 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-6 px-5">
        {/* Wordmark — fixed width so the rotation never shifts the layout */}
        <a href="/" className="shrink-0 outline-none" aria-label="ORBIT OS — Keyush Patel">
          <span className="relative block h-4 w-[7.5rem] overflow-hidden font-mono text-label uppercase tracking-widest">
            {WORDMARKS.map((word, i) => (
              <span
                key={word}
                aria-hidden={i !== index}
                className="absolute inset-0 transition-all duration-500 ease-instrument"
                style={{
                  opacity: i === index ? 1 : 0,
                  transform: reduced
                    ? undefined
                    : `translateY(${i === index ? 0 : i < index ? -8 : 8}px)`,
                }}
              >
                {word}
              </span>
            ))}
          </span>
        </a>

        <nav className="hidden items-center gap-7 font-mono text-label uppercase text-ink-dim md:flex">
          <a href="/#projects" className="transition-colors hover:text-ink">
            Projects
          </a>
          <a href="/capabilities" className="transition-colors hover:text-ink">
            Capabilities
          </a>
          <a href="/readme" className="transition-colors hover:text-ink">
            README
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {/* Availability LED — the one live signal in the bezel */}
          <span className="hidden items-center gap-2 font-mono text-label uppercase text-ink-dim sm:flex">
            <span
              aria-hidden
              className="led h-1.5 w-1.5 rounded-full bg-accent-oss text-accent-oss"
            />
            Available
          </span>
          <button
            aria-label="Open command palette"
            onClick={onOpenPalette}
            className="rounded-sm border border-line px-2 py-1 font-mono text-label text-ink-dim transition-colors hover:border-line-bright hover:text-ink"
          >
            ⌘K
          </button>
          <a
            href="/start-a-project"
            className="rounded-sm bg-ink px-3.5 py-1.5 font-mono text-label uppercase text-graphite transition-opacity hover:opacity-85"
          >
            Start a Project
          </a>
        </div>
      </div>
    </header>
  );
}
