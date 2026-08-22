/*
  Atmosphere, and one idea the diagrams cannot carry.

  These are illustrations rather than documentation — nothing in them is a
  screen capture, and every screen in shot is dark on purpose, so none of them
  can be mistaken for evidence of what the software looks like. They are here
  for the thing the schematics leave out: what using this is actually like,
  which is holding a button in a dark room and then walking away from the
  machine while it works.
*/

const HERO = {
  src: "/projects/siri-mac-agent/scene-press.webp",
  alt: "A hand holding a phone in a dim room, thumb resting on the side button.",
  caption:
    "Hold the Action Button, say the thing, let go. That is the entire interface — there is no app, and iOS gives a third party no way to keep a microphone open.",
};

const SCENES = [
  {
    src: "/projects/siri-mac-agent/scene-away.webp",
    alt: "A dim home office seen from across the room, an empty chair pushed back from a desk.",
    label: "Nobody at the keyboard",
    caption:
      "The Builder writes and runs software with no one watching, which is why it is confined to one directory and why anything substantial runs detached and reports back by notification.",
  },
  {
    src: "/projects/siri-mac-agent/scene-night.webp",
    alt: "An open laptop beside a window at night, its screen dark and facing away.",
    label: "Awake, or not",
    caption:
      "The first two tiers work with the screen locked. Only the keyboard and vision tiers need the Mac awake, which is the real reason the CLI path is preferred over driving the interface.",
  },
];

export function SiriScenes() {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-label uppercase text-ink-faint">In use</h2>
        <span className="font-mono text-label uppercase text-ink-faint">Illustration</span>
      </div>

      <figure className="mt-4 border border-line bg-graphite/50">
        <img
          src={HERO.src}
          alt={HERO.alt}
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
        <figcaption className="border-t border-line px-3 py-3 text-xs leading-relaxed text-ink-dim sm:px-4 sm:text-sm">
          {HERO.caption}
        </figcaption>
      </figure>

      <div className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
        {SCENES.map((s) => (
          <figure key={s.src} className="flex flex-col border border-line bg-graphite/50">
            <div className="border-b border-line px-3 py-2 font-mono text-label uppercase text-ink-faint">
              {s.label}
            </div>
            <img
              src={s.src}
              alt={s.alt}
              width={1600}
              height={900}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
            <figcaption className="mt-auto border-t border-line px-3 py-3 text-xs leading-relaxed text-ink-dim sm:text-sm">
              {s.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
