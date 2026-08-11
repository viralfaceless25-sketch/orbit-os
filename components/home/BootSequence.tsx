"use client";
import { useEffect, useState } from "react";
import { hasSeenBoot, markBootSeen } from "@/lib/boot-sequence";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const LINES = [
  "Initializing ORBIT OS",
  "Loading projects",
  "Starting experiments",
  "System ready",
];

export function BootSequence({ onDone }: { onDone: () => void }) {
  const [skip, setSkip] = useState<boolean | null>(null);
  const [step, setStep] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (hasSeenBoot(window.localStorage) || reduced) {
      setSkip(true);
      onDone();
      return;
    }
    setSkip(false);
    const stepper = setInterval(() => setStep((s) => Math.min(s + 1, LINES.length)), 190);
    const timer = setTimeout(() => {
      markBootSeen(window.localStorage);
      onDone();
    }, 1000);
    return () => {
      clearInterval(stepper);
      clearTimeout(timer);
    };
  }, [onDone, reduced]);

  if (skip !== false) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      onClick={onDone}
      className="fixed inset-0 z-50 flex items-center bg-graphite px-8 lg:px-24"
    >
      <ul className="space-y-1.5">
        {LINES.map((line, i) => (
          <li
            key={line}
            className="flex items-center gap-3 font-mono text-label uppercase transition-opacity duration-200"
            style={{ opacity: i <= step ? 1 : 0.15 }}
          >
            <span
              aria-hidden
              className="h-px w-4"
              style={{
                backgroundColor:
                  i <= step ? "var(--color-text)" : "var(--color-line-bright)",
              }}
            />
            <span style={{ color: i <= step ? "var(--color-text)" : "var(--color-text-faint)" }}>
              {line}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
