import { OSPA_SYSTEM_PROMPT } from "./ospa-knowledge";

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
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5-coder:14b";

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

  return new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader();
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
              if (piece) controller.enqueue(encoder.encode(piece));
            } catch {
              // A malformed line is not worth failing the whole reply over.
            }
          }
        }
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
