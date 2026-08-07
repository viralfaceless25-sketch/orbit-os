# ORBIT OS — Personal Builder Portfolio — Phase 1 Design

Status: Approved for implementation (Phase 1 scope)
Source material: `personal-builder-os-portfolio-plan.md` (ChatGPT planning doc, Sessions 1 & 2), folded in below and adapted with real decisions.

---

## 1. Concept

Not a portfolio with a futuristic skin — a **personal operating system** for everything the owner (Keyush Patel) builds. Projects are running systems, skills are capabilities, GitHub repos are modules, client work is case studies. The interface reflects how the owner actually works, not a resume layout.

Three things a visitor should understand within the first minute:
1. Can build serious products.
2. Is creative and technically capable.
3. Is available for freelance work.

Two experiences live in one site:
- **Exploration path** (curious visitors/devs/founders): Enter OS → explore projects → open project → discover experiments.
- **Client path** (potential hires): understand what you do → see relevant proof → understand process → send inquiry.

A persistent **"Start a Project"** button is always visible regardless of how playful the rest of the site gets.

Visual direction target: *advanced product interface + digital laboratory + personal workshop* — **not** hacker-terminal/neon/cyberpunk.

---

## 2. Scope for tonight (Phase 1: Foundation)

This spec covers Phase 1 only. Phases 2–4 are documented in §10 (Roadmap, not built now) so future sessions have the full context without re-deriving it.

**In scope tonight:**
- OS shell: top bar, side dock, ⌘K command palette, system status widget
- Homepage (Command Center), all 8 screens per §6
- Project data model / registry (§7)
- 4 Featured projects with full detail pages: AMS, OSPA, jewel-stone, DIMS
- Capabilities page
- README / About page
- Inquiry system ("Start a Project") — conversational flow → Resend email
- Visual design system + motion rules + performance rules applied throughout

**Explicitly out tonight** (see Roadmap):
- Interactive Project Galaxy (canvas/SVG zoomable constellation)
- Live GitHub API integration (stars/commits/README sync)
- Playground / experiments section
- Collaborations / "things I've helped build" section (dropped — no current candidate; the one candidate raised, an unrelated open-source repo used as a tool, doesn't fit the "helped build" narrative and was cut, not deferred)
- Gujarati rotation in the nav wordmark (English-only tonight)
- Interactive mini-demos inside project previews (chat/dashboard live previews) — static screenshots/status only
- Easter eggs beyond baseline (Konami code etc. — later)

---

## 3. Brand identity

- **Name shown in nav (center, rotating)**: `KEYUSH PATEL` ↔ `ORBIT OS`. (A future iteration adds a third rotation in Gujarati script — needs exact script from owner, not guessed.)
- **Product name**: **ORBIT OS** — chosen deliberately unpaired from the owner's name; ties directly into the Project Galaxy visual metaphor for later phases.
- **Tagline**: "A living system of websites, AI products, experiments, and ideas."
- **Domain**: real domain purchased later (candidates: `orbitos.dev`, `orbit.build` — availability not yet checked). Until then, use a placeholder in metadata/env config.
- **Stylized flavor text**: somewhere in the OS chrome (status bar or terminal-style command output), display `orbitos.keyush` as an in-universe "domain" — cosmetic only, not a real link, not used as the actual `og:url`/canonical.

---

## 4. Site map

```text
ORBIT OS
│
├── Home / Command Center          (Phase 1)
│
├── Project Galaxy                 (Phase 2 — Phase 1 ships a static "Featured constellation" on homepage instead)
│   ├── AI Systems
│   ├── Client Work
│   ├── Open Source
│   └── Experiments
│
├── Capabilities                   (Phase 1)
│
├── Playground                     (Phase 4)
│
├── About / README                 (Phase 1)
│
├── Activity (GitHub / current)    (Phase 3)
│
└── Start a Project                (Phase 1)
```

---

## 5. OS shell

**Top bar**
```text
[ORBIT OS logo — rotating KEYUSH PATEL / ORBIT OS]   Command Center   Projects   README

System: Available                                          [Start a Project]
```

**Side dock** (icons, tooltip on hover): Home, Projects, Capabilities, README, Contact. (Galaxy and Playground icons added in later phases, shown greyed/"coming" or simply omitted until built — omit for Phase 1 to avoid dead links.)

**Command palette (⌘K / Ctrl+K)**
```text
> Search projects
> View AI systems
> See client work
> Read about me
> Start a project
> Open GitHub
```
Real interaction, not decorative — must actually navigate/filter.

**System status widget**
```text
STATUS
Available for selected projects

CURRENTLY BUILDING
[pulled from a single config value — not automated in Phase 1]

LOCATION
Remote

LOCAL TIME
[live clock]
```

---

## 6. Homepage: Command Center — 8 screens

**Screen 1 — Boot sequence**
~1s, skipped automatically for returning visitors (localStorage flag).
```text
INITIALIZING ORBIT OS...
Loading projects
Connecting GitHub
Starting experiments
System ready
```
Must not trap users; skippable by keypress/click too.

**Screen 2 — Main introduction**
Headline: "A living system of websites, AI products, experiments, and ideas." (tagline, per §3)
Supporting text: "Freelance developer and product builder helping businesses, startups, and creative people design, build, and launch technology."
Primary actions: `[Explore Projects]` `[Start a Project]`
Secondary: "Press ⌘K to explore"
Background: simplified static version of project nodes (not the full interactive Galaxy — that's Phase 2).

**Screen 3 — Builder profile**
```text
BUILDER PROFILE

Name                Keyush Patel
Primary function    Product development
Specialties         Websites · AI · Prototypes
Working style       Fast, collaborative, experimental
Current status      Open for selected projects
```
Animated capability signals: DESIGNING / BUILDING / INTEGRATING / DEPLOYING / EXPERIMENTING
Human paragraph (from source doc, adapt lightly): "I enjoy taking ideas that are unclear, ambitious, or slightly unusual and turning them into products people can actually use. Sometimes that means building a polished website. Sometimes it means creating an AI workflow, prototyping a new app, or helping solve a difficult technical problem."

**Screen 4 — "What are you trying to build?"**
Four interactive modules, each expands to show relevant featured projects:
- **Website** → jewel-stone
- **AI System** → AMS, OSPA
- **Product Prototype** → DIMS
- **Technical Support** → (general capability, links to Capabilities page)

**Screen 5 — Featured constellation (static, Phase 1 version)**
Curated strip of the 4 featured projects (not the full interactive Galaxy). Each card:
```text
Project name
Category
One-line result
Status
```
Real content:
```text
AMS
AI System · Orchestrator
Coordinates multiple AI agents from one dashboard.
IN DEVELOPMENT

OSPA
AI System · macOS App
A native desktop companion that helps non-technical people use their computer.
IN DEVELOPMENT

JEWEL STONE
Client Work · E-commerce
3D-driven jewelry storefront with checkout and custom product configuration.
STATUS: TBD (owner to confirm live/dev)

DIMS
Product Prototype · Internal Tool
Shared diamond inventory and request system across three offices with barcode
and document extraction.
IN DEVELOPMENT
```
Clicking a card opens its full project page (§7.2).

**Screen 6 — Proof of work**
```text
RECENT OUTPUT

Built a multi-agent AI orchestrator with a live dashboard
Shipped a 3D-driven jewelry e-commerce storefront
Building a cross-office diamond inventory system with document extraction
Developed a native macOS desktop companion app
```

**Screen 7 — Process**
```text
01 DISCOVER   Clarify the idea, audience, and objective.
02 PROTOTYPE  Create the first useful version quickly.
03 BUILD      Develop the product and core systems.
04 LAUNCH     Deploy, test, and prepare for real users.
05 IMPROVE    Use feedback to make the product stronger.
```
Each stage expands to a short explanation on click.

**Screen 8 — Final inquiry**
```text
HAVE AN IDEA?

You do not need a complete specification.
Bring the rough idea. We can shape it together.

[Start a Project]
```

---

## 7. Projects

### 7.1 Project registry (data model)

Structured TS files, one per project, no CMS/DB:

```typescript
interface Project {
  slug: string;
  title: string;
  category: "ai" | "web" | "prototype" | "open-source";
  tier: "featured" | "supporting" | "archive"; // all 4 tonight are "featured"
  oneLiner: string;
  status: "live" | "in-development" | "archived";
  role: string;
  problem: string;
  contribution: string;
  solution: string;
  techStack: string[];
  challenges: string[];
  outcome: string[];
  githubUrl?: string;       // owner to supply
  liveUrl?: string;         // owner to supply per-project when ready
  screenshots: string[];    // paths, populated as available
}
```

### 7.2 Full project module (page layout)

Per doc §"Full project module": Overview → Problem → My contribution → Solution → Interactive preview (Phase 1: static screenshot/status only) → Technical system → Challenges → Outcome → Links (`Open Live Project` conditional on `liveUrl`, `View GitHub` conditional on `githubUrl`, `Discuss a Similar Project` → always present, links to Start a Project prefilled with matching category).

### 7.3 Tonight's 4 featured projects — source facts

Pulled from the actual repos on `/Volumes/ai-hub` (not guessed):

**AMS** (`ai-agent-system`)
- Python orchestrator + Next.js dashboard, SQLite persistence, skills system, multi-account support.
- Category: AI. Framing: coordinates multiple AI agents from a single orchestrator dashboard.

**OSPA** (`OSPA` — "Avatar Companion")
- Native macOS app, SwiftUI/AppKit, borderless floating panel, observe-only safe default, explicit-consent action model, emergency stop.
- Category: AI / product. Framing: a native desktop companion built to help non-technical people use their computer safely, with a strict consent/audit model.

**jewel-stone**
- Next.js 14 + React Three Fiber/Drei/postprocessing, GSAP, Framer Motion, Lenis smooth scroll, Stripe checkout, PDF/Excel document handling.
- Category: Client web work. Framing: a 3D-driven jewelry e-commerce storefront — real-time product configuration, checkout, custom orders.

**DIMS** (`DIMS` — "Maitri Diamond Inventory")
- Full-stack (separate backend + frontend + desktop app), Supabase-backed, cross-office (NY/Chicago/LA) inventory with barcode scanning, PDF/invoice extraction (never auto-sends), review-first request routing.
- Category: Product prototype / internal tool. Framing: shared inventory and request software solving real cross-branch coordination for a diamond wholesaler.

Owner will supply live URLs and GitHub links per project as we build each one; pages must render correctly with either field absent (conditional buttons, not broken links).

---

## 8. Capabilities page

Four categories, each an "installable system module" card (name, status, "useful for" list, "outputs" list) per source doc:
- **Web Development** — marketing sites, web apps, dashboards, portfolios, landing pages → design, frontend, backend, deployment.
- **AI Systems** — assistants, retrieval systems, workflows, automations, integrations.
- **Product Prototyping** — fast builds for testing, pitching, early users.
- **Technical Collaboration** — architecture, integrations, debugging, deployment help.

---

## 9. README / About page

Rendered like a styled README, personal voice, not corporate bio. Sections: `/about /philosophy /how-i-work /currently-building /tools-i-use /outside-code /contact`. Include a short timeline (started building websites → helping friends with applications → product development → AI systems → combining all of it now). Exact prose to be filled with the owner during implementation — placeholders here would violate the "no fake content" principle, so this section's copy is a build-time task, not guessed now.

---

## 10. Inquiry system — "Start a Project"

Conversational 5-step configurator (not a raw terminal — doc explicitly warns against terminal-only contact since many clients won't understand it):

1. What are you interested in? (Website / AI system / Product prototype / Technical support / Something unusual)
2. What stage are you at? (Idea / Planning / Already designed / Existing product / Something is broken)
3. What would a successful outcome look like? (free text)
4. Preferred timeline? (ASAP / within 1 month / within 3 months / flexible)
5. Contact info (free text)

End state:
```text
PROJECT REQUEST GENERATED
Reference: PRJ-2026-###
Status: Ready to send
[Send Request]
```
Also show a plain `mailto:` fallback next to the flow at all times — never force the conversational path as the only option.

**Delivery**: Next.js API route receives the submission, sends via **Resend** to owner's inbox. No database persistence needed for Phase 1 (the reference number can be a timestamp-derived string, not a stored sequence).

Contextual CTAs on project pages route into this flow pre-filled with the matching "interested in" category (per doc's conversion strategy).

---

## 11. Visual design system

**Direction**: advanced product interface + digital lab + personal workshop. Avoid cyberpunk/neon/hacker-terminal.

**Color**
- Base: near-black graphite, dark blue-grey, soft off-white text.
- Category accents (used sparingly): AI → electric violet, Web → cool cyan, Client work → warm amber, Open source → green, Experiments → coral.

**Typography** — three roles:
- Display font: headlines/personality.
- Interface sans-serif: nav, body, buttons, labels.
- Monospace: system details, metadata, commands, status indicators only — not general paragraphs.

**Interface details**: fine grid background, hairline borders, soft glows, small labels, status indicators, window-style panels, light noise texture, smooth depth transitions, minimal glass effects (not full glassmorphism everywhere).

---

## 12. Motion design

**Good**: gentle node/element motion, camera-style centering on selection, panels expanding from source, progressive reveal of connections/lists, command palette slide-in, soft data updates, section transitions that read as "opening an application."

**Bad — avoid**: constant text glitching, every button floating, long loading sequences, obstructive cursor trails, constant parallax, dramatic transition on every single section.

**Accessibility**: implement a "Reduce Motion" toggle and respect `prefers-reduced-motion` at the OS level — every section must have a reduced-motion-safe fallback.

---

## 13. Performance rules

- Homepage content is usable before animations finish loading.
- Project text renders as real page content (SSR/SSG), not animation-gated.
- Heavy previews (future phases) load only when opened.
- Images optimized (Next/Image).
- Mobile gets simplified effects, not the full desktop motion set.
- Boot animation runs once, skipped after first visit.
- Every section keyboard-navigable.

---

## 14. Mobile experience (Phase 1 relevant subset)

Featured constellation strip becomes a simple vertical stack/feed on mobile — no attempt to reproduce desktop layout 1:1. OS concept preserved via: bottom dock, full-screen panels for project detail, command button, status labels.

---

## 15. Technical architecture

```text
Frontend       Next.js (App Router, TypeScript)
Styling        Tailwind CSS + custom design tokens (color/type scale from §11)
Motion         Framer Motion
Content        Structured TS project registry files (§7.1) — no CMS/DB
Email          Resend (inquiry delivery, §10)
Hosting        Vercel
```

Galaxy rendering approach (SVG/Canvas first, WebGL only if truly needed) is deferred to Phase 2 — noted here so the choice isn't re-litigated later.

---

## 16. Roadmap (not built tonight — context for future sessions)

**Phase 2 — Signature experience**: interactive 2D/2.5D zoomable Project Galaxy (canvas/SVG, layered movement, glows, parallax, animated connections revealed on selection, search + filters), replacing the static featured strip as the primary project-browsing surface.

**Phase 3 — Living portfolio**: GitHub API integration (stars, commits, language, README excerpts, release info) merged with the manual project registry (GitHub = evidence, registry = story); recent-activity feed; development-log-style status for in-progress projects.

**Phase 4 — Playground**: interactive experiments (generative visuals, small games, AI character, physics/particle toys), easter eggs (Konami code, terminal commands, retro/wireframe/ASCII modes), 404-page game, secret achievements.

**Explicitly avoid starting early** (per source doc): fully draggable desktop windows, account system, blog platform, fully auto-generated project pages from GitHub with no human review, expensive public-facing AI demos, multiplayer, excessive 3D, dozens of case studies at once, multiple visual themes.

**Version framing**: doc recommends "Elegant OS" (clean panels, subtle palette, 2D Galaxy, premium typography) as the foundation, layering in selected "Experimental Lab" moments later, rather than starting with the "Full Spatial System" (draggable windows, heavy 3D) — Phase 1 here follows Elegant OS.

**Turbo-fieldfare note**: raised during planning as a possible "collaboration" story — it's a third-party open-source repo (author unknown) used as a local-inference tool, not a project contributed to. Decision: cut entirely, not deferred. If a real collaboration/case-study candidate emerges later, it goes through §"Instead of testimonials" from the source doc (role, architecture, auth, deployment, scaling) as its own section — separate from this decision.

**Gujarati nav rotation**: deferred — needs the owner to supply the exact Gujarati script (not to be transliterated/guessed) plus confirmation of pronunciation ("Kyush", not "Kee-yush").

---

## 17. Build workflow for tonight

Implementation runs through **Relay**: subtasks get split between direct in-session work and `.md` task files dropped into `~/LocalAgent/tasks/` (frontmatter: `repo: /Volumes/ai-hub/orbit-os`, optional `model:`) for the offline Aider+Ollama agent to pick up. The split decision (what's safe/mechanical enough to hand off vs. what needs direct handling) is made per-task during planning, not manually flagged by the owner.
