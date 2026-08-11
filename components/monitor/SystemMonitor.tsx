"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { projects, type Project, type ProjectCategory } from "@/data/projects";
import { matchesQuery } from "@/lib/project-search";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/*
  The work, rendered as a running process table.

  Every column is real: status comes from the registry, DEPTH is how complete
  the write-up is, and STACK is the actual technology count. The only synthetic
  element is a slow shimmer on the load bars, and even that is seeded from the
  project's own slug so a given row always behaves the same way. Inventing
  telemetry on an engineering portfolio is the sort of thing the audience
  notices, so nothing here is decoration pretending to be data.
*/

const ACCENT: Record<ProjectCategory, string> = {
  ai: "var(--color-accent-ai)",
  web: "var(--color-accent-web)",
  prototype: "var(--color-accent-exp)",
  "open-source": "var(--color-accent-oss)",
};

const CATEGORY_SHORT: Record<ProjectCategory, string> = {
  ai: "ai",
  web: "web",
  prototype: "proto",
  "open-source": "oss",
};

const STATUS_LABEL: Record<string, string> = {
  live: "LIVE",
  "in-development": "BUILD",
  archived: "IDLE",
  tbd: "UNLISTED",
};

const CATEGORIES: (ProjectCategory | "all")[] = ["all", "ai", "web", "prototype"];

/** Depth of the write-up, which is what the bar actually measures. */
function depthOf(p: Project): number {
  if (p.tier === "featured") return 1;
  if (p.tier === "supporting") return 0.6;
  return 0.3;
}

/** Stable per-row phase so each bar shimmers differently but predictably. */
function seedOf(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 997;
  return h / 997;
}

function Bar({ value, live }: { value: number; live: number }) {
  const cells = 10;
  const filled = Math.max(1, Math.round(value * cells));
  return (
    <span aria-hidden className="tracking-[0.15em]">
      {Array.from({ length: cells }, (_, i) => {
        const on = i < filled;
        // The last lit cell breathes, so an active row reads as alive.
        const flick = on && i === filled - 1 && live > 0.55;
        return (
          <span key={i} className={on ? "text-ink" : "text-line-bright"}>
            {on ? (flick ? "▓" : "█") : "░"}
          </span>
        );
      })}
    </span>
  );
}

export function SystemMonitor() {
  const reduced = usePrefersReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "all">("all");
  const [selected, setSelected] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [tick, setTick] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(
    () =>
      projects
        .filter((p) => (category === "all" ? true : p.category === category))
        .filter((p) => matchesQuery(p, query)),
    [query, category]
  );

  // Selection must stay inside the filtered set as the visitor types.
  useEffect(() => {
    setSelected((s) => Math.min(s, Math.max(rows.length - 1, 0)));
  }, [rows.length]);

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      setUptime(Math.floor((Date.now() - started) / 1000));
      if (!reduced) setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [reduced]);

  // Arrow keys move the cursor, Enter opens: the table behaves like a real one.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!tableRef.current?.contains(document.activeElement)) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, rows.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter" && rows[selected]) {
        window.location.href = `/projects/${rows[selected].slug}`;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rows, selected]);

  const clock = `${String(Math.floor(uptime / 3600)).padStart(2, "0")}:${String(
    Math.floor((uptime % 3600) / 60)
  ).padStart(2, "0")}:${String(uptime % 60).padStart(2, "0")}`;

  const active = rows[selected];

  return (
    <section className="py-14">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="filter by name, problem, or technology"
          aria-label="Filter processes"
          className="min-w-[15rem] flex-1 border border-line bg-transparent px-4 py-2.5 font-mono text-data text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-line-bright"
        />
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`border px-3 py-2 font-mono text-label uppercase transition-colors ${
              category === c
                ? "border-line-bright bg-panel text-ink"
                : "border-line text-ink-dim hover:border-line-bright hover:text-ink"
            }`}
          >
            {c === "all" ? "all" : CATEGORY_SHORT[c]}
          </button>
        ))}
      </div>

      <div className="border border-line bg-graphite/50">
        {/* Status bar, like the header of a real monitor */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-line px-4 py-2.5 font-mono text-label uppercase text-ink-faint">
          <span>
            <span className="text-ink-dim">orbit</span>-monitor
          </span>
          <span>
            uptime <span className="tabular-nums text-ink-dim">{clock}</span>
          </span>
          <span>
            processes <span className="tabular-nums text-ink-dim">{rows.length}</span>/
            <span className="tabular-nums">{projects.length}</span>
          </span>
          <span className="ml-auto hidden sm:inline">↑↓ move · enter open</span>
        </div>

        <div
          ref={tableRef}
          tabIndex={0}
          role="grid"
          aria-label="Projects"
          className="overflow-x-auto outline-none focus-visible:ring-1 focus-visible:ring-line-bright"
        >
          <table className="w-full min-w-[46rem] border-collapse font-mono text-data">
            <thead>
              <tr className="border-b border-line text-label uppercase text-ink-faint">
                <th className="px-4 py-2 text-left font-normal">pid</th>
                <th className="px-2 py-2 text-left font-normal">system</th>
                <th className="px-2 py-2 text-left font-normal">cat</th>
                <th className="px-2 py-2 text-left font-normal">status</th>
                <th className="px-2 py-2 text-left font-normal">depth</th>
                <th className="px-2 py-2 text-left font-normal">stack</th>
                <th className="px-4 py-2 text-left font-normal">summary</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => {
                const isActive = i === selected;
                const live = reduced ? 0 : (Math.sin(tick * 0.9 + seedOf(p.slug) * 6.28) + 1) / 2;
                return (
                  <tr
                    key={p.slug}
                    onMouseEnter={() => setSelected(i)}
                    onClick={() => (window.location.href = `/projects/${p.slug}`)}
                    className={`cursor-pointer border-b border-line/60 transition-colors last:border-b-0 ${
                      isActive ? "bg-panel" : "hover:bg-panel/60"
                    }`}
                  >
                    <td className="px-4 py-2.5 tabular-nums text-ink-faint">
                      {String(i + 1).padStart(3, "0")}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2.5">
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="led h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: ACCENT[p.category], color: ACCENT[p.category] }}
                        />
                        <span className={isActive ? "text-ink" : "text-ink-dim"}>
                          {p.title}
                        </span>
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-ink-faint">{CATEGORY_SHORT[p.category]}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-ink-dim">
                      {STATUS_LABEL[p.status] ?? p.status}
                    </td>
                    <td className="px-2 py-2.5">
                      <Bar value={depthOf(p)} live={live} />
                    </td>
                    <td className="px-2 py-2.5 tabular-nums text-ink-faint">
                      {String(p.techStack.length).padStart(2, "0")}
                    </td>
                    <td className="max-w-[22rem] truncate px-4 py-2.5 text-ink-faint">
                      {p.oneLiner}
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-dim">
                    no processes match that filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail pane for the row under the cursor */}
        {active && (
          <div className="grid gap-x-8 gap-y-3 border-t border-line px-4 py-4 sm:grid-cols-[8rem_1fr]">
            <span className="font-mono text-label uppercase text-ink-faint">selected</span>
            <span className="font-mono text-data text-ink">
              {active.title}
              <span className="text-ink-faint"> · /projects/{active.slug}</span>
            </span>

            <span className="font-mono text-label uppercase text-ink-faint">stack</span>
            <span className="font-mono text-data text-ink-dim">
              {active.techStack.join(" · ")}
            </span>

            {active.liveUrl && (
              <>
                <span className="font-mono text-label uppercase text-ink-faint">live</span>
                <a
                  href={active.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-data text-ink underline underline-offset-4"
                >
                  {active.liveUrl.replace(/^https?:\/\//, "")}
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
