"use client";
import { useEffect, useState } from "react";

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [rotatingLabel, setRotatingLabel] = useState("KEYUSH PATEL");

  useEffect(() => {
    const labels = ["KEYUSH PATEL", "ORBIT OS"];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % labels.length;
      setRotatingLabel(labels[i]);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
      <span className="font-mono text-sm tracking-wide">{rotatingLabel}</span>
      <nav className="hidden gap-6 text-sm md:flex">
        <a href="/">Command Center</a>
        <a href="/#projects">Projects</a>
        <a href="/readme">README</a>
      </nav>
      <div className="flex items-center gap-3">
        <button
          aria-label="Open command palette"
          onClick={onOpenPalette}
          className="rounded border border-white/10 px-2 py-1 font-mono text-xs"
        >
          ⌘K
        </button>
        <a
          href="/start-a-project"
          className="rounded bg-white px-3 py-1.5 text-sm font-medium text-black"
        >
          Start a Project
        </a>
      </div>
    </header>
  );
}
