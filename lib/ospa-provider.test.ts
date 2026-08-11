import { describe, it, expect } from "vitest";
import { repairProjectLinks, sanitizeReply } from "./ospa-provider";
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
