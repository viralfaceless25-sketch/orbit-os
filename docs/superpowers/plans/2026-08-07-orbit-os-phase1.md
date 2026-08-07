# ORBIT OS Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Phase 1 Foundation of ORBIT OS — a Next.js personal builder portfolio with an OS-shell chrome, an 8-screen homepage, 4 real featured project pages, a Capabilities page, a README/About page, and a working "Start a Project" inquiry flow that emails the owner via Resend.

**Architecture:** Next.js App Router site, no database. Content lives in typed TS data files (`data/projects.ts`, `data/capabilities.ts`). Pure logic (data validation shape, inquiry reference generation, inquiry step state machine, command palette filtering, reduced-motion detection, boot-sequence skip flag) is factored into small `lib/` modules so it's unit-testable without rendering. UI components consume that logic. The one server-side piece is a single API route (`app/api/inquiry/route.ts`) that emails a submitted inquiry via Resend.

**Tech Stack:** Next.js 14 (App Router, TypeScript strict), Tailwind CSS, Framer Motion, Resend, Vitest + @testing-library/react + jsdom, npm.

## Global Constraints

- Framework: Next.js 14 (App Router), TypeScript strict mode.
- Styling: Tailwind CSS with custom design tokens (see spec §11) — near-black graphite base, category accents used sparingly (AI = electric violet, Web = cool cyan, Client work = warm amber, Open source = green, Experiments = coral).
- Typography roles: display font (headlines), interface sans-serif (nav/body/labels), monospace (system/metadata/status only — never body paragraphs).
- Motion: Framer Motion. Every animated section must have a `prefers-reduced-motion`-safe fallback (spec §12).
- Content: no CMS/DB. All copy is real content written into `data/` files and page components — never a "TBD"/lorem-ipsum placeholder in shipped UI text.
- Package manager: npm.
- Test runner: Vitest (`vitest run` for CI-style single pass), jsdom environment, @testing-library/react for component smoke tests.
- No live GitHub API integration, no Project Galaxy canvas, no Playground, no collaborations section, no Gujarati nav rotation — all explicitly out of scope per spec §2.
- `githubUrl` and `liveUrl` on projects are optional and frequently absent tonight — every place that renders them must handle the absent case without a broken link or empty button.

---

## File Structure

```text
orbit-os/
├── app/
│   ├── layout.tsx                    # root layout: fonts, OSShell wrapper, globals.css import
│   ├── page.tsx                      # homepage: composes Screens 1-8
│   ├── globals.css                   # Tailwind base + design tokens as CSS variables
│   ├── projects/[slug]/page.tsx      # full project module page
│   ├── capabilities/page.tsx
│   ├── readme/page.tsx
│   ├── start-a-project/page.tsx
│   └── api/inquiry/route.ts
├── data/
│   ├── projects.ts
│   ├── projects.test.ts
│   ├── capabilities.ts
│   └── capabilities.test.ts
├── lib/
│   ├── design-tokens.ts
│   ├── design-tokens.test.ts
│   ├── inquiry-reference.ts
│   ├── inquiry-reference.test.ts
│   ├── inquiry-flow.ts
│   ├── inquiry-flow.test.ts
│   ├── use-reduced-motion.ts
│   ├── use-reduced-motion.test.ts
│   ├── boot-sequence.ts
│   ├── boot-sequence.test.ts
│   ├── palette-commands.ts
│   └── palette-commands.test.ts
├── components/
│   ├── shell/
│   │   ├── OSShell.tsx
│   │   ├── TopBar.tsx
│   │   ├── SideDock.tsx
│   │   ├── SystemStatus.tsx
│   │   ├── CommandPalette.tsx
│   │   └── OSShell.test.tsx
│   ├── home/
│   │   ├── BootSequence.tsx
│   │   ├── BootSequence.test.tsx
│   │   ├── Screen2Intro.tsx
│   │   ├── Screen3Profile.tsx
│   │   ├── Screen4Selector.tsx
│   │   ├── Screen5Constellation.tsx
│   │   ├── Screen6ProofOfWork.tsx
│   │   ├── Screen7Process.tsx
│   │   ├── Screen8FinalCTA.tsx
│   │   └── HomeScreens.test.tsx
│   ├── projects/
│   │   ├── ProjectLinks.tsx
│   │   └── ProjectLinks.test.tsx
│   └── inquiry/
│       ├── InquiryFlow.tsx
│       └── InquiryFlow.test.tsx
├── .env.example
├── vitest.config.ts
├── vitest.setup.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

### Task 1: Project scaffold, design tokens, test tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx` (minimal shell, no OSShell yet), `app/page.tsx` (placeholder `<main>ORBIT OS</main>`), `vitest.config.ts`, `vitest.setup.ts`, `.env.example`, `.gitignore`, `README.md`
- Create: `lib/design-tokens.ts`
- Test: `lib/design-tokens.test.ts`

**Interfaces:**
- Produces: `lib/design-tokens.ts` exports `colors`, `fonts` objects used by every later component task.

```ts
// lib/design-tokens.ts
export const colors = {
  base: {
    graphite: "#0b0d10",
    blueGrey: "#141821",
    textOffWhite: "#e9ecf1",
  },
  accent: {
    ai: "#7c5cff",        // electric violet
    web: "#3fd0e0",       // cool cyan
    clientWork: "#e0a63f", // warm amber
    openSource: "#4fd07a", // green
    experiments: "#ff7a5c", // coral
  },
} as const;

export const fonts = {
  display: "var(--font-display)",
  interface: "var(--font-interface)",
  mono: "var(--font-mono)",
} as const;

export type AccentCategory = keyof typeof colors.accent;
```

- [ ] **Step 1: Write the failing test**

```ts
// lib/design-tokens.test.ts
import { describe, it, expect } from "vitest";
import { colors, fonts } from "./design-tokens";

describe("design-tokens", () => {
  it("exposes the base graphite palette", () => {
    expect(colors.base.graphite).toBe("#0b0d10");
    expect(colors.base.textOffWhite).toBe("#e9ecf1");
  });

  it("exposes all five category accents", () => {
    expect(Object.keys(colors.accent).sort()).toEqual(
      ["ai", "clientWork", "experiments", "openSource", "web"].sort()
    );
  });

  it("exposes the three font roles", () => {
    expect(Object.keys(fonts).sort()).toEqual(["display", "interface", "mono"].sort());
  });
});
```

- [ ] **Step 2: Scaffold the project**

```bash
cd /Volumes/ai-hub/orbit-os
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm
npm install framer-motion resend
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

Then create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

`vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts: `"test": "vitest run"`.

Create `lib/design-tokens.ts` with the content shown above.

**Run test now — expected to fail before this point only if the file is missing; since we write both together, skip ahead to verification.**

- [ ] **Step 3: Run test to verify it passes**

Run: `npm test -- lib/design-tokens.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 4: Verify the app boots**

Run: `npm run build`
Expected: build succeeds with the default Next.js scaffold plus `lib/design-tokens.ts` present (unused-export warnings are fine).

- [ ] **Step 5: Commit**

```bash
cd /Volumes/ai-hub/orbit-os
git add -A
git commit -m "chore: scaffold Next.js app, design tokens, test tooling"
```

---

### Task 2: Project registry data

**Files:**
- Create: `data/projects.ts`
- Test: `data/projects.test.ts`

**Interfaces:**
- Produces: `Project` interface, `ProjectCategory`, `ProjectStatus`, `ProjectTier` types, and `projects: Project[]` array — consumed by Task 11 (Screen 5), Task 14 (project detail page).

- [ ] **Step 1: Write the failing test**

```ts
// data/projects.test.ts
import { describe, it, expect } from "vitest";
import { projects } from "./projects";

describe("projects registry", () => {
  it("has exactly four featured projects for Phase 1", () => {
    const featured = projects.filter((p) => p.tier === "featured");
    expect(featured).toHaveLength(4);
  });

  it("has unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every project has non-empty narrative fields", () => {
    for (const p of projects) {
      expect(p.oneLiner.length).toBeGreaterThan(0);
      expect(p.problem.length).toBeGreaterThan(0);
      expect(p.contribution.length).toBeGreaterThan(0);
      expect(p.solution.length).toBeGreaterThan(0);
      expect(p.techStack.length).toBeGreaterThan(0);
      expect(p.outcome.length).toBeGreaterThan(0);
    }
  });

  it("includes ams, ospa, jewel-stone, and dims", () => {
    const slugs = projects.map((p) => p.slug).sort();
    expect(slugs).toEqual(["ams", "dims", "jewel-stone", "ospa"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- data/projects.test.ts`
Expected: FAIL — `Cannot find module './projects'`

- [ ] **Step 3: Write the implementation**

```ts
// data/projects.ts
export type ProjectCategory = "ai" | "web" | "prototype" | "open-source";
export type ProjectTier = "featured" | "supporting" | "archive";
export type ProjectStatus = "live" | "in-development" | "archived" | "tbd";

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  tier: ProjectTier;
  oneLiner: string;
  status: ProjectStatus;
  role: string;
  problem: string;
  contribution: string;
  solution: string;
  techStack: string[];
  challenges: string[];
  outcome: string[];
  githubUrl?: string;
  liveUrl?: string;
  screenshots: string[];
}

export const projects: Project[] = [
  {
    slug: "ams",
    title: "AMS",
    category: "ai",
    tier: "featured",
    oneLiner: "Coordinates multiple AI agents from one orchestrator dashboard.",
    status: "in-development",
    role: "Sole builder — architecture, orchestrator, dashboard.",
    problem:
      "Running several AI agents on real work meant juggling separate terminals, logs, and state with no shared view of what each agent was doing or had access to.",
    contribution:
      "Designed and built the orchestrator core, the agent/account/skills model, and the dashboard that surfaces it.",
    solution:
      "A Python orchestrator manages agent accounts, skills, and run state in SQLite, exposing everything through a Next.js dashboard so multiple agents can be launched, monitored, and coordinated from one place.",
    techStack: ["Python", "SQLite", "Next.js", "TypeScript", "Tailwind CSS"],
    challenges: [
      "Modeling agent \"skills\" so they're shareable across agents without duplicating logic per agent.",
      "Keeping the dashboard in sync with orchestrator state without a heavy real-time infrastructure.",
    ],
    outcome: [
      "Runs multiple agents against real client and personal projects from a single control surface.",
      "Skill system reused across agents instead of rebuilt per agent.",
    ],
    screenshots: [],
  },
  {
    slug: "ospa",
    title: "OSPA",
    category: "ai",
    tier: "featured",
    oneLiner: "A native macOS companion that helps non-technical people use their computer safely.",
    status: "in-development",
    role: "Sole builder — native app, interaction and consent model.",
    problem:
      "Non-technical users need help operating their computer, but giving an AI agent broad control of a real desktop is risky without hard limits on what it can see and do.",
    contribution:
      "Built the native SwiftUI/AppKit app and designed the safety model: observe-only default, explicit consent before any side effect, closed command allowlist, and an emergency stop.",
    solution:
      "A borderless floating desktop avatar that can discover, research, and plan actions across apps, but only executes after explicit user confirmation, with every action logged and a single-key emergency stop.",
    techStack: ["Swift", "SwiftUI", "AppKit", "macOS Accessibility APIs"],
    challenges: [
      "Defining a consent and audit model strict enough to be safe for non-technical users, without making every interaction feel like a permissions dialog.",
      "Keeping the floating panel behavior correct across Spaces and full-screen apps.",
    ],
    outcome: [
      "Working Milestone 1: draggable panel, safe demo action, emergency stop, and command allowlist all functioning.",
      "Consent/audit architecture in place for later milestones that add real actions.",
    ],
    screenshots: [],
  },
  {
    slug: "jewel-stone",
    title: "Jewel Stone",
    category: "web",
    tier: "featured",
    oneLiner: "A 3D-driven jewelry storefront with checkout and custom product configuration.",
    status: "tbd",
    role: "Design and development.",
    problem:
      "A jewelry retailer needed an online storefront that could show product detail and craftsmanship the way a physical showroom does, not just flat product photos.",
    contribution:
      "Built the storefront end to end: 3D product presentation, checkout, and the custom-order flow.",
    solution:
      "A Next.js storefront rendering products in 3D with React Three Fiber, GSAP- and Framer Motion-driven interaction, Stripe checkout, and document handling for custom orders.",
    techStack: ["Next.js", "React Three Fiber", "Three.js", "GSAP", "Framer Motion", "Stripe", "TypeScript"],
    challenges: [
      "Keeping 3D product rendering performant on real devices, not just on a dev machine.",
      "Making a checkout flow feel as premium as the 3D product experience around it.",
    ],
    outcome: [
      "Full storefront built end to end, from 3D product views through checkout.",
      "Custom-order flow handles real document upload and extraction.",
    ],
    screenshots: [],
  },
  {
    slug: "dims",
    title: "DIMS",
    category: "prototype",
    tier: "featured",
    oneLiner: "Shared diamond inventory and request system across three offices.",
    status: "in-development",
    role: "Sole builder — backend, frontend, desktop app.",
    problem:
      "Sales reps in NY, Chicago, and LA were browsing separate, disconnected stock, so requests for the same stone could collide, and inventory staff had no single source of truth for what was in stock, on memo, on hold, or already requested.",
    contribution:
      "Built the backend, frontend, and desktop app end to end, including the review-first request workflow and document extraction pipeline.",
    solution:
      "One login system with combined loose-diamond and jewelry stock across all three offices, availability protection against duplicate requests, barcode and pasted-detail intake, and PDF/invoice extraction that always requires review before anything is sent.",
    techStack: ["Next.js", "Supabase", "TypeScript", "Electron"],
    challenges: [
      "Preventing two sales reps in different offices from requesting the same physical stone at the same time.",
      "Extracting stock details from pasted text and PDFs reliably enough to trust, while keeping a human review step before anything ships.",
    ],
    outcome: [
      "Cross-branch routing live across all three offices.",
      "Review-first request flow removes the double-booking problem entirely.",
    ],
    screenshots: [],
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- data/projects.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add data/projects.ts data/projects.test.ts
git commit -m "feat: add project registry data for AMS, OSPA, Jewel Stone, DIMS"
```

---

### Task 3: Capabilities data

**Files:**
- Create: `data/capabilities.ts`
- Test: `data/capabilities.test.ts`

**Interfaces:**
- Produces: `Capability` interface, `capabilities: Capability[]` — consumed by Task 15 (`app/capabilities/page.tsx`).

- [ ] **Step 1: Write the failing test**

```ts
// data/capabilities.test.ts
import { describe, it, expect } from "vitest";
import { capabilities } from "./capabilities";

describe("capabilities registry", () => {
  it("has the four capability categories", () => {
    const names = capabilities.map((c) => c.name).sort();
    expect(names).toEqual(
      ["AI Systems", "Product Prototyping", "Technical Collaboration", "Web Development"].sort()
    );
  });

  it("every capability lists at least one 'useful for' and one output", () => {
    for (const c of capabilities) {
      expect(c.usefulFor.length).toBeGreaterThan(0);
      expect(c.outputs.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- data/capabilities.test.ts`
Expected: FAIL — `Cannot find module './capabilities'`

- [ ] **Step 3: Write the implementation**

```ts
// data/capabilities.ts
export interface Capability {
  name: string;
  status: "Available";
  usefulFor: string[];
  outputs: string[];
}

export const capabilities: Capability[] = [
  {
    name: "Web Development",
    status: "Available",
    usefulFor: ["Marketing websites", "Web applications", "Dashboards", "Portfolios", "Landing pages"],
    outputs: ["Design", "Frontend", "Backend", "Deployment"],
  },
  {
    name: "AI Systems",
    status: "Available",
    usefulFor: ["Assistants", "Retrieval systems", "Workflows", "Automations", "Integrations"],
    outputs: ["Architecture", "Agent design", "Integration", "Deployment"],
  },
  {
    name: "Product Prototyping",
    status: "Available",
    usefulFor: ["Testing an idea", "Pitching investors or partners", "Early users"],
    outputs: ["Working prototype", "Core system design", "Fast iteration"],
  },
  {
    name: "Technical Collaboration",
    status: "Available",
    usefulFor: ["Architecture review", "Integrations", "Debugging", "Deployment help"],
    outputs: ["Clear technical direction", "Fixes", "Shipped deployment"],
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- data/capabilities.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add data/capabilities.ts data/capabilities.test.ts
git commit -m "feat: add capabilities registry data"
```

---

### Task 4: Inquiry reference generator

**Files:**
- Create: `lib/inquiry-reference.ts`
- Test: `lib/inquiry-reference.test.ts`

**Interfaces:**
- Produces: `generateInquiryReference(date?: Date): string` — consumed by Task 18 (API route).

- [ ] **Step 1: Write the failing test**

```ts
// lib/inquiry-reference.test.ts
import { describe, it, expect } from "vitest";
import { generateInquiryReference } from "./inquiry-reference";

describe("generateInquiryReference", () => {
  it("matches the PRJ-YYYY-### format", () => {
    const ref = generateInquiryReference(new Date("2026-08-07T12:00:00Z"));
    expect(ref).toMatch(/^PRJ-2026-\d{3}$/);
  });

  it("produces different references for different timestamps", () => {
    const a = generateInquiryReference(new Date("2026-08-07T12:00:00.000Z"));
    const b = generateInquiryReference(new Date("2026-08-07T12:00:00.501Z"));
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/inquiry-reference.test.ts`
Expected: FAIL — `Cannot find module './inquiry-reference'`

- [ ] **Step 3: Write the implementation**

```ts
// lib/inquiry-reference.ts
export function generateInquiryReference(date: Date = new Date()): string {
  const year = date.getFullYear();
  const seq = String(date.getTime() % 1000).padStart(3, "0");
  return `PRJ-${year}-${seq}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/inquiry-reference.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/inquiry-reference.ts lib/inquiry-reference.test.ts
git commit -m "feat: add inquiry reference generator"
```

---

### Task 5: Reduced-motion hook

**Files:**
- Create: `lib/use-reduced-motion.ts`
- Test: `lib/use-reduced-motion.test.ts`

**Interfaces:**
- Produces: `usePrefersReducedMotion(): boolean` — consumed by every animated component from Task 9 onward.

- [ ] **Step 1: Write the failing test**

```ts
// lib/use-reduced-motion.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("usePrefersReducedMotion", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it("returns false when the media query does not match", () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when the media query matches", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/use-reduced-motion.test.ts`
Expected: FAIL — `Cannot find module './use-reduced-motion'`

- [ ] **Step 3: Write the implementation**

```ts
// lib/use-reduced-motion.ts
"use client";
import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/use-reduced-motion.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/use-reduced-motion.ts lib/use-reduced-motion.test.ts
git commit -m "feat: add reduced-motion detection hook"
```

---

### Task 6: Command palette command list + filter logic

**Files:**
- Create: `lib/palette-commands.ts`
- Test: `lib/palette-commands.test.ts`

**Interfaces:**
- Produces: `PaletteCommand` interface, `paletteCommands: PaletteCommand[]`, `filterCommands(query: string, commands?: PaletteCommand[]): PaletteCommand[]` — consumed by Task 9 (`CommandPalette.tsx`).

- [ ] **Step 1: Write the failing test**

```ts
// lib/palette-commands.test.ts
import { describe, it, expect } from "vitest";
import { paletteCommands, filterCommands } from "./palette-commands";

describe("filterCommands", () => {
  it("returns all commands for an empty query", () => {
    expect(filterCommands("")).toEqual(paletteCommands);
  });

  it("filters case-insensitively by label", () => {
    const results = filterCommands("github");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("github");
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterCommands("zzz-no-match")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/palette-commands.test.ts`
Expected: FAIL — `Cannot find module './palette-commands'`

- [ ] **Step 3: Write the implementation**

```ts
// lib/palette-commands.ts
export interface PaletteCommand {
  id: string;
  label: string;
  href: string;
}

export const paletteCommands: PaletteCommand[] = [
  { id: "search-projects", label: "Search projects", href: "/#projects" },
  { id: "view-ai", label: "View AI systems", href: "/#projects?category=ai" },
  { id: "client-work", label: "See client work", href: "/#projects?category=web" },
  { id: "about", label: "Read about me", href: "/readme" },
  { id: "start-project", label: "Start a project", href: "/start-a-project" },
  { id: "github", label: "Open GitHub", href: "/#" },
];

export function filterCommands(
  query: string,
  commands: PaletteCommand[] = paletteCommands
): PaletteCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return commands;
  return commands.filter((c) => c.label.toLowerCase().includes(q));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/palette-commands.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/palette-commands.ts lib/palette-commands.test.ts
git commit -m "feat: add command palette commands and filter logic"
```

Note: `github` command href is `/#` as a placeholder route until the owner supplies a real GitHub profile URL — update in a follow-up task once available, tracked in the plan's final task (Task 19) env/config step.

---

### Task 7: Boot sequence skip logic

**Files:**
- Create: `lib/boot-sequence.ts`
- Test: `lib/boot-sequence.test.ts`

**Interfaces:**
- Produces: `hasSeenBoot(storage): boolean`, `markBootSeen(storage): void` — consumed by Task 10 (`BootSequence.tsx`).

- [ ] **Step 1: Write the failing test**

```ts
// lib/boot-sequence.test.ts
import { describe, it, expect } from "vitest";
import { hasSeenBoot, markBootSeen } from "./boot-sequence";

function fakeStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  };
}

describe("boot sequence skip flag", () => {
  it("has not seen boot by default", () => {
    expect(hasSeenBoot(fakeStorage())).toBe(false);
  });

  it("has seen boot after marking it", () => {
    const storage = fakeStorage();
    markBootSeen(storage);
    expect(hasSeenBoot(storage)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/boot-sequence.test.ts`
Expected: FAIL — `Cannot find module './boot-sequence'`

- [ ] **Step 3: Write the implementation**

```ts
// lib/boot-sequence.ts
const BOOT_SEEN_KEY = "orbit-os:boot-seen";

export function hasSeenBoot(storage: Pick<Storage, "getItem">): boolean {
  return storage.getItem(BOOT_SEEN_KEY) === "true";
}

export function markBootSeen(storage: Pick<Storage, "setItem">): void {
  storage.setItem(BOOT_SEEN_KEY, "true");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/boot-sequence.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/boot-sequence.ts lib/boot-sequence.test.ts
git commit -m "feat: add boot sequence skip-flag logic"
```

---

### Task 8: Inquiry flow state machine

**Files:**
- Create: `lib/inquiry-flow.ts`
- Test: `lib/inquiry-flow.test.ts`

**Interfaces:**
- Consumes: `ProjectCategory` type from `data/projects.ts` (Task 2).
- Produces: `InquiryStepId`, `InquiryState`, `initialInquiryState`, `isStepComplete(state, step): boolean`, `nextStep(state): InquiryState`, `categoryToInterestLabel(category: ProjectCategory): string` — consumed by Task 17 (`InquiryFlow.tsx`) and Task 19 (`app/start-a-project/page.tsx`).

- [ ] **Step 1: Write the failing test**

```ts
// lib/inquiry-flow.test.ts
import { describe, it, expect } from "vitest";
import { initialInquiryState, isStepComplete, nextStep, categoryToInterestLabel } from "./inquiry-flow";

describe("inquiry flow state machine", () => {
  it("starts on the interest step, incomplete", () => {
    expect(initialInquiryState.step).toBe("interest");
    expect(isStepComplete(initialInquiryState, "interest")).toBe(false);
  });

  it("does not advance when the current step is incomplete", () => {
    const result = nextStep(initialInquiryState);
    expect(result.step).toBe("interest");
  });

  it("advances through each step once its field is filled", () => {
    let state = { ...initialInquiryState, interest: "Website" };
    state = nextStep(state);
    expect(state.step).toBe("stage");

    state = { ...state, stage: "Just an idea" };
    state = nextStep(state);
    expect(state.step).toBe("outcome");

    state = { ...state, outcome: "A working site by month end" };
    state = nextStep(state);
    expect(state.step).toBe("timeline");

    state = { ...state, timeline: "Within one month" };
    state = nextStep(state);
    expect(state.step).toBe("contact");

    state = { ...state, contact: "me@example.com" };
    state = nextStep(state);
    expect(state.step).toBe("review");
  });

  it("stops advancing at review", () => {
    const reviewState = { ...initialInquiryState, step: "review" as const };
    expect(nextStep(reviewState).step).toBe("review");
  });
});

describe("categoryToInterestLabel", () => {
  it("maps each project category to its matching interest label", () => {
    expect(categoryToInterestLabel("web")).toBe("Website");
    expect(categoryToInterestLabel("ai")).toBe("AI system");
    expect(categoryToInterestLabel("prototype")).toBe("Product prototype");
    expect(categoryToInterestLabel("open-source")).toBe("Something unusual");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/inquiry-flow.test.ts`
Expected: FAIL — `Cannot find module './inquiry-flow'`

- [ ] **Step 3: Write the implementation**

```ts
// lib/inquiry-flow.ts
export type InquiryStepId = "interest" | "stage" | "outcome" | "timeline" | "contact" | "review";

export interface InquiryState {
  interest: string | null;
  stage: string | null;
  outcome: string;
  timeline: string | null;
  contact: string;
  step: InquiryStepId;
}

export const initialInquiryState: InquiryState = {
  interest: null,
  stage: null,
  outcome: "",
  timeline: null,
  contact: "",
  step: "interest",
};

const STEP_ORDER: InquiryStepId[] = ["interest", "stage", "outcome", "timeline", "contact", "review"];

export function isStepComplete(state: InquiryState, step: InquiryStepId): boolean {
  switch (step) {
    case "interest":
      return state.interest !== null;
    case "stage":
      return state.stage !== null;
    case "outcome":
      return state.outcome.trim().length > 0;
    case "timeline":
      return state.timeline !== null;
    case "contact":
      return state.contact.trim().length > 0;
    case "review":
      return true;
  }
}

export function nextStep(state: InquiryState): InquiryState {
  if (!isStepComplete(state, state.step)) return state;
  const idx = STEP_ORDER.indexOf(state.step);
  const next = STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)];
  return { ...state, step: next };
}

import type { ProjectCategory } from "@/data/projects";

const CATEGORY_TO_INTEREST: Record<ProjectCategory, string> = {
  ai: "AI system",
  web: "Website",
  prototype: "Product prototype",
  "open-source": "Something unusual",
};

export function categoryToInterestLabel(category: ProjectCategory): string {
  return CATEGORY_TO_INTEREST[category];
}
```

Note: move the `import type { ProjectCategory } ...` line to the top of the file with the other imports when writing the real file — shown inline here only to keep the diff next to the code it supports.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/inquiry-flow.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/inquiry-flow.ts lib/inquiry-flow.test.ts
git commit -m "feat: add inquiry flow state machine"
```

---

### Task 9: OS Shell components

**Files:**
- Create: `components/shell/TopBar.tsx`, `components/shell/SideDock.tsx`, `components/shell/SystemStatus.tsx`, `components/shell/CommandPalette.tsx`, `components/shell/OSShell.tsx`
- Test: `components/shell/OSShell.test.tsx`

**Interfaces:**
- Consumes: `filterCommands`, `paletteCommands` from `lib/palette-commands.ts` (Task 6); `usePrefersReducedMotion` from `lib/use-reduced-motion.ts` (Task 5).
- Produces: `<OSShell>{children}</OSShell>` component — consumed by Task 19 (`app/layout.tsx`).

- [ ] **Step 1: Write the failing test**

```tsx
// components/shell/OSShell.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OSShell } from "./OSShell";

describe("OSShell", () => {
  it("renders the top bar wordmark, status, and children", () => {
    render(
      <OSShell>
        <p>page content</p>
      </OSShell>
    );
    expect(screen.getByText("KEYUSH PATEL")).toBeInTheDocument();
    expect(screen.getByText("Start a Project")).toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("shows the stylized in-universe domain in the system status widget", () => {
    render(
      <OSShell>
        <p>page content</p>
      </OSShell>
    );
    expect(screen.getByText("orbitos.keyush")).toBeInTheDocument();
  });

  it("opens the command palette on the button click and filters commands", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(
      <OSShell>
        <p>page content</p>
      </OSShell>
    );
    await user.click(screen.getByLabelText("Open command palette"));
    expect(screen.getByPlaceholderText("Type a command...")).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("Type a command..."), "github");
    expect(screen.getByText("Open GitHub")).toBeInTheDocument();
    expect(screen.queryByText("Read about me")).not.toBeInTheDocument();
  });
});
```

Add `@testing-library/user-event` to dev dependencies: `npm install -D @testing-library/user-event`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/shell/OSShell.test.tsx`
Expected: FAIL — `Cannot find module './OSShell'`

- [ ] **Step 3: Write the implementation**

```tsx
// components/shell/SystemStatus.tsx
"use client";
import { useEffect, useState } from "react";

export function SystemStatus() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="font-mono text-xs text-[--color-text-dim] space-y-1">
      <p>STATUS: Available for selected projects</p>
      <p>CURRENTLY BUILDING: ORBIT OS</p>
      <p>LOCATION: Remote</p>
      <p>LOCAL TIME: {time}</p>
      <p className="pt-1 text-[--color-text-dim]/70">orbitos.keyush</p>
    </div>
  );
}
```

The `orbitos.keyush` line is cosmetic in-universe flavor text (spec §3) — never used as a real link, `href`, or in metadata. It is plain text, not an anchor.

```tsx
// components/shell/CommandPalette.tsx
"use client";
import { useState } from "react";
import { filterCommands, paletteCommands } from "@/lib/palette-commands";

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const results = filterCommands(query, paletteCommands);

  return (
    <div
      role="dialog"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-32"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-white/10 bg-[--color-graphite] p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          placeholder="Type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent font-mono text-sm text-[--color-text] outline-none"
        />
        <ul className="mt-2 space-y-1">
          {results.map((cmd) => (
            <li key={cmd.id}>
              <a href={cmd.href} className="block rounded px-2 py-1 text-sm hover:bg-white/5">
                {cmd.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

```tsx
// components/shell/TopBar.tsx
"use client";
import { useEffect, useState } from "react";

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [rotatingLabel, setRotatingLabel] = useState("KEYUSH PATEL");

  useEffect(() => {
    const labels = ["KEYUSH PATEL", "ORBIT OS"];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % labels.length;
      setRotatingLabel(labels[i]);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
      <span className="font-mono text-sm tracking-wide">{rotatingLabel}</span>
      <nav className="hidden gap-6 text-sm md:flex">
        <a href="/">Command Center</a>
        <a href="/#projects">Projects</a>
        <a href="/readme">README</a>
      </nav>
      <div className="flex items-center gap-3">
        <button
          aria-label="Open command palette"
          onClick={onOpenPalette}
          className="rounded border border-white/10 px-2 py-1 font-mono text-xs"
        >
          ⌘K
        </button>
        <a
          href="/start-a-project"
          className="rounded bg-white px-3 py-1.5 text-sm font-medium text-black"
        >
          Start a Project
        </a>
      </div>
    </header>
  );
}
```

```tsx
// components/shell/SideDock.tsx
export function SideDock() {
  const items = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/#projects" },
    { label: "Capabilities", href: "/capabilities" },
    { label: "README", href: "/readme" },
    { label: "Contact", href: "/start-a-project" },
  ];

  return (
    <nav
      aria-label="Application dock"
      className="fixed left-2 top-1/2 hidden -translate-y-1/2 flex-col gap-4 rounded-full border border-white/10 bg-[--color-graphite]/80 px-2 py-4 md:flex"
    >
      {items.map((item) => (
        <a key={item.label} href={item.href} title={item.label} className="text-xs">
          {item.label[0]}
        </a>
      ))}
    </nav>
  );
}
```

```tsx
// components/shell/OSShell.tsx
"use client";
import { useState } from "react";
import { TopBar } from "./TopBar";
import { SideDock } from "./SideDock";
import { SystemStatus } from "./SystemStatus";
import { CommandPalette } from "./CommandPalette";

export function OSShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[--color-graphite] text-[--color-text]">
      <TopBar onOpenPalette={() => setPaletteOpen(true)} />
      <SideDock />
      <main className="px-4 py-6 md:pl-20">{children}</main>
      <div className="fixed bottom-4 right-4 hidden md:block">
        <SystemStatus />
      </div>
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/shell/OSShell.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add components/shell/
git commit -m "feat: add OS shell (top bar, dock, status, command palette)"
```

---

### Task 10: Boot sequence component

**Files:**
- Create: `components/home/BootSequence.tsx`
- Test: `components/home/BootSequence.test.tsx`

**Interfaces:**
- Consumes: `hasSeenBoot`, `markBootSeen` from `lib/boot-sequence.ts` (Task 7).
- Produces: `<BootSequence onDone={() => void}>` — consumed by Task 13 (`app/page.tsx`).

- [ ] **Step 1: Write the failing test**

```tsx
// components/home/BootSequence.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { BootSequence } from "./BootSequence";

describe("BootSequence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  it("shows the boot lines then calls onDone", () => {
    const onDone = vi.fn();
    render(<BootSequence onDone={onDone} />);
    expect(screen.getByText("INITIALIZING ORBIT OS...")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(onDone).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("calls onDone immediately for a returning visitor", () => {
    window.localStorage.setItem("orbit-os:boot-seen", "true");
    const onDone = vi.fn();
    render(<BootSequence onDone={onDone} />);
    expect(onDone).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/home/BootSequence.test.tsx`
Expected: FAIL — `Cannot find module './BootSequence'`

- [ ] **Step 3: Write the implementation**

```tsx
// components/home/BootSequence.tsx
"use client";
import { useEffect, useState } from "react";
import { hasSeenBoot, markBootSeen } from "@/lib/boot-sequence";

const LINES = [
  "INITIALIZING ORBIT OS...",
  "Loading projects",
  "Connecting GitHub",
  "Starting experiments",
  "System ready",
];

export function BootSequence({ onDone }: { onDone: () => void }) {
  const [skip, setSkip] = useState<boolean | null>(null);

  useEffect(() => {
    if (hasSeenBoot(window.localStorage)) {
      setSkip(true);
      onDone();
      return;
    }
    setSkip(false);
    const timer = setTimeout(() => {
      markBootSeen(window.localStorage);
      onDone();
    }, 1000);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (skip !== false) return null;

  return (
    <div
      role="status"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-1 bg-[--color-graphite] font-mono text-sm"
      onClick={onDone}
    >
      {LINES.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/home/BootSequence.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add components/home/BootSequence.tsx components/home/BootSequence.test.tsx
git commit -m "feat: add skippable boot sequence"
```

---

### Task 11: Homepage screens 2-4 (intro, profile, selector)

**Files:**
- Create: `components/home/Screen2Intro.tsx`, `components/home/Screen3Profile.tsx`, `components/home/Screen4Selector.tsx`
- Test: `components/home/HomeScreens.test.tsx` (covers Screens 2-4; extended in Task 12 for 5-8)

**Interfaces:**
- Consumes: `projects` from `data/projects.ts` (Task 2) in `Screen4Selector`.
- Produces: three components consumed by Task 13 (`app/page.tsx`).

- [ ] **Step 1: Write the failing test**

```tsx
// components/home/HomeScreens.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Screen2Intro } from "./Screen2Intro";
import { Screen3Profile } from "./Screen3Profile";
import { Screen4Selector } from "./Screen4Selector";

describe("Screen2Intro", () => {
  it("shows the tagline and both primary actions", () => {
    render(<Screen2Intro />);
    expect(
      screen.getByText("A living system of websites, AI products, experiments, and ideas.")
    ).toBeInTheDocument();
    expect(screen.getByText("Explore Projects")).toBeInTheDocument();
    expect(screen.getByText("Start a Project")).toBeInTheDocument();
  });
});

describe("Screen3Profile", () => {
  it("shows the builder profile fields", () => {
    render(<Screen3Profile />);
    expect(screen.getByText("Keyush Patel")).toBeInTheDocument();
    expect(screen.getByText("Open for selected projects")).toBeInTheDocument();
  });
});

describe("Screen4Selector", () => {
  it("shows the four build-type modules", () => {
    render(<Screen4Selector />);
    expect(screen.getByText("Website")).toBeInTheDocument();
    expect(screen.getByText("AI System")).toBeInTheDocument();
    expect(screen.getByText("Product Prototype")).toBeInTheDocument();
    expect(screen.getByText("Technical Support")).toBeInTheDocument();
  });

  it("reveals matching projects when a module is selected", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(<Screen4Selector />);
    await user.click(screen.getByText("AI System"));
    expect(screen.getByText("AMS")).toBeInTheDocument();
    expect(screen.getByText("OSPA")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/home/HomeScreens.test.tsx`
Expected: FAIL — modules don't exist yet

- [ ] **Step 3: Write the implementation**

```tsx
// components/home/Screen2Intro.tsx
export function Screen2Intro() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="max-w-2xl font-display text-4xl md:text-5xl">
        A living system of websites, AI products, experiments, and ideas.
      </h1>
      <p className="max-w-xl text-[--color-text-dim]">
        Freelance developer and product builder helping businesses, startups, and creative people
        design, build, and launch technology.
      </p>
      <div className="flex gap-3">
        <a href="#projects" className="rounded bg-white px-4 py-2 text-sm font-medium text-black">
          Explore Projects
        </a>
        <a
          href="/start-a-project"
          className="rounded border border-white/20 px-4 py-2 text-sm font-medium"
        >
          Start a Project
        </a>
      </div>
      <p className="font-mono text-xs text-[--color-text-dim]">Press ⌘K to explore</p>
    </section>
  );
}
```

```tsx
// components/home/Screen3Profile.tsx
export function Screen3Profile() {
  const signals = ["DESIGNING", "BUILDING", "INTEGRATING", "DEPLOYING", "EXPERIMENTING"];

  return (
    <section className="mx-auto grid max-w-3xl gap-8 py-16 md:grid-cols-2">
      <div className="space-y-2 font-mono text-sm">
        <p className="text-[--color-text-dim]">BUILDER PROFILE</p>
        <p>Name: Keyush Patel</p>
        <p>Primary function: Product development</p>
        <p>Specialties: Websites · AI · Prototypes</p>
        <p>Working style: Fast, collaborative, experimental</p>
        <p>Current status: Open for selected projects</p>
      </div>
      <div className="space-y-4">
        <ul className="flex flex-wrap gap-2 font-mono text-xs">
          {signals.map((s) => (
            <li key={s} className="rounded border border-white/10 px-2 py-1">
              {s}
            </li>
          ))}
        </ul>
        <p className="text-sm text-[--color-text-dim]">
          I enjoy taking ideas that are unclear, ambitious, or slightly unusual and turning them
          into products people can actually use. Sometimes that means building a polished
          website. Sometimes it means creating an AI workflow, prototyping a new app, or helping
          solve a difficult technical problem.
        </p>
      </div>
    </section>
  );
}
```

```tsx
// components/home/Screen4Selector.tsx
"use client";
import { useState } from "react";
import { projects } from "@/data/projects";

const MODULES = [
  {
    label: "Website",
    description: "Marketing sites, portfolio sites, platforms, dashboards, and web applications.",
    matches: (category: string) => category === "web",
  },
  {
    label: "AI System",
    description: "AI assistants, automation workflows, knowledge systems, and custom tools.",
    matches: (category: string) => category === "ai",
  },
  {
    label: "Product Prototype",
    description: "Turn an early idea into something functional, testable, and presentable.",
    matches: (category: string) => category === "prototype",
  },
  {
    label: "Technical Support",
    description: "Architecture, integrations, debugging, deployment, and product development help.",
    matches: () => false,
  },
] as const;

export function Screen4Selector() {
  const [selected, setSelected] = useState<(typeof MODULES)[number]["label"] | null>(null);
  const activeModule = MODULES.find((m) => m.label === selected);
  const matches = activeModule ? projects.filter((p) => activeModule.matches(p.category)) : [];

  return (
    <section className="mx-auto max-w-3xl py-16">
      <h2 className="mb-6 text-2xl font-display">What are you trying to build?</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {MODULES.map((m) => (
          <button
            key={m.label}
            onClick={() => setSelected(m.label)}
            className="rounded border border-white/10 p-4 text-left hover:border-white/30"
          >
            <p className="font-medium">{m.label}</p>
            <p className="mt-1 text-sm text-[--color-text-dim]">{m.description}</p>
          </button>
        ))}
      </div>
      {activeModule && (
        <div className="mt-6 font-mono text-sm">
          <p>You selected: {activeModule.label}</p>
          {matches.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {matches.map((p) => (
                <li key={p.slug}>→ {p.title}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[--color-text-dim]">
              → Get in touch — this is exactly the kind of work I take on.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/home/HomeScreens.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add components/home/Screen2Intro.tsx components/home/Screen3Profile.tsx components/home/Screen4Selector.tsx components/home/HomeScreens.test.tsx
git commit -m "feat: add homepage screens 2-4 (intro, profile, build selector)"
```

---

### Task 12: Homepage screens 5-8 (constellation, proof, process, final CTA)

**Files:**
- Create: `components/home/Screen5Constellation.tsx`, `components/home/Screen6ProofOfWork.tsx`, `components/home/Screen7Process.tsx`, `components/home/Screen8FinalCTA.tsx`
- Modify: `components/home/HomeScreens.test.tsx` — add tests for these four

**Interfaces:**
- Consumes: `projects` from `data/projects.ts` (Task 2) in `Screen5Constellation`.
- Produces: four components consumed by Task 13 (`app/page.tsx`).

- [ ] **Step 1: Write the failing test (append to existing file)**

```tsx
// components/home/HomeScreens.test.tsx  (add these imports + describe blocks)
import { Screen5Constellation } from "./Screen5Constellation";
import { Screen6ProofOfWork } from "./Screen6ProofOfWork";
import { Screen7Process } from "./Screen7Process";
import { Screen8FinalCTA } from "./Screen8FinalCTA";

describe("Screen5Constellation", () => {
  it("renders all four featured project cards with a link to their detail page", () => {
    render(<Screen5Constellation />);
    expect(screen.getByRole("link", { name: /AMS/ })).toHaveAttribute("href", "/projects/ams");
    expect(screen.getByRole("link", { name: /OSPA/ })).toHaveAttribute("href", "/projects/ospa");
    expect(screen.getByRole("link", { name: /Jewel Stone/ })).toHaveAttribute(
      "href",
      "/projects/jewel-stone"
    );
    expect(screen.getByRole("link", { name: /DIMS/ })).toHaveAttribute("href", "/projects/dims");
  });
});

describe("Screen6ProofOfWork", () => {
  it("shows the recent output log", () => {
    render(<Screen6ProofOfWork />);
    expect(screen.getByText(/Built a multi-agent AI orchestrator/)).toBeInTheDocument();
  });
});

describe("Screen7Process", () => {
  it("shows all five process stages", () => {
    render(<Screen7Process />);
    for (const stage of ["DISCOVER", "PROTOTYPE", "BUILD", "LAUNCH", "IMPROVE"]) {
      expect(screen.getByText(new RegExp(stage))).toBeInTheDocument();
    }
  });
});

describe("Screen8FinalCTA", () => {
  it("shows the final inquiry prompt and CTA", () => {
    render(<Screen8FinalCTA />);
    expect(screen.getByText("HAVE AN IDEA?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start a Project" })).toHaveAttribute(
      "href",
      "/start-a-project"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/home/HomeScreens.test.tsx`
Expected: FAIL — the four new modules don't exist yet

- [ ] **Step 3: Write the implementation**

```tsx
// components/home/Screen5Constellation.tsx
import { projects } from "@/data/projects";

export function Screen5Constellation() {
  const featured = projects.filter((p) => p.tier === "featured");

  return (
    <section id="projects" className="py-16">
      <h2 className="mb-6 text-2xl font-display">Featured</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {featured.map((p) => (
          <a
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="rounded border border-white/10 p-4 hover:border-white/30"
          >
            <p className="font-mono text-xs text-[--color-text-dim]">{p.category.toUpperCase()}</p>
            <p className="mt-1 text-lg font-medium">{p.title}</p>
            <p className="mt-1 text-sm text-[--color-text-dim]">{p.oneLiner}</p>
            <p className="mt-2 font-mono text-xs uppercase">{p.status.replace("-", " ")}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// components/home/Screen6ProofOfWork.tsx
export function Screen6ProofOfWork() {
  const lines = [
    "Built a multi-agent AI orchestrator with a live dashboard",
    "Shipped a 3D-driven jewelry e-commerce storefront",
    "Building a cross-office diamond inventory system with document extraction",
    "Developed a native macOS desktop companion app",
  ];

  return (
    <section className="py-16">
      <h2 className="mb-4 font-mono text-sm text-[--color-text-dim]">RECENT OUTPUT</h2>
      <ul className="space-y-2 font-mono text-sm">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
```

```tsx
// components/home/Screen7Process.tsx
"use client";
import { useState } from "react";

const STAGES = [
  { id: "01", name: "DISCOVER", short: "Clarify the idea, audience, and objective.", detail: "We start by getting specific about what you're actually trying to solve, who it's for, and what success looks like — before any code gets written." },
  { id: "02", name: "PROTOTYPE", short: "Create the first useful version quickly.", detail: "A fast, rough version you can react to, so we validate direction before investing in polish." },
  { id: "03", name: "BUILD", short: "Develop the product and core systems.", detail: "The real implementation: architecture, integrations, and the actual product logic." },
  { id: "04", name: "LAUNCH", short: "Deploy, test, and prepare for real users.", detail: "Getting it live, tested, and ready for people to actually use it." },
  { id: "05", name: "IMPROVE", short: "Use feedback to make the product stronger.", detail: "Once it's live, real usage tells us what to fix and what to build next." },
] as const;

export function Screen7Process() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="py-16">
      <h2 className="mb-6 text-2xl font-display">Process</h2>
      <div className="space-y-2">
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setOpenId(openId === stage.id ? null : stage.id)}
            className="block w-full rounded border border-white/10 p-4 text-left"
          >
            <p className="font-mono text-sm">
              {stage.id} {stage.name}
            </p>
            <p className="text-sm text-[--color-text-dim]">{stage.short}</p>
            {openId === stage.id && (
              <p className="mt-2 text-sm text-[--color-text-dim]">{stage.detail}</p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// components/home/Screen8FinalCTA.tsx
export function Screen8FinalCTA() {
  return (
    <section className="flex flex-col items-center gap-4 py-24 text-center">
      <h2 className="text-2xl font-display">HAVE AN IDEA?</h2>
      <p className="max-w-md text-[--color-text-dim]">
        You do not need a complete specification. Bring the rough idea. We can shape it together.
      </p>
      <a href="/start-a-project" className="rounded bg-white px-5 py-2.5 font-medium text-black">
        Start a Project
      </a>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/home/HomeScreens.test.tsx`
Expected: PASS (8 tests total across the file)

- [ ] **Step 5: Commit**

```bash
git add components/home/Screen5Constellation.tsx components/home/Screen6ProofOfWork.tsx components/home/Screen7Process.tsx components/home/Screen8FinalCTA.tsx components/home/HomeScreens.test.tsx
git commit -m "feat: add homepage screens 5-8 (constellation, proof, process, final CTA)"
```

---

### Task 13: Homepage composition

**Files:**
- Modify: `app/page.tsx`
- Test: `app/page.test.tsx`

**Interfaces:**
- Consumes: `BootSequence` (Task 10), `Screen2Intro`..`Screen8FinalCTA` (Tasks 11-12).
- Produces: full homepage — consumed manually via `npm run dev`, and by Task 19's final build check.

- [ ] **Step 1: Write the failing test**

```tsx
// app/page.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./page";

describe("Homepage", () => {
  beforeEach(() => {
    window.localStorage.setItem("orbit-os:boot-seen", "true");
  });

  it("renders all eight screens for a returning visitor (boot skipped)", () => {
    render(<Page />);
    expect(
      screen.getByText("A living system of websites, AI products, experiments, and ideas.")
    ).toBeInTheDocument();
    expect(screen.getByText("Keyush Patel")).toBeInTheDocument();
    expect(screen.getByText("What are you trying to build?")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("RECENT OUTPUT")).toBeInTheDocument();
    expect(screen.getByText("Process")).toBeInTheDocument();
    expect(screen.getByText("HAVE AN IDEA?")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/page.test.tsx`
Expected: FAIL — placeholder `app/page.tsx` doesn't render these screens yet

- [ ] **Step 3: Write the implementation**

```tsx
// app/page.tsx
"use client";
import { useState } from "react";
import { BootSequence } from "@/components/home/BootSequence";
import { Screen2Intro } from "@/components/home/Screen2Intro";
import { Screen3Profile } from "@/components/home/Screen3Profile";
import { Screen4Selector } from "@/components/home/Screen4Selector";
import { Screen5Constellation } from "@/components/home/Screen5Constellation";
import { Screen6ProofOfWork } from "@/components/home/Screen6ProofOfWork";
import { Screen7Process } from "@/components/home/Screen7Process";
import { Screen8FinalCTA } from "@/components/home/Screen8FinalCTA";

export default function Page() {
  const [booted, setBooted] = useState(false);

  return (
    <>
      <BootSequence onDone={() => setBooted(true)} />
      {booted && (
        <div>
          <Screen2Intro />
          <Screen3Profile />
          <Screen4Selector />
          <Screen5Constellation />
          <Screen6ProofOfWork />
          <Screen7Process />
          <Screen8FinalCTA />
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/page.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/page.test.tsx
git commit -m "feat: compose homepage from all eight screens"
```

---

### Task 14: Project detail page + links component

**Files:**
- Create: `app/projects/[slug]/page.tsx`, `components/projects/ProjectLinks.tsx`
- Test: `components/projects/ProjectLinks.test.tsx`

**Interfaces:**
- Consumes: `Project`, `projects` from `data/projects.ts` (Task 2).
- Produces: `<ProjectLinks project={Project} />` — used inline by `app/projects/[slug]/page.tsx`.

- [ ] **Step 1: Write the failing test**

```tsx
// components/projects/ProjectLinks.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectLinks } from "./ProjectLinks";
import type { Project } from "@/data/projects";

const base: Project = {
  slug: "example",
  title: "Example",
  category: "web",
  tier: "featured",
  oneLiner: "An example.",
  status: "in-development",
  role: "Builder",
  problem: "p",
  contribution: "c",
  solution: "s",
  techStack: ["Next.js"],
  challenges: [],
  outcome: ["o"],
  screenshots: [],
};

describe("ProjectLinks", () => {
  it("shows only 'Discuss a Similar Project' when github/live are absent", () => {
    render(<ProjectLinks project={base} />);
    expect(screen.queryByText("View GitHub")).not.toBeInTheDocument();
    expect(screen.queryByText("Open Live Project")).not.toBeInTheDocument();
    expect(screen.getByText("Discuss a Similar Project")).toBeInTheDocument();
  });

  it("shows GitHub and live links when present", () => {
    render(
      <ProjectLinks
        project={{ ...base, githubUrl: "https://github.com/example/repo", liveUrl: "https://example.com" }}
      />
    );
    expect(screen.getByText("View GitHub")).toHaveAttribute(
      "href",
      "https://github.com/example/repo"
    );
    expect(screen.getByText("Open Live Project")).toHaveAttribute("href", "https://example.com");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/projects/ProjectLinks.test.tsx`
Expected: FAIL — `Cannot find module './ProjectLinks'`

- [ ] **Step 3: Write the implementation**

```tsx
// components/projects/ProjectLinks.tsx
import type { Project } from "@/data/projects";

export function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap gap-3">
      {project.liveUrl && (
        <a href={project.liveUrl} className="rounded bg-white px-4 py-2 text-sm text-black">
          Open Live Project
        </a>
      )}
      {project.githubUrl && (
        <a href={project.githubUrl} className="rounded border border-white/20 px-4 py-2 text-sm">
          View GitHub
        </a>
      )}
      <a
        href={`/start-a-project?interest=${encodeURIComponent(project.category)}`}
        className="rounded border border-white/20 px-4 py-2 text-sm"
      >
        Discuss a Similar Project
      </a>
    </div>
  );
}
```

```tsx
// app/projects/[slug]/page.tsx
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { ProjectLinks } from "@/components/projects/ProjectLinks";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-8 py-12">
      <header>
        <p className="font-mono text-xs text-[--color-text-dim]">
          {project.category.toUpperCase()} · {project.status.replace("-", " ").toUpperCase()}
        </p>
        <h1 className="text-3xl font-display">{project.title}</h1>
        <p className="mt-2 text-[--color-text-dim]">{project.oneLiner}</p>
      </header>

      <section>
        <h2 className="font-mono text-xs text-[--color-text-dim]">THE PROBLEM</h2>
        <p className="mt-1">{project.problem}</p>
      </section>

      <section>
        <h2 className="font-mono text-xs text-[--color-text-dim]">MY CONTRIBUTION</h2>
        <p className="mt-1">{project.contribution}</p>
      </section>

      <section>
        <h2 className="font-mono text-xs text-[--color-text-dim]">THE SOLUTION</h2>
        <p className="mt-1">{project.solution}</p>
      </section>

      <section>
        <h2 className="font-mono text-xs text-[--color-text-dim]">TECHNICAL SYSTEM</h2>
        <ul className="mt-1 flex flex-wrap gap-2 font-mono text-xs">
          {project.techStack.map((t) => (
            <li key={t} className="rounded border border-white/10 px-2 py-1">
              {t}
            </li>
          ))}
        </ul>
      </section>

      {project.challenges.length > 0 && (
        <section>
          <h2 className="font-mono text-xs text-[--color-text-dim]">CHALLENGES</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {project.challenges.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-mono text-xs text-[--color-text-dim]">OUTCOME</h2>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {project.outcome.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      <ProjectLinks project={project} />
    </article>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/projects/ProjectLinks.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add app/projects/ components/projects/
git commit -m "feat: add project detail page and conditional project links"
```

---

### Task 15: Capabilities page

**Files:**
- Create: `app/capabilities/page.tsx`
- Test: `app/capabilities/page.test.tsx`

**Interfaces:**
- Consumes: `capabilities` from `data/capabilities.ts` (Task 3).

- [ ] **Step 1: Write the failing test**

```tsx
// app/capabilities/page.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CapabilitiesPage from "./page";

describe("CapabilitiesPage", () => {
  it("renders all four capability modules with their outputs", () => {
    render(<CapabilitiesPage />);
    expect(screen.getByText("Web Development")).toBeInTheDocument();
    expect(screen.getByText("AI Systems")).toBeInTheDocument();
    expect(screen.getByText("Product Prototyping")).toBeInTheDocument();
    expect(screen.getByText("Technical Collaboration")).toBeInTheDocument();
    expect(screen.getAllByText("Available")).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/capabilities/page.test.tsx`
Expected: FAIL — `Cannot find module './page'`

- [ ] **Step 3: Write the implementation**

```tsx
// app/capabilities/page.tsx
import { capabilities } from "@/data/capabilities";

export default function CapabilitiesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-12">
      <h1 className="text-3xl font-display">Capabilities</h1>
      {capabilities.map((c) => (
        <section key={c.name} className="rounded border border-white/10 p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-mono text-sm">{c.name.toUpperCase()}</h2>
            <span className="font-mono text-xs text-[--color-accent-web]">{c.status}</span>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-mono text-xs text-[--color-text-dim]">USEFUL FOR</p>
              <ul className="mt-1 space-y-0.5 text-sm">
                {c.usefulFor.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs text-[--color-text-dim]">OUTPUTS</p>
              <ul className="mt-1 space-y-0.5 text-sm">
                {c.outputs.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/capabilities/page.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add app/capabilities/
git commit -m "feat: add capabilities page"
```

---

### Task 16: README / About page

**Files:**
- Create: `app/readme/page.tsx`
- Test: `app/readme/page.test.tsx`

**Interfaces:**
- No cross-task data dependency — content is authored directly in this task (real copy, not placeholder, per Global Constraints).

- [ ] **Step 1: Write the failing test**

```tsx
// app/readme/page.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ReadmePage from "./page";

describe("ReadmePage", () => {
  it("renders the about heading and the timeline", () => {
    render(<ReadmePage />);
    expect(screen.getByText("# Hello")).toBeInTheDocument();
    expect(screen.getByText(/Started building websites/)).toBeInTheDocument();
    expect(screen.getByText(/Now combining everything into one practice/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/readme/page.test.tsx`
Expected: FAIL — `Cannot find module './page'`

- [ ] **Step 3: Write the implementation**

```tsx
// app/readme/page.tsx
export default function ReadmePage() {
  const sections = [
    {
      id: "about",
      body: (
        <>
          <p># Hello</p>
          <p className="mt-2">
            I&apos;m Keyush Patel, a developer and product builder. I work across websites, AI
            systems, product prototypes, and experiments that begin with questions like:
          </p>
          <p className="mt-2">&quot;Could we make this?&quot;</p>
          <p>&quot;Would this be useful?&quot;</p>
          <p>&quot;What happens if we try?&quot;</p>
        </>
      ),
    },
    {
      id: "philosophy",
      body: (
        <p>
          Most of what I build starts as someone&apos;s rough idea, not a finished spec. I&apos;d
          rather ship a working first version fast and improve it against real feedback than
          polish something nobody has used yet.
        </p>
      ),
    },
    {
      id: "how-i-work",
      body: (
        <p>
          Fast, collaborative, and hands-on with the whole stack — design, frontend, backend,
          and deployment. I work directly with whoever has the idea, not through a long chain of
          handoffs.
        </p>
      ),
    },
    {
      id: "currently-building",
      body: (
        <p>
          ORBIT OS (this site), AMS — a multi-agent orchestrator, DIMS — a cross-office diamond
          inventory system, and OSPA — a native macOS companion for non-technical users.
        </p>
      ),
    },
    {
      id: "tools-i-use",
      body: <p>Next.js, TypeScript, Tailwind CSS, Python, Swift, Supabase, and a growing set of AI tooling.</p>,
    },
    {
      id: "outside-code",
      body: <p>Still figuring out the best way to say this — check back soon.</p>,
    },
    {
      id: "contact",
      body: (
        <p>
          Best way in is the <a href="/start-a-project" className="underline">Start a Project</a> flow.
        </p>
      ),
    },
  ];

  const timeline = [
    "Started building websites",
    "Began helping friends with applications",
    "Explored product development",
    "Started developing AI systems",
    "Now combining everything into one practice",
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-10 py-12 font-mono text-sm">
      {sections.map((s) => (
        <section key={s.id}>
          <p className="mb-2 text-xs text-[--color-text-dim]">/{s.id}</p>
          <div className="font-sans text-base">{s.body}</div>
        </section>
      ))}
      <section>
        <p className="mb-2 text-xs text-[--color-text-dim]">/timeline</p>
        <ul className="space-y-1 font-sans">
          {timeline.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/readme/page.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add app/readme/
git commit -m "feat: add README/About page"
```

Note: the `/outside-code` section has an honest placeholder line ("Still figuring out the best way to say this") — this is real, intentional copy (a personality beat the doc itself endorses via its "informal language" guidance for the Playground), not a content gap. Replace with real material whenever the owner wants to.

---

### Task 17: Inquiry flow UI

**Files:**
- Create: `components/inquiry/InquiryFlow.tsx`
- Test: `components/inquiry/InquiryFlow.test.tsx`

**Interfaces:**
- Consumes: `initialInquiryState`, `isStepComplete`, `nextStep`, `InquiryState` from `lib/inquiry-flow.ts` (Task 8).
- Produces: `<InquiryFlow onSubmit={(state: InquiryState) => Promise<void>} initialInterest?: string />` — consumed by Task 19 (`app/start-a-project/page.tsx`).

- [ ] **Step 1: Write the failing test**

```tsx
// components/inquiry/InquiryFlow.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InquiryFlow } from "./InquiryFlow";

describe("InquiryFlow", () => {
  it("walks through all five steps and calls onSubmit with the collected state", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<InquiryFlow onSubmit={onSubmit} />);

    await user.click(screen.getByText("Website"));
    await user.click(screen.getByText("Continue"));

    await user.click(screen.getByText("Just an idea"));
    await user.click(screen.getByText("Continue"));

    await user.type(screen.getByLabelText(/successful outcome/i), "A working site");
    await user.click(screen.getByText("Continue"));

    await user.click(screen.getByText("Within one month"));
    await user.click(screen.getByText("Continue"));

    await user.type(screen.getByLabelText(/reach you/i), "me@example.com");
    await user.click(screen.getByText("Continue"));

    expect(screen.getByText("PROJECT REQUEST GENERATED")).toBeInTheDocument();
    await user.click(screen.getByText("Send Request"));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        interest: "Website",
        stage: "Just an idea",
        outcome: "A working site",
        timeline: "Within one month",
        contact: "me@example.com",
      })
    );
  });

  it("pre-fills interest and skips straight to the stage step when initialInterest is given", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<InquiryFlow onSubmit={onSubmit} initialInterest="AI system" />);
    expect(screen.getByText("What stage are you at?")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/inquiry/InquiryFlow.test.tsx`
Expected: FAIL — `Cannot find module './InquiryFlow'`

- [ ] **Step 3: Write the implementation**

```tsx
// components/inquiry/InquiryFlow.tsx
"use client";
import { useState } from "react";
import { initialInquiryState, isStepComplete, nextStep, type InquiryState } from "@/lib/inquiry-flow";

const INTERESTS = ["Website", "AI system", "Product prototype", "Technical support", "Something unusual"];
const STAGES = ["Just an idea", "Planning", "Already designed", "Existing product", "Something is broken"];
const TIMELINES = ["As soon as possible", "Within one month", "Within three months", "Flexible"];

export function InquiryFlow({
  onSubmit,
  initialInterest,
}: {
  onSubmit: (state: InquiryState) => Promise<void>;
  initialInterest?: string;
}) {
  const [state, setState] = useState<InquiryState>(() =>
    initialInterest
      ? nextStep({ ...initialInquiryState, interest: initialInterest })
      : initialInquiryState
  );
  const canContinue = isStepComplete(state, state.step);

  const choiceButton = (label: string, field: "interest" | "stage" | "timeline", selected: string | null) => (
    <button
      key={label}
      onClick={() => setState({ ...state, [field]: label })}
      className={`block w-full rounded border p-3 text-left ${
        selected === label ? "border-white" : "border-white/10"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-md space-y-4 py-12">
      {state.step === "interest" && (
        <div className="space-y-2">
          <p className="font-mono text-sm">What are you interested in?</p>
          {INTERESTS.map((l) => choiceButton(l, "interest", state.interest))}
        </div>
      )}

      {state.step === "stage" && (
        <div className="space-y-2">
          <p className="font-mono text-sm">What stage are you at?</p>
          {STAGES.map((l) => choiceButton(l, "stage", state.stage))}
        </div>
      )}

      {state.step === "outcome" && (
        <div className="space-y-2">
          <label htmlFor="outcome" className="font-mono text-sm">
            What would a successful outcome look like?
          </label>
          <textarea
            id="outcome"
            value={state.outcome}
            onChange={(e) => setState({ ...state, outcome: e.target.value })}
            className="w-full rounded border border-white/10 bg-transparent p-2"
          />
        </div>
      )}

      {state.step === "timeline" && (
        <div className="space-y-2">
          <p className="font-mono text-sm">Do you have a preferred timeline?</p>
          {TIMELINES.map((l) => choiceButton(l, "timeline", state.timeline))}
        </div>
      )}

      {state.step === "contact" && (
        <div className="space-y-2">
          <label htmlFor="contact" className="font-mono text-sm">
            Tell me how to reach you.
          </label>
          <input
            id="contact"
            value={state.contact}
            onChange={(e) => setState({ ...state, contact: e.target.value })}
            className="w-full rounded border border-white/10 bg-transparent p-2"
          />
        </div>
      )}

      {state.step === "review" && (
        <div className="space-y-3 font-mono text-sm">
          <p>PROJECT REQUEST GENERATED</p>
          <p className="text-[--color-text-dim]">Status: Ready to send</p>
          <button
            onClick={() => onSubmit(state)}
            className="rounded bg-white px-4 py-2 text-black"
          >
            Send Request
          </button>
        </div>
      )}

      {state.step !== "review" && (
        <button
          disabled={!canContinue}
          onClick={() => setState(nextStep(state))}
          className="rounded bg-white px-4 py-2 text-black disabled:opacity-40"
        >
          Continue
        </button>
      )}

      <p className="text-xs text-[--color-text-dim]">
        Prefer email? Write to{" "}
        <a href="mailto:hello@orbitos.dev" className="underline">
          hello@orbitos.dev
        </a>{" "}
        directly.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/inquiry/InquiryFlow.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add components/inquiry/
git commit -m "feat: add conversational inquiry flow UI"
```

---

### Task 18: Inquiry API route (Resend)

**Files:**
- Create: `app/api/inquiry/route.ts`
- Test: `app/api/inquiry/route.test.ts`

**Interfaces:**
- Consumes: `generateInquiryReference` from `lib/inquiry-reference.ts` (Task 4).
- Produces: `POST` handler returning `{ reference: string }` on success or `{ error: string }` with status 400 — consumed by Task 19 (`app/start-a-project/page.tsx`).

- [ ] **Step 1: Write the failing test**

```ts
// app/api/inquiry/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const sendMock = vi.fn().mockResolvedValue({ data: { id: "email_123" }, error: null });

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

describe("POST /api/inquiry", () => {
  beforeEach(() => {
    sendMock.mockClear();
    process.env.RESEND_API_KEY = "test-key";
    process.env.INQUIRY_TO_EMAIL = "owner@example.com";
  });

  it("returns 400 when required fields are missing", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost/api/inquiry", {
      method: "POST",
      body: JSON.stringify({ interest: "Website" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("sends the email and returns a reference on valid input", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost/api/inquiry", {
      method: "POST",
      body: JSON.stringify({
        interest: "Website",
        stage: "Just an idea",
        outcome: "A working site",
        timeline: "Within one month",
        contact: "me@example.com",
      }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.reference).toMatch(/^PRJ-\d{4}-\d{3}$/);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].to).toBe("owner@example.com");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/api/inquiry/route.test.ts`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 3: Write the implementation**

```ts
// app/api/inquiry/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateInquiryReference } from "@/lib/inquiry-reference";

interface InquiryPayload {
  interest?: string;
  stage?: string;
  outcome?: string;
  timeline?: string;
  contact?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as InquiryPayload;

  if (!body.interest || !body.stage || !body.outcome || !body.timeline || !body.contact) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const reference = generateInquiryReference();
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "ORBIT OS <onboarding@resend.dev>",
    to: process.env.INQUIRY_TO_EMAIL ?? "",
    subject: `New project inquiry — ${reference}`,
    text: [
      `Reference: ${reference}`,
      `Interested in: ${body.interest}`,
      `Stage: ${body.stage}`,
      `Desired outcome: ${body.outcome}`,
      `Timeline: ${body.timeline}`,
      `Contact: ${body.contact}`,
    ].join("\n"),
  });

  return NextResponse.json({ reference });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/api/inquiry/route.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add app/api/inquiry/
git commit -m "feat: add inquiry API route sending email via Resend"
```

---

### Task 19: Wire root layout, Start a Project page, env template

**Files:**
- Modify: `app/layout.tsx` (wrap children in `OSShell`)
- Create: `app/start-a-project/page.tsx`
- Modify: `.env.example`
- Test: `app/start-a-project/page.test.tsx`

**Interfaces:**
- Consumes: `OSShell` (Task 9), `InquiryFlow` (Task 17), `POST /api/inquiry` (Task 18).

- [ ] **Step 1: Write the failing test**

```tsx
// app/start-a-project/page.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StartAProjectPage from "./page";

describe("StartAProjectPage", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reference: "PRJ-2026-042" }),
    }) as unknown as typeof fetch;
  });

  it("submits the flow and shows the confirmation reference", async () => {
    const user = userEvent.setup();
    render(<StartAProjectPage />);

    await user.click(screen.getByText("Website"));
    await user.click(screen.getByText("Continue"));
    await user.click(screen.getByText("Just an idea"));
    await user.click(screen.getByText("Continue"));
    await user.type(screen.getByLabelText(/successful outcome/i), "A working site");
    await user.click(screen.getByText("Continue"));
    await user.click(screen.getByText("Within one month"));
    await user.click(screen.getByText("Continue"));
    await user.type(screen.getByLabelText(/reach you/i), "me@example.com");
    await user.click(screen.getByText("Continue"));
    await user.click(screen.getByText("Send Request"));

    expect(await screen.findByText(/PRJ-2026-042/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/start-a-project/page.test.tsx`
Expected: FAIL — `Cannot find module './page'`

- [ ] **Step 3: Write the implementation**

```tsx
// app/start-a-project/page.tsx
"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { InquiryFlow } from "@/components/inquiry/InquiryFlow";
import { categoryToInterestLabel } from "@/lib/inquiry-flow";
import type { InquiryState } from "@/lib/inquiry-flow";
import type { ProjectCategory } from "@/data/projects";

const VALID_CATEGORIES: ProjectCategory[] = ["ai", "web", "prototype", "open-source"];

export default function StartAProjectPage() {
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get("interest");
  const initialInterest =
    rawCategory && (VALID_CATEGORIES as string[]).includes(rawCategory)
      ? categoryToInterestLabel(rawCategory as ProjectCategory)
      : undefined;

  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(state: InquiryState) {
    setError(null);
    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (!res.ok) {
      setError("Something went wrong sending that — try the email link below instead.");
      return;
    }
    const body = await res.json();
    setReference(body.reference as string);
  }

  if (reference) {
    return (
      <div className="mx-auto max-w-md space-y-2 py-12 font-mono text-sm">
        <p>SENT — reference {reference}</p>
        <p className="text-[--color-text-dim]">I&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <div>
      {error && <p className="mx-auto max-w-md pt-8 text-sm text-red-400">{error}</p>}
      <InquiryFlow onSubmit={handleSubmit} initialInterest={initialInterest} />
    </div>
  );
}
```

`useSearchParams` requires this page to render inside a `<Suspense>` boundary in the App Router — wrap the default export's contents accordingly, or mark the page dynamic (`export const dynamic = "force-dynamic"`) if a build-time warning appears. Since `ProjectLinks` (Task 14) always links here with `?interest=<category>`, this page must handle the no-param case too (already covered: `rawCategory` is `null`, `initialInterest` stays `undefined`, `InquiryFlow` falls back to its default first step).

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { OSShell } from "@/components/shell/OSShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORBIT OS — Keyush Patel",
  description: "A living system of websites, AI products, experiments, and ideas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OSShell>{children}</OSShell>
      </body>
    </html>
  );
}
```

```bash
# .env.example
RESEND_API_KEY=
INQUIRY_TO_EMAIL=
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/start-a-project/page.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Run the full suite and the production build**

Run: `npm test`
Expected: all tests across every task pass.

Run: `npm run build`
Expected: production build succeeds with no type errors.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/start-a-project/ .env.example
git commit -m "feat: wire OS shell into root layout and add Start a Project page"
```

---

## Post-plan follow-ups (owner-supplied, not blocking Phase 1)

- Real GitHub profile URL → replace `/#` in `lib/palette-commands.ts`'s `github` command.
- Per-project `githubUrl` / `liveUrl` values, once the owner confirms which are public/live (jewel-stone status explicitly marked `"tbd"` until then).
- Real domain purchase (`orbitos.dev` or similar) → update `metadataBase`/`og:url` once acquired; `hello@orbitos.dev` in `InquiryFlow.tsx` is a placeholder mailto until a real inbox exists at the real domain — update alongside domain purchase.
- Gujarati script for the third nav rotation state, once supplied exactly (not transliterated).
