/*
  Diagrams, not captures.

  Almost all of this project's behaviour happens in a daemon: there is nothing
  to photograph beyond an app opening. So the architecture is drawn rather than
  screenshotted. The line work was generated; every label was set from the real
  router, safety policy and tool layer, so nothing here asserts a behaviour the
  code does not have — and no image claims to be a recording of a screen.
*/

const DIAGRAMS = [
  {
    src: "/projects/siri-mac-agent/diagram-path.webp",
    alt: "Diagram: an iPhone connected to a MacBook by a single line passing through Tailscale and a bearer token.",
    caption:
      "The Shortcut posts the dictated phrase over Tailscale to a daemon running under launchd. Two independent gates stand in front of it: device auth on the network, and a bearer token on the request.",
  },
  {
    src: "/projects/siri-mac-agent/diagram-router.webp",
    alt: "Diagram: one incoming line meeting a junction and splitting into three destinations.",
    caption:
      "Every utterance is routed once. Questions like battery level match a pattern and answer from a single CLI call without touching a model at all; the rest goes to the Operator agent or to a live Claude Code session, which are kept apart so a battery reading never spends coding context.",
  },
  {
    src: "/projects/siri-mac-agent/diagram-tiers.webp",
    alt: "Diagram: four horizontal bars of decreasing length, the topmost highlighted.",
    caption:
      "The Operator works down four tiers and stops at the first that can do the job. Most requests never leave the first one, which is why it is more reliable than driving the interface: a command cannot land on the wrong button.",
  },
];

export function SiriDiagrams() {
  return (
    <section>
      <h2 className="font-mono text-label uppercase text-ink-faint">How it works</h2>

      <div className="mt-4 space-y-3 sm:space-y-4">
        {DIAGRAMS.map((d) => (
          <figure key={d.src} className="border border-line bg-graphite/50">
            <img
              src={d.src}
              alt={d.alt}
              width={1400}
              height={788}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
            <figcaption className="border-t border-line px-3 py-3 text-xs leading-relaxed text-ink-dim sm:px-4 sm:text-sm">
              {d.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
