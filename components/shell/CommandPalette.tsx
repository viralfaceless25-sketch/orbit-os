"use client";
import Link from "next/link";
import { useState } from "react";
import { filterCommands, paletteCommands } from "@/lib/palette-commands";

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const results = filterCommands(query, paletteCommands);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-graphite/80 px-5 pt-[18vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-sm border border-line-bright bg-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span aria-hidden className="font-mono text-label text-ink-faint">
            &gt;
          </span>
          <input
            autoFocus
            placeholder="Search commands"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent font-mono text-data text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-label text-ink-faint">
            ESC
          </kbd>
        </div>

        {results.length > 0 ? (
          <ul className="max-h-80 overflow-y-auto py-1.5">
            {results.map((cmd) => {
              const external = cmd.href.startsWith("http");
              const className =
                "flex items-center gap-3 px-4 py-3 text-sm text-ink-dim outline-none transition-colors hover:bg-panel-raised hover:text-ink focus-visible:bg-panel-raised focus-visible:text-ink sm:py-2";
              return (
                <li key={cmd.id}>
                  {external ? (
                    <a
                      href={cmd.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      <span aria-hidden className="h-px w-3 bg-line-bright" />
                      {cmd.label}
                    </a>
                  ) : (
                    <Link href={cmd.href} onClick={onClose} className={className}>
                      <span aria-hidden className="h-px w-3 bg-line-bright" />
                      {cmd.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-4 py-6 font-mono text-label uppercase text-ink-faint">
            No matching command
          </p>
        )}
      </div>
    </div>
  );
}
