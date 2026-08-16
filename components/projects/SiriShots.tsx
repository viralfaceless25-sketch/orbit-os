/*
  Two real screenshots from the phone, not mockups.

  They are here because they answer the question the write-up cannot: what
  actually triggers this. One shows the Action Button bound to the Shortcut,
  the other shows the moment it is listening. Between them a visitor can see
  that the entry point is a real, ordinary iOS affordance rather than an app
  that had to be installed.
*/

const SHOTS = [
  {
    src: "/projects/siri-mac-agent/action-button.webp",
    width: 778,
    height: 1600,
    alt: "iPhone Action Button settings, set to run the Shortcut named Mac.",
    label: "The trigger",
    caption:
      "The Action Button is bound to a Shortcut called Mac. Holding it is the whole entry point — no app to install, and the Shortcut's name is the only wake vocabulary iOS allows.",
  },
  {
    src: "/projects/siri-mac-agent/now-listening.webp",
    width: 1200,
    height: 908,
    alt: "The Shortcut listening on iPhone, showing a stop button and the Shortcuts icon in the Dynamic Island.",
    label: "Push to talk",
    caption:
      "Held down, it captures the phrase and hands the dictated text straight to the Mac. Everything after this point happens on the computer.",
  },
];

export function SiriShots() {
  return (
    <section>
      <h2 className="font-mono text-label uppercase text-ink-faint">From the phone</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
        {SHOTS.map((shot) => (
          <figure
            key={shot.src}
            className="flex flex-col border border-line bg-graphite/50"
          >
            <div className="flex items-center justify-between border-b border-line px-3 py-2 font-mono text-label uppercase text-ink-faint">
              <span>{shot.label}</span>
              <span className="text-ink-dim">iOS</span>
            </div>

            {/* Centred on a dark ground: these are phone captures with their own
                black edges, so stretching them to fill would crop the subject. */}
            <div className="flex flex-1 items-center justify-center bg-graphite/60 p-3 sm:p-4">
              <img
                src={shot.src}
                alt={shot.alt}
                width={shot.width}
                height={shot.height}
                loading="lazy"
                decoding="async"
                className="h-auto max-h-[26rem] w-auto max-w-full border border-line"
              />
            </div>

            <figcaption className="mt-auto border-t border-line px-3 py-3 text-xs leading-relaxed text-ink-dim sm:text-sm">
              {shot.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
