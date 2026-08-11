"use client";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/*
  Boot sequence, shown on every load rather than only the first.

  This is a deliberate departure from the spec's performance rule ("skipped
  after the first visit"): the owner wants the sequence to be part of arriving
  at the site every time. The cost is a couple of seconds before content on a
  return visit, so it stays escapable — any click or key press ends it, and it
  is skipped outright under reduced motion.
*/

const LINES = [
  "Initializing ORBIT OS",
  "Mounting project registry",
  "Linking capabilities",
  "Starting OSPA",
  "System ready",
];

/** Time each line takes to appear. Total run is roughly LINES × this + hold. */
const LINE_MS = 420;
const HOLD_MS = 520;

export function BootSequence({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [skip, setSkip] = useState<boolean | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduced) {
      setSkip(true);
      onDone();
      return;
    }

    setSkip(false);
    const stepper = setInterval(() => {
      setStep((s) => Math.min(s + 1, LINES.length - 1));
    }, LINE_MS);

    const timer = setTimeout(() => onDone(), LINES.length * LINE_MS + HOLD_MS);

    return () => {
      clearInterval(stepper);
      clearTimeout(timer);
    };
  }, [onDone, reduced]);

  // Any interaction escapes the sequence, so it never traps anyone.
  useEffect(() => {
    if (skip !== false) return;
    const escape = () => onDone();
    window.addEventListener("keydown", escape);
    window.addEventListener("pointerdown", escape);
    return () => {
      window.removeEventListener("keydown", escape);
      window.removeEventListener("pointerdown", escape);
    };
  }, [skip, onDone]);

  if (skip !== false) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex items-center bg-graphite px-8 lg:px-24"
    >
      <ul className="space-y-2">
        {LINES.map((line, i) => {
          const reached = i <= step;
          const done = i < step;
          return (
            <li
              key={line}
              className="flex items-center gap-3 font-mono text-label uppercase transition-all duration-300"
              style={{
                opacity: reached ? 1 : 0.12,
                transform: reached ? "translateX(0)" : "translateX(-6px)",
              }}
            >
              <span
                aria-hidden
                className="h-px transition-all duration-300"
                style={{
                  width: reached ? 26 : 10,
                  backgroundColor: reached
                    ? "var(--color-text)"
                    : "var(--color-line-bright)",
                }}
              />
              <span
                style={{
                  color: reached ? "var(--color-text)" : "var(--color-text-faint)",
                }}
              >
                {line}
              </span>
              {/* A completed step reads as checked off rather than merely lit. */}
              <span
                aria-hidden
                className="transition-opacity duration-300"
                style={{
                  opacity: done ? 1 : 0,
                  color: "var(--color-accent-oss)",
                }}
              >
                ok
              </span>
            </li>
          );
        })}
      </ul>

      <p className="absolute bottom-8 left-8 font-mono text-label uppercase text-ink-faint lg:left-24">
        press any key to skip
      </p>
    </div>
  );
}
