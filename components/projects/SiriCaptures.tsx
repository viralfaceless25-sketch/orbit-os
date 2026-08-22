/*
  Real output from the running daemon.

  These replaced a set of generated room photographs, which looked the part
  and showed nothing: a dark desk proves no more about this system than a
  stock photo of a keyboard proves about a compiler. What is worth showing is
  what the thing actually answers.

  Every line below was produced by POSTing to the live daemon on this machine
  and keeping what came back — the battery figure, the disk figure, the list of
  running apps, the refusal. Nothing is typed in by hand or imagined, which is
  the whole reason they earn a place on the page.
*/

const CAPTURES = [
  {
    src: "/projects/siri-mac-agent/cap-live.webp",
    alt: "Terminal output: three voice requests answered by the daemon, showing which destination each was routed to.",
    caption:
      "Three requests against the running daemon. The first two matched a pattern and answered from a single CLI call, so no model was involved at all; the third needed the Operator, which read the real window list back.",
  },
  {
    src: "/projects/siri-mac-agent/cap-phrasing.webp",
    alt: "Terminal output comparing the raw pmset battery line with the sentence the agent speaks instead.",
    caption:
      "The fast path is fast because nothing rewrites the output — which is a problem when the output is pmset. Read aloud, the raw line is useless, so each fast answer has a formatter that degrades back to the raw text if parsing fails.",
  },
  {
    src: "/projects/siri-mac-agent/cap-safety.webp",
    alt: "Terminal output: a delete request declined, above the safe, confirm, and blocked command tiers.",
    caption:
      "Deletions are checked before they run. The blocked set has no override path at all, precisely because any override would itself be reachable by voice — the one thing an attacker with a speaker would go looking for.",
  },
];

export function SiriCaptures() {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-label uppercase text-ink-faint">What it answers</h2>
        <span className="font-mono text-label uppercase text-ink-faint">Live daemon</span>
      </div>

      <div className="mt-4 space-y-3 sm:space-y-4">
        {CAPTURES.map((c) => (
          <figure key={c.src} className="border border-line bg-graphite/50">
            <img
              src={c.src}
              alt={c.alt}
              width={1600}
              height={620}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
            <figcaption className="border-t border-line px-3 py-3 text-xs leading-relaxed text-ink-dim sm:px-4 sm:text-sm">
              {c.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
