"use client";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/*
  Instrument rail, not a fake app dock. Each entry is a measurement tick with a
  label that reveals on hover. The rail reads as a calibrated scale down the
  page edge rather than a row of mystery icons.

  The ticks extend into place one after another on load, so the rail appears to
  calibrate itself as the interface comes up.
*/
const ITEMS = [
  { label: "Command Center", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "README", href: "/readme" },
  { label: "Contact", href: "/start-a-project" },
] as const;

const STAGGER_MS = 90;

export function SideDock() {
  const reduced = usePrefersReducedMotion();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (reduced) {
      setArmed(true);
      return;
    }
    // One frame after mount, so the transition has an initial state to run from.
    const id = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  return (
    <nav
      aria-label="Sections"
      className="fixed left-0 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-px pl-5 lg:flex"
    >
      {ITEMS.map((item, i) => (
        <a
          key={item.label}
          href={item.href}
          className="group flex items-center gap-3 py-2 outline-none"
          style={{
            opacity: armed ? 1 : 0,
            transform: armed ? "translateX(0)" : "translateX(-10px)",
            transition: reduced
              ? undefined
              : `opacity 420ms ease-out ${i * STAGGER_MS}ms, transform 420ms cubic-bezier(0.2,0.7,0.2,1) ${i * STAGGER_MS}ms`,
          }}
        >
          {/* Tick: short by default, extends on hover/focus like a gauge mark */}
          <span
            aria-hidden
            className="h-px bg-line-bright transition-all duration-300 ease-instrument group-hover:w-8 group-hover:bg-ink group-focus-visible:w-8 group-focus-visible:bg-ink"
            style={{ width: armed ? 16 : 0 }}
          />
          <span className="font-mono text-label uppercase text-ink-faint tabular-nums transition-colors duration-300 group-hover:text-ink group-focus-visible:text-ink">
            <span className="mr-2 opacity-60">{String(i + 1).padStart(2, "0")}</span>
            <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              {item.label}
            </span>
          </span>
        </a>
      ))}
    </nav>
  );
}
