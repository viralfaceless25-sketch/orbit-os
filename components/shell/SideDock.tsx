"use client";

/*
  Instrument rail, not a fake app dock. Each entry is a measurement tick with a
  label that reveals on hover. The rail reads as a calibrated scale down the
  page edge rather than a row of mystery icons.
*/
const ITEMS = [
  { label: "Command Center", href: "/" },
  { label: "Projects", href: "/#projects" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "README", href: "/readme" },
  { label: "Contact", href: "/start-a-project" },
] as const;

export function SideDock() {
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
        >
          {/* Tick: short by default, extends on hover/focus like a gauge mark */}
          <span
            aria-hidden
            className="h-px w-4 bg-line-bright transition-all duration-300 ease-instrument group-hover:w-8 group-hover:bg-ink group-focus-visible:w-8 group-focus-visible:bg-ink"
          />
          <span className="font-mono text-label uppercase text-ink-faint tabular-nums transition-colors duration-300 group-hover:text-ink group-focus-visible:text-ink">
            <span className="mr-2 opacity-60">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              {item.label}
            </span>
          </span>
        </a>
      ))}
    </nav>
  );
}
