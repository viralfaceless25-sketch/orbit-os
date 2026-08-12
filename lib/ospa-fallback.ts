import { projects } from "@/data/projects";
import { capabilities } from "@/data/capabilities";
import { matchesQuery } from "./project-search";

/*
  What OSPA says when there is no model.

  A rate limit, an expired key, or a provider outage used to take the whole
  assistant down and show a visitor an error. That is the worst outcome on a
  page whose job is to convince someone to get in touch, and the failure is not
  even rare: the hosted tier is free, so being throttled is expected.

  These answers come straight out of the same registry that renders the site.
  They are less conversational than a model, but they are always available and
  they cannot invent a project, which is more than can be said for the models
  this had to be defended against.
*/

const STATUS_LABEL: Record<string, string> = {
  live: "live",
  "in-development": "in development",
  archived: "archived",
  tbd: "unlisted",
};

const CONTACT =
  "You can reach Keyush through the Start a Project page at /start-a-project.";

/*
  Words common enough that matching on them returns the whole registry, which
  reads as the assistant ignoring the question. "Work", "built", and "project"
  are here for that reason: they appear in nearly every visitor question and in
  nearly every project record.
*/
const STOPWORDS = new Set([
  "the", "and", "for", "you", "your", "can", "could", "would", "does", "did",
  "what", "which", "who", "how", "why", "when", "any", "all", "some", "with",
  "about", "have", "has", "was", "were", "are", "his", "him", "keyush", "tell",
  "show", "give", "make", "made", "build", "built", "building", "work", "works",
  "worked", "project", "projects", "site", "website", "websites", "app", "apps",
  "thing", "things", "stuff", "like", "want", "need", "use", "used", "using",
]);

function describe(slug: string): string | null {
  const p = projects.find((x) => x.slug === slug);
  if (!p) return null;

  const parts = [`${p.title}: ${p.oneLiner}`];
  if (p.problem) parts.push(p.problem);
  parts.push(`Built with ${p.techStack.slice(0, 5).join(", ")}. Currently ${STATUS_LABEL[p.status] ?? p.status}.`);
  if (p.liveUrl) parts.push(`Live at ${p.liveUrl}`);
  parts.push(`Full write-up: /projects/${p.slug}`);
  return parts.join(" ");
}

function listProjects(matched: typeof projects): string {
  const lines = matched.slice(0, 6).map((p) => `- ${p.title}: ${p.oneLiner} (/projects/${p.slug})`);
  return lines.join("\n");
}

/**
 * Answers a question from the registry alone, with no model involved.
 *
 * Never returns empty: the last resort is a pointer at the projects index and
 * the contact page, which is a useful reply to almost any question a visitor
 * could ask here.
 */
export function answerFromRegistry(question: string): string {
  const q = question.trim().toLowerCase();

  // A named project is the most specific thing a visitor can ask about, so it
  // is checked before any topic keyword.
  const named = projects.find((p) => q.includes(p.title.toLowerCase()) || q.includes(p.slug));
  if (named) {
    const answer = describe(named.slug);
    if (answer) return answer;
  }

  if (/\b(hire|available|work with|contact|email|reach|talk|call|quote|cost|price|budget)\b/.test(q)) {
    return `Keyush is available for selected projects. ${CONTACT} Tell him what you are trying to build and where you are stuck — a rough idea is enough, no finished spec needed.`;
  }

  if (/\b(who|about|yourself|ospa|you\b)/.test(q) && /\b(you|ospa)\b/.test(q)) {
    return "OSPA is a native macOS companion app Keyush built. This is a smaller web edition of it that answers questions about his work. See /projects/ospa. Right now it is running without its language model, so these answers come straight from the project registry.";
  }

  if (/\b(can you|do you|capab|service|offer|help with|specialis|specializ)\b/.test(q)) {
    const list = capabilities.map((c) => `- ${c.name}: ${c.usefulFor.slice(0, 3).join(", ")}`);
    return `Keyush works across:\n${list.join("\n")}\nMore detail at /capabilities. ${CONTACT}`;
  }

  /*
    Fall back to the projects page's own search. It substring-matches the whole
    query, which is right for a filter box but wrong for a sentence — "do you
    do any React work?" would match nothing — so the question is split into
    words first and each one is searched on its own.
  */
  const terms = q
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  const matched = projects.filter((p) => terms.some((t) => matchesQuery(p, t)));
  if (terms.length > 0 && matched.length > 0) {
    return `Here is the relevant work:\n${listProjects(matched)}\nFull index at /projects.`;
  }

  return `I don't have an answer for that one right now — my language model is unreachable, so I can only read from the project registry. Everything Keyush has built is listed at /projects. ${CONTACT}`;
}
