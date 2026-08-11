import { NextRequest, NextResponse } from "next/server";
import { MAX_MESSAGE_CHARS, MAX_HISTORY_TURNS } from "@/lib/ospa-knowledge";
import {
  askOspa,
  streamOllama,
  activeProvider,
  ProviderError,
  type Turn,
} from "@/lib/ospa-provider";

/*
  Public chat endpoint. Anyone on the internet can reach this, so the limits
  below are the point of the file, not an afterthought:

    - history is truncated server-side so a client cannot grow the prompt
    - message length is capped
    - a per-IP window caps how often one visitor can call it

  The rate limiter is in-process. On serverless it resets whenever the instance
  recycles and is not shared between instances, so it raises the cost of casual
  abuse but is not a hard guarantee. Put a real limiter (KV, Redis, the
  platform's own WAF) in front of this before promoting the site widely.
*/

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    buckets.forEach((v, k) => {
      if (now > v.resetAt) buckets.delete(k);
    });
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many messages. Try again in ${limit.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  if (activeProvider() === "off") {
    return NextResponse.json(
      { error: "OSPA is switched off. Use the Start a Project page to reach Keyush." },
      { status: 503 }
    );
  }

  let body: { messages?: Turn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const history = Array.isArray(body.messages) ? body.messages : [];
  const latest = history[history.length - 1];

  if (
    !latest ||
    latest.role !== "user" ||
    typeof latest.content !== "string" ||
    !latest.content.trim()
  ) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }
  if (latest.content.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: `Keep messages under ${MAX_MESSAGE_CHARS} characters.` },
      { status: 400 }
    );
  }

  // Trust only the shape, never the length: rebuild the transcript ourselves.
  const trimmed: Turn[] = history.slice(-MAX_HISTORY_TURNS).map((turn) => ({
    role: turn.role === "assistant" ? "assistant" : "user",
    content: String(turn.content).slice(0, MAX_MESSAGE_CHARS),
  }));

  try {
    // The local model answers slowly enough that waiting for the full reply
    // reads as a hang. Stream it so text appears as it is produced.
    if (activeProvider() === "ollama") {
      const stream = await streamOllama(trimmed);
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Accel-Buffering": "no",
        },
      });
    }

    const reply = await askOspa(trimmed);
    if (!reply) {
      return NextResponse.json({
        reply: "I don't have an answer for that. Try the Start a Project page.",
      });
    }
    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof ProviderError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("OSPA request failed:", err);
    return NextResponse.json({ error: "OSPA could not answer that." }, { status: 502 });
  }
}
