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
  per-message cost. That default only works where Ollama is reachable, which
  means local development — a deployed serverless container has no Ollama on
  its own loopback, so the hosted site sets OSPA_PROVIDER=groq instead.

  Anthropic is opt-in only, so a missing or misread env var can never silently
  start spending money.

  Set OSPA_PROVIDER to pick:
    ollama    (default) local Ollama, free, local machine only
    groq      hosted open models on Groq's free tier, free, reachable anywhere
    anthropic hosted Claude, costs money per message
    off       assistant disabled, UI tells visitors to use the contact page
*/

export type Provider = "ollama" | "groq" | "anthropic" | "off";

export type Turn = { role: "user" | "assistant"; content: string };

export function activeProvider(): Provider {
  const raw = (process.env.OSPA_PROVIDER ?? "ollama").toLowerCase();
  if (raw === "groq" || raw === "anthropic" || raw === "off") return raw;
  return "ollama";
}

/** Providers that emit tokens as they are produced rather than in one lump. */
export function providerStreams(p: Provider = activeProvider()): boolean {
  return p === "ollama" || p === "groq";
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
 * Reads a response body line by line, so a parser never sees half a line even
 * when the transport splits a chunk mid-character.
 */
async function* readLines(res: Response): AsyncGenerator<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffered = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffered += decoder.decode(value, { stream: true });
      const lines = buffered.split("\n");
      buffered = lines.pop() ?? "";
      for (const line of lines) yield line;
    }
    if (buffered) yield buffered;
  } finally {
    reader.releaseLock();
  }
}

/** Ollama's own protocol: one JSON object per line. */
async function* ollamaPieces(res: Response): AsyncGenerator<string> {
  for await (const line of readLines(res)) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line) as { message?: { content?: string } };
      if (parsed.message?.content) yield parsed.message.content;
    } catch {
      // A malformed line is not worth failing the whole reply over.
    }
  }
}

/** OpenAI-compatible server-sent events, which is what Groq speaks. */
async function* ssePieces(res: Response): AsyncGenerator<string> {
  for await (const line of readLines(res)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;

    const payload = trimmed.slice(5).trim();
    if (payload === "[DONE]") return;

    try {
      const parsed = JSON.parse(payload) as {
        choices?: { delta?: { content?: string } }[];
      };
      const piece = parsed.choices?.[0]?.delta?.content;
      if (piece) yield piece;
    } catch {
      // Same reasoning as above: skip the line, keep the reply.
    }
  }
}

/**
 * Wraps a token source in the sanitizer.
 *
 * Every backend's output goes through the same repair pass, so a hosted model
 * cannot emit an invented link that a local one would have had rewritten.
 */
function sanitizingStream(pieces: AsyncGenerator<string>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  // Holds text that may still be mid-path, so a URL is never emitted before it
  // can be validated. Flushed at the last safe boundary.
  let pending = "";

  return new ReadableStream({
    async start(controller) {
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
        for await (const piece of pieces) emit(piece, false);
        emit("", true);
      } finally {
        controller.close();
      }
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

  return sanitizingStream(ollamaPieces(res));
}

/** Streams from Groq. Same contract as streamOllama, different wire format. */
export async function streamGroq(turns: Turn[]): Promise<ReadableStream<Uint8Array>> {
  const res = await groqFetch(turns, true);
  return sanitizingStream(ssePieces(res));
}

/** Streams from whichever backend is configured. */
export async function streamOspa(turns: Turn[]): Promise<ReadableStream<Uint8Array>> {
  return activeProvider() === "groq" ? streamGroq(turns) : streamOllama(turns);
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

/*
  Groq: OpenAI-compatible, hosted, free tier, no card. This is what the deployed
  site runs on, because a serverless container cannot reach the Ollama instance
  on Keyush's machine.

  The model is env-overridable because Groq retires model IDs on its own
  schedule and a stale default would 404 the whole assistant. Only production
  model IDs belong here; preview ones can vanish at short notice.
*/
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

/** Hosted and fast, so a slow answer means something is wrong, not busy. */
const GROQ_TIMEOUT_MS = 30_000;

async function groqFetch(turns: Turn[], stream: boolean): Promise<Response> {
  if (!process.env.GROQ_API_KEY) {
    throw new ProviderError("OSPA is not configured.", 503);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: GROQ_MODEL,
        stream,
        // Same reasoning as the local model: this assistant recites known
        // facts. Creative sampling here shows up as invented projects.
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 300,
        messages: [{ role: "system", content: OSPA_SYSTEM_PROMPT }, ...turns],
      }),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ProviderError("OSPA took too long to answer. Try a shorter question.", 504);
    }
    throw new ProviderError("OSPA is offline right now.", 503);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");

    // A rejected key and an exhausted free tier are the two failures worth
    // naming: one is a deploy mistake, the other is temporary and self-heals.
    if (res.status === 401 || res.status === 403) {
      console.error(`Groq rejected the API key: ${detail.slice(0, 200)}`);
      throw new ProviderError("OSPA is not configured.", 503);
    }
    if (res.status === 429) {
      throw new ProviderError("OSPA is busy right now. Try again in a moment.", 429);
    }
    if (res.status === 404) {
      console.error(`Groq has no model "${GROQ_MODEL}": ${detail.slice(0, 200)}`);
      throw new ProviderError("OSPA's model is unavailable.", 503);
    }

    console.error(`Groq returned ${res.status}: ${detail.slice(0, 300)}`);
    throw new ProviderError("OSPA could not answer that.", 502);
  }

  return res;
}

async function askGroq(turns: Turn[]): Promise<string> {
  const res = await groqFetch(turns, false);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return (data.choices?.[0]?.message?.content ?? "").trim();
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
    case "groq":
      return askGroq(turns);
    case "anthropic":
      return askAnthropic(turns);
    case "ollama":
    default:
      return askOllama(turns);
  }
}
