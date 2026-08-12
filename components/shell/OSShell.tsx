"use client";
import { useEffect, useState } from "react";
import { TopBar } from "./TopBar";
import { SideDock } from "./SideDock";
import { SystemStatus } from "./SystemStatus";
import { CommandPalette } from "./CommandPalette";
import { AmbientField } from "@/components/fx/AmbientField";
import { Atmosphere } from "@/components/fx/Atmosphere";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { OspaChat } from "@/components/ospa/OspaChat";
import { BootSequence } from "@/components/home/BootSequence";

export function OSShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [booted, setBooted] = useState(false);

  // ⌘K / Ctrl+K opens the palette. The shortcut the top bar advertises.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Runs on every full page load. Content stays in the DOM beneath it, so
          the overlay never costs us server-rendered markup. */}
      {!booted && <BootSequence onDone={() => setBooted(true)} />}

      <SmoothScroll />
      <AmbientField />
      <Atmosphere />
      <TopBar onOpenPalette={() => setPaletteOpen(true)} />
      <SideDock />

      {/* Single content spine. Every section aligns to this, nothing wanders */}
      <main className="mx-auto w-full max-w-6xl px-4 pb-32 sm:px-6 lg:px-16">{children}</main>

      <SystemStatus />

      <OspaChat />

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}
