"use client";
import { useEffect, useState } from "react";

/*
  Footer readout rather than a floating overlay. It sat on top of the builder
  profile before. Reads as the instrument's baseplate: hairline rule, data in
  mono, values right-aligned so they scan as a column.
*/
const ROWS = [
  { label: "Status", value: "Available for selected projects" },
  { label: "Currently building", value: "ORBIT OS" },
  { label: "Location", value: "Remote" },
] as const;

export function SystemStatus() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 lg:pl-24">
        <dl className="grid gap-x-8 gap-y-2 font-mono text-label uppercase sm:grid-cols-2">
          {ROWS.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-ink-faint">{row.label}</dt>
              <dd className="text-ink-dim">{row.value}</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-faint">Local time</dt>
            <dd className="text-ink-dim tabular-nums">{time}</dd>
          </div>
        </dl>

        <p className="mt-6 font-mono text-label uppercase tracking-widest text-ink-faint">
          orbitos.keyush
        </p>
      </div>
    </footer>
  );
}
