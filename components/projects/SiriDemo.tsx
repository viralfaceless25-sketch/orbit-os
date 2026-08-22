"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/*
  A replay of the agent's actual pipeline.

  Every utterance, route, command and reply below is taken from the project
  itself: the fast-path patterns and the tier names come from the router and
  the safety policy, and the commands are the ones those paths really run.
  Nothing here is invented to look impressive, and the panel says plainly that
  it is a replay rather than a live connection to a machine — a demo that
  implies a socket it does not have is worse than no demo.
*/

type Route = "FAST" | "OPERATOR" | "CLAUDE" | "BUILDER" | "BLOCKED";

type Step = { label: string; value: string };

type Exchange = {
  said: string;
  route: Route;
  why: string;
  steps: Step[];
  reply: string;
};

const ROUTE_COLOR: Record<Route, string> = {
  FAST: "var(--color-accent-oss)",
  OPERATOR: "var(--color-accent-ai)",
  CLAUDE: "var(--color-accent-web)",
  BUILDER: "var(--color-accent-client)",
  BLOCKED: "var(--color-accent-exp)",
};

const EXCHANGES: Exchange[] = [
  {
    said: "What's my battery",
    route: "FAST",
    why: "Pattern matched. No model call at all.",
    steps: [
      { label: "match", value: "battery|charge|power" },
      { label: "run", value: "pmset -g batt" },
    ],
    reply: "82 percent, not charging.",
  },
  {
    said: "Turn on Bluetooth",
    route: "OPERATOR",
    why: "Tier 1: a CLI path exists, so it never touches the interface.",
    steps: [
      { label: "tool", value: "set_system_setting(bluetooth, on)" },
      { label: "run", value: "blueutil -p 1" },
      { label: "tier", value: "SAFE — runs immediately" },
    ],
    reply: "Bluetooth is on.",
  },
  {
    said: "Find my budget spreadsheet",
    route: "OPERATOR",
    why: "Spotlight from the command line. Returns a real absolute path.",
    steps: [
      { label: "tool", value: "find_files(budget)" },
      { label: "run", value: "mdfind -name budget" },
      { label: "guard", value: "~/.ssh, ~/.aws, ~/.gnupg never returned" },
    ],
    reply: "Found Budget 2026.numbers in your Documents folder.",
  },
  {
    said: "Minimise the cloth terminal window",
    route: "OPERATOR",
    why: "Dictation misheard \u201cClaude\u201d. Transcription moved onto the Mac to remove the cause.",
    steps: [
      { label: "heard", value: "whisper.cpp, locally, on the GPU" },
      { label: "primed", value: "told the vocabulary before it decides" },
      { label: "tool", value: "click_menu(Terminal, Window, Minimize)" },
    ],
    reply: "Minimised the Claude terminal window.",
  },
  {
    said: "Tell Claude to fix the login bug",
    route: "CLAUDE",
    why: "Typed into the real stdin of a live session, not simulated keystrokes.",
    steps: [
      { label: "session", value: "tmux send-keys -l" },
      { label: "read", value: "tmux capture-pane" },
      { label: "shape", value: "strip ANSI, collapse paths, cap length" },
    ],
    reply: "Fixed it — the session token wasn't being refreshed.",
  },
  {
    said: "Make me a tiny site called voice demo with a dark landing page",
    route: "BUILDER",
    why: "No trigger phrase. The Operator recognises a coding request itself.",
    steps: [
      { label: "tool", value: "build_project(voice-demo)" },
      { label: "toolset", value: "Read, Write, Edit, Bash, Grep, WebSearch" },
      { label: "scope", value: "confined to the projects directory" },
      { label: "mode", value: "detached — iOS abandons a Shortcut at ~60s" },
    ],
    reply: "Starting that now. I'll notify you when it's built.",
  },
  {
    said: "Delete the old notes file",
    route: "OPERATOR",
    why: "Destructive, so it stops and asks before doing anything.",
    steps: [
      { label: "classify", value: "rm old_notes.txt" },
      { label: "tier", value: "CONFIRM — needs a spoken yes" },
    ],
    reply: "That deletes old_notes.txt. Say yes to confirm.",
  },
  {
    said: "Run sudo rm -rf /",
    route: "BLOCKED",
    why: "No override path, because any override would be reachable by voice.",
    steps: [
      { label: "classify", value: "sudo, rm -rf, diskutil erase, keychain" },
      { label: "tier", value: "BLOCKED — never runs" },
    ],
    reply: "I can't run that one.",
  },
];

const STEP_MS = 420;

export function SiriDemo() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const active = EXCHANGES[index];
  // Route badge, each step, then the reply.
  const total = active.steps.length + 2;

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const play = useCallback(
    (next: number) => {
      clear();
      setIndex(next);

      if (reduced) {
        // No staged reveal: show the whole exchange at once.
        setRevealed(EXCHANGES[next].steps.length + 2);
        return;
      }

      setRevealed(0);
      const count = EXCHANGES[next].steps.length + 2;
      for (let i = 1; i <= count; i++) {
        timers.current.push(setTimeout(() => setRevealed(i), i * STEP_MS));
      }
    },
    [clear, reduced]
  );

  useEffect(() => {
    play(0);
    return clear;
  }, [play, clear]);

  return (
    <figure className="border border-line bg-graphite/50">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-3 py-2.5 font-mono text-label uppercase text-ink-faint sm:px-4">
        <span>
          <span className="text-ink-dim">siri</span>-mac-agent
        </span>
        <span className="hidden sm:inline">iphone → tailscale → mac</span>
        <span className="ml-auto">replay</span>
      </div>

      <div className="grid gap-0 sm:grid-cols-[minmax(0,15rem)_1fr]">
        {/* What you can say. Selecting one replays what the Mac then does. */}
        <div className="border-b border-line sm:border-b-0 sm:border-r">
          <p className="px-3 pt-3 font-mono text-label uppercase text-ink-faint sm:px-4">
            Say
          </p>
          <ul className="p-2 sm:p-2.5">
            {EXCHANGES.map((ex, i) => {
              const on = i === index;
              return (
                <li key={ex.said}>
                  <button
                    onClick={() => play(i)}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-2.5 px-2 py-2 text-left text-xs outline-none transition-colors sm:text-sm ${
                      on
                        ? "bg-panel/80 text-ink"
                        : "text-ink-dim hover:bg-panel/50 hover:text-ink"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: on ? ROUTE_COLOR[ex.route] : "var(--color-line-bright)",
                      }}
                    />
                    <span className="leading-snug">{ex.said}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* What the Mac did about it. */}
        <div className="min-w-0 p-3 font-mono text-data sm:p-4">
          <p className="text-label uppercase text-ink-faint">Mac</p>

          <div className="mt-3 min-h-[13rem] space-y-2.5 sm:min-h-[11rem]">
            {revealed >= 1 && (
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="border px-2 py-0.5 text-label uppercase"
                  style={{
                    borderColor: ROUTE_COLOR[active.route],
                    color: ROUTE_COLOR[active.route],
                  }}
                >
                  {active.route}
                </span>
                <span className="text-xs text-ink-faint sm:text-data">{active.why}</span>
              </div>
            )}

            {active.steps.map((step, i) => (
              <div
                key={step.label}
                className={`grid grid-cols-[4.5rem_1fr] items-baseline gap-2 transition-opacity duration-300 ${
                  revealed >= i + 2 ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="text-label uppercase text-ink-faint">{step.label}</span>
                <span className="break-words text-ink-dim">{step.value}</span>
              </div>
            ))}

            {revealed >= total && (
              <div className="flex items-baseline gap-2.5 border-t border-line pt-3">
                <span className="shrink-0 text-label uppercase text-ink-faint">Says</span>
                <span className="font-sans text-sm leading-relaxed text-ink">
                  {active.reply}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <figcaption className="border-t border-line px-3 py-2 font-mono text-label text-ink-faint sm:px-4">
        Scripted replay. The routes, tiers and commands are the ones the agent really runs;
        this panel is not connected to a Mac.
      </figcaption>
    </figure>
  );
}
