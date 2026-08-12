"use client";
import { useEffect, useRef, useState } from "react";
import { MAX_MESSAGE_CHARS } from "@/lib/ospa-knowledge";

type Turn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What kind of work does Keyush do?",
  "Show me an AI project",
  "Has he built an online store?",
];

const GREETING =
  "I'm OSPA, a small web edition of the macOS companion Keyush built. Ask me about his work.";

export function OspaChat() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, pending]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function send(text: string) {
    const message = text.trim();
    if (!message || pending) return;

    const next: Turn[] = [...turns, { role: "user", content: message }];
    setTurns(next);
    setDraft("");
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/ospa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "OSPA could not answer that.");
        return;
      }

      // JSON when a hosted provider answered in one shot; a plain text stream
      // when the local model is producing tokens as it goes.
      const isStream = !res.headers.get("Content-Type")?.includes("application/json");

      if (!isStream) {
        const data = await res.json();
        setTurns([...next, { role: "assistant", content: data.reply }]);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("OSPA returned nothing.");
        return;
      }

      const decoder = new TextDecoder();
      let assembled = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        assembled += decoder.decode(value, { stream: true });

        // Drop the waiting indicator as soon as real text exists, otherwise
        // "Thinking" sits under a reply that is already streaming.
        if (assembled) setPending(false);

        // Replace the trailing assistant turn as it grows.
        setTurns([...next, { role: "assistant", content: assembled }]);
      }

      if (!assembled.trim()) {
        setTurns(next);
        setError("OSPA had nothing to say. Try rephrasing.");
      }
    } catch {
      setError("Could not reach OSPA. Check your connection.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close OSPA" : "Ask OSPA"}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full border border-line-bright bg-panel px-4 py-3 font-mono text-label uppercase text-ink shadow-lg backdrop-blur transition-colors hover:border-ink"
      >
        <span aria-hidden className="led h-1.5 w-1.5 rounded-full bg-accent-ai text-accent-ai" />
        {open ? "Close" : "Ask OSPA"}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Chat with OSPA"
          className="fixed bottom-20 right-5 z-50 flex h-[min(26rem,calc(100dvh-10rem))] w-[min(22rem,calc(100vw-2.5rem))] flex-col border border-line bg-graphite/95 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
            <span aria-hidden className="led h-1.5 w-1.5 rounded-full bg-accent-ai text-accent-ai" />
            <span className="font-mono text-label uppercase text-ink">OSPA</span>
            <span className="ml-auto font-mono text-label uppercase text-ink-faint">
              Web edition
            </span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <p className="text-sm leading-relaxed text-ink-dim">{GREETING}</p>

            {turns.length === 0 && (
              <ul className="space-y-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <li key={s}>
                    <button
                      onClick={() => send(s)}
                      className="w-full border border-line px-3 py-2 text-left text-sm text-ink-dim transition-colors hover:border-line-bright hover:text-ink"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {turns.map((turn, i) => (
              <div key={i}>
                <p className="mb-1 font-mono text-label uppercase text-ink-faint">
                  {turn.role === "user" ? "You" : "OSPA"}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {turn.content}
                </p>
              </div>
            ))}

            {pending && (
              <p className="font-mono text-label uppercase text-ink-faint">Thinking…</p>
            )}
            {error && <p className="text-sm text-accent-exp">{error}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex items-center gap-2 border-t border-line px-3 py-3"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_MESSAGE_CHARS}
              placeholder="Ask about his work"
              aria-label="Message OSPA"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            <button
              type="submit"
              disabled={pending || !draft.trim()}
              className="shrink-0 font-mono text-label uppercase text-ink-dim transition-colors enabled:hover:text-ink disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
