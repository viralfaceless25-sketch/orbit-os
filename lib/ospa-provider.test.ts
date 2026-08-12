import { describe, it, expect, vi, afterEach } from "vitest";
import {
  repairProjectLinks,
  sanitizeReply,
  activeProvider,
  providerStreams,
  streamGroq,
  ProviderError,
} from "./ospa-provider";
import { projects } from "@/data/projects";

describe("repairProjectLinks", () => {
  it("keeps links that point at a real project", () => {
    const slug = projects[0].slug;
    const text = `You can see it at /projects/${slug} today.`;
    expect(repairProjectLinks(text)).toBe(text);
  });

  it("rewrites a slug the model invented from a project title", () => {
    // The regression this exists for: the page for "Albert's Gold and Silver"
    // is /projects/gold, but a small model will build the path from the title.
    expect(repairProjectLinks("See /projects/alberts-gold-and-silver for more.")).toBe(
      "See /projects for more."
    );
  });

  it("repairs every bad link in a reply, leaving good ones alone", () => {
    const good = projects[0].slug;
    const out = repairProjectLinks(`Try /projects/${good} and /projects/not-real-at-all.`);
    expect(out).toContain(`/projects/${good}`);
    expect(out).not.toContain("not-real-at-all");
  });

  it("leaves the projects index and other site paths untouched", () => {
    const text = "Browse /projects or contact him at /start-a-project.";
    expect(repairProjectLinks(text)).toBe(text);
  });

  it("matches slugs case-insensitively rather than breaking the link", () => {
    const slug = projects[0].slug;
    expect(repairProjectLinks(`/projects/${slug.toUpperCase()}`)).toContain(
      slug.toUpperCase()
    );
  });
});

describe("sanitizeReply", () => {
  it("removes an invented external URL", () => {
    // The regression this exists for: the model built "megaicesite.netlify.app"
    // from the repo name plus a host it saw on another project.
    const out = sanitizeReply("Preview at https://megaicesite.netlify.app today.");
    expect(out).not.toContain("megaicesite.netlify.app");
  });

  it("keeps a real live URL from the registry", () => {
    const live = projects.find((p) => p.liveUrl)?.liveUrl as string;
    expect(sanitizeReply(`Visit ${live} now.`)).toContain(new URL(live).host);
  });

  it("keeps a real GitHub URL from the registry", () => {
    const repo = projects.find((p) => p.githubUrl)?.githubUrl as string;
    expect(sanitizeReply(`Source: ${repo}`)).toContain("github.com");
  });

  it("flattens markdown that the chat window cannot render", () => {
    const out = sanitizeReply("- **Mega Ice**: see [the site](/projects/mega-ice) `now`");
    expect(out).not.toContain("**");
    expect(out).not.toContain("](");
    expect(out).not.toContain("`");
    expect(out).toContain("Mega Ice");
    expect(out).toContain("/projects/mega-ice");
  });

  it("still repairs invented project paths", () => {
    expect(sanitizeReply("See /projects/alberts-gold-and-silver")).toContain("/projects");
    expect(sanitizeReply("See /projects/alberts-gold-and-silver")).not.toContain(
      "alberts-gold"
    );
  });
});

/** Builds a fake Groq SSE body from the token pieces a model would emit. */
function sseResponse(pieces: string[]): Response {
  const lines = pieces
    .map((p) => `data: ${JSON.stringify({ choices: [{ delta: { content: p } }] })}\n`)
    .concat("data: [DONE]\n");

  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      // Split mid-line on purpose: the transport does this, and a parser that
      // assumes whole lines per chunk drops tokens.
      const raw = lines.join("");
      controller.enqueue(encoder.encode(raw.slice(0, 17)));
      controller.enqueue(encoder.encode(raw.slice(17)));
      controller.close();
    },
  });

  return new Response(body, { status: 200, headers: { "Content-Type": "text/event-stream" } });
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out += decoder.decode(value, { stream: true });
  }
  return out;
}

describe("provider selection", () => {
  afterEach(() => {
    delete process.env.OSPA_PROVIDER;
    vi.unstubAllGlobals();
  });

  it("defaults to the local model so a deploy cannot silently spend money", () => {
    expect(activeProvider()).toBe("ollama");
  });

  it("uses groq when asked to", () => {
    process.env.OSPA_PROVIDER = "groq";
    expect(activeProvider()).toBe("groq");
    expect(providerStreams()).toBe(true);
  });

  it("falls back to the local model for an unrecognised value", () => {
    process.env.OSPA_PROVIDER = "gorq";
    expect(activeProvider()).toBe("ollama");
  });
});

describe("streamGroq", () => {
  afterEach(() => {
    delete process.env.GROQ_API_KEY;
    vi.unstubAllGlobals();
  });

  it("reassembles tokens split across transport chunks", async () => {
    process.env.GROQ_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sseResponse(["Keyush built ", "AMS.\n"])));

    expect(await collect(await streamGroq([{ role: "user", content: "hi" }]))).toContain(
      "Keyush built AMS."
    );
  });

  it("sanitizes a hosted model's output the same as a local one", async () => {
    // The guardrails existed only on the Ollama path before Groq was added.
    // A hosted model invents links too, and this is what proves it is covered.
    process.env.GROQ_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(sseResponse(["See **/projects/not-a-real-slug** at ", "https://invented.example.com\n"]))
    );

    const out = await collect(await streamGroq([{ role: "user", content: "hi" }]));
    expect(out).not.toContain("not-a-real-slug");
    expect(out).not.toContain("invented.example.com");
    expect(out).not.toContain("**");
  });

  it("reports an exhausted free tier as retryable rather than broken", async () => {
    process.env.GROQ_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("rate limited", { status: 429 })));

    await expect(streamGroq([{ role: "user", content: "hi" }])).rejects.toMatchObject({
      status: 429,
    });
  });

  it("refuses to call out without a key", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(streamGroq([{ role: "user", content: "hi" }])).rejects.toBeInstanceOf(
      ProviderError
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
