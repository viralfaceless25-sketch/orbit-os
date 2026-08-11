import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  OSPA_SYSTEM_PROMPT,
  MAX_MESSAGE_CHARS,
  MAX_HISTORY_TURNS,
} from "@/lib/ospa-knowledge";

/*
  Public chat endpoint. Anyone on the internet can reach this, and every call
  spends the site owner's API budget, so the limits below are the point of the
  file, not an afterthought:

    - short replies (max_tokens) and low effort keep per-call cost small
    - history is truncated server-side so a client cannot grow the prompt
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

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
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

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "OSPA is not connected yet. Use the Start a Project page to reach Keyush directly.",
      },
      { status: 503 }
    );
  }

  let body: { messages?: ChatTurn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const history = Array.isArray(body.messages) ? body.messages : [];
  if (history.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  const latest = history[history.length - 1];
  if (latest.role !== "user" || typeof latest.content !== "string" || !latest.content.trim()) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }
  if (latest.content.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: `Keep messages under ${MAX_MESSAGE_CHARS} characters.` },
      { status: 400 }
    );
  }

  // Trust only the shape, never the length: rebuild the transcript ourselves.
  const trimmed = history.slice(-MAX_HISTORY_TURNS).map((turn) => ({
    role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: String(turn.content).slice(0, MAX_MESSAGE_CHARS),
  }));

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: OSPA_SYSTEM_PROMPT,
          // The prompt is identical on every call, so cache it.
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: { effort: "low" },
      messages: trimmed,
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({
        reply: "I can't help with that one. Ask me about Keyush's work instead.",
      });
    }

    const reply = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!reply) {
      return NextResponse.json({
        reply: "I don't have an answer for that. Try the Start a Project page.",
      });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "OSPA is busy right now. Try again shortly." },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("OSPA: invalid ANTHROPIC_API_KEY");
      return NextResponse.json({ error: "OSPA is unavailable." }, { status: 503 });
    }
    console.error("OSPA request failed:", err);
    return NextResponse.json({ error: "OSPA could not answer that." }, { status: 502 });
  }
}
