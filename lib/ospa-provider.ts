import { OSPA_SYSTEM_PROMPT } from "./ospa-knowledge";
import { projects } from "@/data/projects";

/*
  Link safety is enforced here rather than left to the prompt. A small model
  will occasionally build a project path out of the project's title
  ("/projects/alberts-gold-and-silver" instead of "/projects/gold"), which hands
  a visitor a dead link. Prompt wording reduces that but cannot guarantee it, so
  any project path the model emits is checked against the real slugs and
  rewritten to the projects index when it does not exist.
*/
const VALID_SLUGS = new Set(projects.map((p) => p.slug));
const PROJECT_PATH = /\/projects\/([a-z0-9-]+)/gi;

/** Every external address the assistant is allowed to say out loud. */
const ALLOWED_HOSTS = new Set(
  projects
    .flatMap((p) => [p.liveUrl, p.githubUrl])
    .filter((u): u is string => Boolean(u))
    .map((u) => {
      try {
        return new URL(u).host.replace(/^www\./, "").toLowerCase();
      } catch {
        return "";
      }
    })
    .filter(Boolean)
);

const EXTERNAL_URL = /https?:\/\/[^\s)\]<>"']+/gi;

/**
 * Removes any web address that isn't a real one from the registry.
 *
 * Small models invent plausible-looking URLs by combining a repository name
 * with a host they saw elsewhere in the prompt (megaicesite + netlify.app).
 * Prompt wording reduces this but cannot prevent it, so the allowlist is
 * enforced here.
 */
function repairExternalUrls(text: string): string {
  return text.replace(EXTERNAL_URL, (match) => {
    const trimmed = match.replace(/[.,;:]+$/, "");
    try {
      const host = new URL(trimmed).host.replace(/^www\./, "").toLowerCase();
      return ALLOWED_HOSTS.has(host) ? match : "";
    } catch {
      return "";
    }
  });
}

/** Markdown reaches the widget as literal characters, so flatten it to prose. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]*)\)/g, "$1 $2") // [label](url) -> label url
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|\s)\*([^*\n]+)\*/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "");
}

export function repairProjectLinks(text: string): string {
  return text.replace(PROJECT_PATH, (match, slug: string) =>
    VALID_SLUGS.has(slug.toLowerCase()) ? match : "/projects"
  );
}

/** Everything the model writes passes through here before a visitor sees it. */
export function sanitizeReply(text: string): string {
  return repairExternalUrls(repairProjectLinks(stripMarkdown(text)))
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\(\s*\)/g, "")
    .replace(/[ \t]+([.,;:])/g, "$1");
}

/*
  OSPA's model backend.

  Default is Ollama on the machine running the site: free, no API key, no
  per-message cost. Anthropic is opt-in only, so a missing or misread env var
  can never silently start spending money.

  Set OSPA_PROVIDER to pick:
    ollama    (default) local Ollama, free
    anthropic hosted Claude, costs money per message
    off       assistant disabled, UI tells visitors to use the contact page
*/

export type Provider = "ollama" | "anthropic" | "off";

export type Turn = { role: "user" | "assistant"; content: string };

export function activeProvider(): Provider {
  const raw = (process.env.OSPA_PROVIDER ?? "ollama").toLowerCase();
  if (raw === "anthropic" || raw === "off") return raw;
  return "ollama";
}

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
/*
  A 3B general model, not the 14B coder. This assistant recites facts from a
  fixed prompt rather than reasoning, and the smaller model benchmarked ~3x
  faster on the same question with no loss of accuracy. Override with
  OLLAMA_MODEL if a larger one is ever warranted.
*/
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:3b";

/** A local 14B model needs real time to answer; keep the ceiling generous. */
const OLLAMA_TIMEOUT_MS = 60_000;

function ollamaBody(turns: Turn[], stream: boolean) {
  return JSON.stringify({
    model: OLLAMA_MODEL,
    stream,
    // Keep the model resident between messages. Without this Ollama unloads it
    // and every visitor pays several seconds of load before a single token.
    keep_alive: "30m",
    messages: [{ role: "system", content: OSPA_SYSTEM_PROMPT }, ...turns],
    options: {
      // Low temperature: this assistant recites known facts, it does not
      // brainstorm. Creative sampling here shows up as invented projects.
      temperature: 0.2,
      top_p: 0.9,
      num_predict: 300,
      num_ctx: 8192,
    },
  });
}

/**
 * Streams the answer token by token. A local model takes many seconds to finish
 * a reply, which reads as a hang if nothing appears until it is done; streaming
 * puts the first words on screen almost immediately.
 */
export async function streamOllama(turns: Turn[]): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: ollamaBody(turns, true),
  }).catch(() => null);

  if (!res || !res.ok || !res.body) {
    if (res?.status === 404) {
      throw new ProviderError(
        `OSPA's model (${OLLAMA_MODEL}) is not installed. Run: ollama pull ${OLLAMA_MODEL}`,
        503
      );
    }
    throw new ProviderError(
      "OSPA is offline right now. It runs on a local model that isn't reachable.",
      503
    );
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffered = "";

  // Holds text that may still be mid-path, so a URL is never emitted before it
  // can be validated. Flushed at the last whitespace, which is a safe boundary.
  let pending = "";

  return new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader();

      /*
        Flush on line boundaries, not word boundaries: a markdown construct
        ("**Mega Ice**", "[label](url)") contains spaces, so cutting at a space
        would hand the sanitizer half a construct and it would survive as
        literal punctuation. Lines are a safe unit, and a very long line is
        force-flushed so a single-paragraph answer still streams.
      */
      const FORCE_FLUSH_AT = 400;

      const emit = (piece: string, final: boolean) => {
        pending += piece;

        if (final) {
          if (pending) controller.enqueue(encoder.encode(sanitizeReply(pending)));
          pending = "";
          return;
        }

        let cut = pending.lastIndexOf("\n");
        if (cut === -1 && pending.length > FORCE_FLUSH_AT) {
          cut = pending.lastIndexOf(" ");
        }
        if (cut === -1) return;

        const ready = pending.slice(0, cut + 1);
        pending = pending.slice(cut + 1);
        controller.enqueue(encoder.encode(sanitizeReply(ready)));
      };

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          // Ollama emits newline-delimited JSON; a chunk can split a line.
          buffered += decoder.decode(value, { stream: true });
          const lines = buffered.split("\n");
          buffered = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line) as {
                message?: { content?: string };
                done?: boolean;
              };
              const piece = parsed.message?.content;
              if (piece) emit(piece, false);
            } catch {
              // A malformed line is not worth failing the whole reply over.
            }
          }
        }
        emit("", true);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });
}

async function askOllama(turns: Turn[]): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: ollamaBody(turns, false),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ProviderError("OSPA took too long to answer. Try a shorter question.", 504);
    }
    throw new ProviderError(
      "OSPA is offline right now. It runs on a local model that isn't reachable.",
      503
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    // A missing model is the most common setup failure; name it explicitly
    // rather than reporting a generic upstream error.
    if (res.status === 404) {
      throw new ProviderError(
        `OSPA's model (${OLLAMA_MODEL}) is not installed. Run: ollama pull ${OLLAMA_MODEL}`,
        503
      );
    }
    console.error(`Ollama returned ${res.status}: ${detail.slice(0, 300)}`);
    throw new ProviderError("OSPA could not answer that.", 502);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  return (data.message?.content ?? "").trim();
}

async function askAnthropic(turns: Turn[]): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ProviderError("OSPA is not configured.", 503);
  }

  // Imported lazily so the SDK is never loaded (and no key is ever read) on the
  // default free path.
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-opus-5",
    max_tokens: 2048,
    system: [
      { type: "text", text: OSPA_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    output_config: { effort: "low" },
    messages: turns,
  });

  if (response.stop_reason === "refusal") {
    return "I can't help with that one. Ask me about Keyush's work instead.";
  }

  return response.content
    .filter((b): b is { type: "text"; text: string; citations: null } => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

export async function askOspa(turns: Turn[]): Promise<string> {
  switch (activeProvider()) {
    case "off":
      throw new ProviderError(
        "OSPA is switched off. Use the Start a Project page to reach Keyush.",
        503
      );
    case "anthropic":
      return askAnthropic(turns);
    case "ollama":
    default:
      return askOllama(turns);
  }
}
