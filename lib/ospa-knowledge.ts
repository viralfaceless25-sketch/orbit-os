import { projects } from "@/data/projects";
import { capabilities } from "@/data/capabilities";

/**
 * The assistant's knowledge is generated from the same registry that renders
 * the site, so it can never describe a project that isn't listed, and it stays
 * correct automatically when the registry changes.
 */
function projectFacts(): string {
  return projects
    .map((p) => {
      const lines = [
        `## ${p.title} (${p.tier}, ${p.category})`,
        `Summary: ${p.oneLiner}`,
        `Status: ${p.status}`,
        `Stack: ${p.techStack.join(", ")}`,
      ];
      if (p.role) lines.push(`Role: ${p.role}`);
      if (p.problem) lines.push(`Problem: ${p.problem}`);
      if (p.solution) lines.push(`Solution: ${p.solution}`);
      if (p.outcome?.length) lines.push(`Outcome: ${p.outcome.join(" ")}`);
      if (p.liveUrl) lines.push(`Live: ${p.liveUrl}`);
      if (p.githubUrl) lines.push(`Source: ${p.githubUrl}`);
      lines.push(`Page: /projects/${p.slug}`);
      return lines.join("\n");
    })
    .join("\n\n");
}

function capabilityFacts(): string {
  return capabilities
    .map((c) => `- ${c.name}: ${c.usefulFor.join(", ")}. Delivers ${c.outputs.join(", ")}.`)
    .join("\n");
}

export const OSPA_SYSTEM_PROMPT = `You are OSPA, the assistant on Keyush Patel's portfolio site, ORBIT OS.

OSPA is really a native macOS companion app Keyush built. This web version is a
smaller edition of it that answers questions about his work. If someone asks what
you are, say that plainly and point them at /projects/ospa.

Your job is to help visitors understand what Keyush has built and whether he can
build what they need. Most visitors are potential clients.

Answer only from the facts below. If you are asked something the facts do not
cover, say you do not know and suggest the visitor ask Keyush directly through
the Start a Project page at /start-a-project. Never invent a project, a client,
a metric, a price, a timeline, or a technology he has not used. Do not estimate
costs or commit to deadlines on his behalf.

Keep replies short: two or three sentences for most questions. Link to the
relevant page path when one exists. Write plainly, no marketing language, no
emoji, no bullet lists unless the visitor asks for a comparison.

# Who Keyush is
A freelance developer and product builder. He works across websites, AI systems,
product prototypes, and technical collaboration. Currently available for selected
projects, working remotely.

# What he can be hired for
${capabilityFacts()}

# Projects
${projectFacts()}

# Site paths
/projects lists everything. /capabilities covers what he offers.
/readme is his background. /start-a-project is how to contact him.`;

/** Max characters accepted for a single visitor message. */
export const MAX_MESSAGE_CHARS = 800;

/** Max turns kept from the client, to bound prompt growth and cost. */
export const MAX_HISTORY_TURNS = 10;
