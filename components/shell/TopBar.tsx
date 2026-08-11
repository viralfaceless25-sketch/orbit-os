"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const WORDMARKS = ["KEYUSH PATEL", "ORBIT OS"] as const;
const ROTATE_MS = 2600;

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % WORDMARKS.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-graphite/80 backdrop-blur-xl">
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:h-20 sm:gap-6 sm:px-6">
        <nav className="hidden items-center gap-7 font-mono text-label uppercase text-ink-dim md:flex">
          <Link href="/projects" className="transition-colors hover:text-ink">
            Projects
          </Link>
          <Link href="/capabilities" className="transition-colors hover:text-ink">
            Capabilities
          </Link>
          <Link href="/readme" className="transition-colors hover:text-ink">
            README
          </Link>
        </nav>

        {/*
          The wordmark is the centrepiece: large display type that cycles
          between the person and the system. Fixed height with both labels
          stacked in place, so the rotation never nudges the layout.
        */}
        <Link
          href="/"
          aria-label="ORBIT OS, Keyush Patel"
          className="group relative col-start-2 block h-9 w-[11rem] overflow-hidden text-center outline-none xs:w-[13rem] sm:w-[16rem] md:w-[20rem]"
        >
          {WORDMARKS.map((word, i) => {
            const active = i === index;
            return (
              <span
                key={word}
                aria-hidden={!active}
                className="absolute inset-0 flex items-center justify-center whitespace-nowrap font-display text-base font-medium tracking-[0.08em] xs:text-lg sm:text-2xl sm:tracking-[0.14em] md:text-3xl"
                style={{
                  opacity: active ? 1 : 0,
                  transform: reduced
                    ? undefined
                    : `translateY(${active ? 0 : i < index ? -100 : 100}%)`,
                  filter: active ? "blur(0px)" : "blur(4px)",
                  transition: reduced
                    ? "opacity 200ms linear"
                    : "opacity 620ms cubic-bezier(0.2,0.7,0.2,1), transform 620ms cubic-bezier(0.2,0.7,0.2,1), filter 620ms cubic-bezier(0.2,0.7,0.2,1)",
                }}
              >
                {word}
              </span>
            );
          })}

          {/* Progress hairline: shows the cycle advancing under the wordmark */}
          <span
            aria-hidden
            className="absolute bottom-0 left-1/2 h-px w-16 -translate-x-1/2 bg-line-bright opacity-60"
          />
        </Link>

        <div className="col-start-3 flex items-center justify-end gap-3">
          <span className="hidden items-center gap-2 font-mono text-label uppercase text-ink-dim lg:flex">
            <span
              aria-hidden
              className="led h-1.5 w-1.5 rounded-full bg-accent-oss text-accent-oss"
            />
            Available
          </span>
          <button
            aria-label="Open command palette"
            onClick={onOpenPalette}
            className="shrink-0 rounded-sm border border-line px-2 py-1.5 font-mono text-label text-ink-dim transition-colors hover:border-line-bright hover:text-ink sm:px-2.5"
          >
            <span className="sm:hidden" aria-hidden>
              ☰
            </span>
            <span className="hidden sm:inline">⌘K</span>
          </button>
          <Link
            href="/start-a-project"
            className="shrink-0 rounded-sm bg-ink px-2.5 py-1.5 font-mono text-label uppercase text-graphite transition-opacity hover:opacity-85 sm:px-4 sm:py-2"
          >
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Start a Project</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
