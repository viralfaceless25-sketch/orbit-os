"use client";
import { useState } from "react";
import { TopBar } from "./TopBar";
import { SideDock } from "./SideDock";
import { SystemStatus } from "./SystemStatus";
import { CommandPalette } from "./CommandPalette";

export function OSShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[--color-graphite] text-[--color-text]">
      <TopBar onOpenPalette={() => setPaletteOpen(true)} />
      <SideDock />
      <main className="px-4 py-6 md:pl-20">{children}</main>
      <div className="fixed bottom-4 right-4 hidden md:block">
        <SystemStatus />
      </div>
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}
