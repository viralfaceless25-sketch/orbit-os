"use client";
import { useEffect, useState } from "react";
import { hasSeenBoot, markBootSeen } from "@/lib/boot-sequence";

const LINES = [
  "INITIALIZING ORBIT OS...",
  "Loading projects",
  "Connecting GitHub",
  "Starting experiments",
  "System ready",
];

export function BootSequence({ onDone }: { onDone: () => void }) {
  const [skip, setSkip] = useState<boolean | null>(null);

  useEffect(() => {
    if (hasSeenBoot(window.localStorage)) {
      setSkip(true);
      onDone();
      return;
    }
    setSkip(false);
    const timer = setTimeout(() => {
      markBootSeen(window.localStorage);
      onDone();
    }, 1000);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (skip !== false) return null;

  return (
    <div
      role="status"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-1 bg-[--color-graphite] font-mono text-sm"
      onClick={onDone}
    >
      {LINES.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
