"use client";
import { useState } from "react";
import { filterCommands, paletteCommands } from "@/lib/palette-commands";

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const results = filterCommands(query, paletteCommands);

  return (
    <div
      role="dialog"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-32"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-white/10 bg-[--color-graphite] p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          placeholder="Type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent font-mono text-sm text-[--color-text] outline-none"
        />
        <ul className="mt-2 space-y-1">
          {results.map((cmd) => (
            <li key={cmd.id}>
              <a href={cmd.href} className="block rounded px-2 py-1 text-sm hover:bg-white/5">
                {cmd.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
