# Graph Report - /Volumes/ai-hub/orbit-os  (2026-08-07)

## Corpus Check
- Corpus is ~18,949 words - fits in a single context window. You may not need a graph.

## Summary
- 310 nodes · 426 edges · 25 communities (19 shown, 6 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.92)
- Token cost: 162,110 input · 0 output

## Community Hubs (Navigation)
- Homepage Composition & Project Registry
- ESLint & Test Tooling Deps
- TypeScript Config Types
- README Page & Plan Concept
- Start-a-Project Page & Inquiry Interests
- Root Layout & OS Shell Chrome
- Inquiry Flow Backend & Command Palette
- Core Dependencies (Next.js, Framer Motion)
- Homepage Screens 2-3
- Project Detail Page & Links
- Capabilities Page & Data
- Design Tokens & Tech Architecture
- Boot Sequence Component & Logic
- Capabilities Data & Tests
- Inquiry API Route & Reference Generator
- Design Tokens Module
- ESLint Config File
- Reduced-Motion Hook
- README Page Route
- Inquiry Route Test Mock
- Next Config
- PostCSS Config
- Tailwind Config

## God Nodes (most connected - your core abstractions)
1. `ORBIT OS Personal Builder Portfolio Phase 1 Design Spec` - 20 edges
2. `compilerOptions` - 15 edges
3. `data/projects.ts (Project registry)` - 10 edges
4. `§6 Homepage: Command Center — 8 screens` - 9 edges
5. `§8 Capabilities page` - 7 edges
6. `nextStep()` - 6 edges
7. `scripts` - 6 edges
8. `Task 1: Project scaffold, design tokens, test tooling` - 6 edges
9. `Task 19: Wire root layout, Start a Project page, env template` - 6 edges
10. `data/capabilities.ts (Capability registry)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Vercel` --semantically_similar_to--> `§15 Technical architecture`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/specs/2026-08-07-orbit-os-portfolio-design.md
- `Next.js` --semantically_similar_to--> `Next.js 14 (App Router, TypeScript strict)`  [INFERRED] [semantically similar]
  README.md → docs/superpowers/plans/2026-08-07-orbit-os-phase1.md
- `POST()` --calls--> `generateInquiryReference()`  [EXTRACTED]
  app/api/inquiry/route.ts → lib/inquiry-reference.ts
- `StartAProjectContent()` --calls--> `categoryToInterestLabel()`  [EXTRACTED]
  app/start-a-project/page.tsx → lib/inquiry-flow.ts
- `BootSequence()` --calls--> `hasSeenBoot()`  [EXTRACTED]
  components/home/BootSequence.tsx → lib/boot-sequence.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **ORBIT OS Homepage 8-Screen Composition (app/page.tsx)** — docs_superpowers_plans_2026_08_07_orbit_os_phase1_boot_sequence_component, docs_superpowers_plans_2026_08_07_orbit_os_phase1_screen2_intro, docs_superpowers_plans_2026_08_07_orbit_os_phase1_screen3_profile, docs_superpowers_plans_2026_08_07_orbit_os_phase1_screen4_selector, docs_superpowers_plans_2026_08_07_orbit_os_phase1_screen5_constellation, docs_superpowers_plans_2026_08_07_orbit_os_phase1_screen6_proof, docs_superpowers_plans_2026_08_07_orbit_os_phase1_screen7_process, docs_superpowers_plans_2026_08_07_orbit_os_phase1_screen8_final_cta [EXTRACTED 1.00]
- **Phase 1 Featured Project Registry (AMS, OSPA, Jewel Stone, DIMS)** — docs_superpowers_plans_2026_08_07_orbit_os_phase1_project_ams, docs_superpowers_plans_2026_08_07_orbit_os_phase1_project_ospa, docs_superpowers_plans_2026_08_07_orbit_os_phase1_project_jewel_stone, docs_superpowers_plans_2026_08_07_orbit_os_phase1_project_dims [EXTRACTED 1.00]
- **Capabilities Page — Four Category Modules** — docs_superpowers_specs_2026_08_07_orbit_os_portfolio_design_capability_web_dev, docs_superpowers_specs_2026_08_07_orbit_os_portfolio_design_capability_ai_systems, docs_superpowers_specs_2026_08_07_orbit_os_portfolio_design_capability_product_prototyping, docs_superpowers_specs_2026_08_07_orbit_os_portfolio_design_capability_technical_collab [EXTRACTED 1.00]

## Communities (25 total, 6 thin omitted)

### Community 0 - "Homepage Composition & Project Registry"
Cohesion: 0.07
Nodes (40): app/page.tsx (Homepage composition), components/home/BootSequence.tsx, lib/boot-sequence.ts (hasSeenBoot, markBootSeen), data/projects.ts (Project registry), AMS (project registry entry), app/projects/[slug]/page.tsx, DIMS (project registry entry), Jewel Stone (project registry entry) (+32 more)

### Community 1 - "ESLint & Test Tooling Deps"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, postcss (+21 more)

### Community 2 - "TypeScript Config Types"
Cohesion: 0.08
Nodes (25): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+17 more)

### Community 3 - "README Page & Plan Concept"
Cohesion: 0.11
Nodes (23): Global Constraints (Phase 1), ORBIT OS Phase 1 Implementation Plan, app/readme/page.tsx, Task 16: README / About page, §3 Brand identity, §17 Build workflow for tonight (Relay), ORBIT OS Concept — personal operating system, not a resume, Gujarati nav rotation (deferred, needs owner-supplied script) (+15 more)

### Community 4 - "Start-a-Project Page & Inquiry Interests"
Cohesion: 0.18
Nodes (16): StartAProjectContent(), StartAProjectPage(), VALID_CATEGORIES, InquiryFlow(), INTERESTS, STAGES, TIMELINES, ProjectCategory (+8 more)

### Community 5 - "Root Layout & OS Shell Chrome"
Cohesion: 0.15
Nodes (11): geistMono, geistSans, metadata, CommandPalette(), OSShell(), SideDock(), SystemStatus(), TopBar() (+3 more)

### Community 6 - "Inquiry Flow Backend & Command Palette"
Cohesion: 0.16
Nodes (21): GitHub command placeholder note, app/api/inquiry/route.ts, lib/inquiry-flow.ts (inquiry state machine), components/inquiry/InquiryFlow.tsx, lib/inquiry-reference.ts (generateInquiryReference), components/shell/OSShell.tsx (+ TopBar, SideDock, SystemStatus, CommandPalette), lib/palette-commands.ts (paletteCommands, filterCommands), Post-plan follow-ups (owner-supplied, not blocking Phase 1) (+13 more)

### Community 7 - "Core Dependencies (Next.js, Framer Motion)"
Cohesion: 0.10
Nodes (20): framer-motion, next, dependencies, framer-motion, next, react, react-dom, resend (+12 more)

### Community 8 - "Homepage Screens 2-3"
Cohesion: 0.22
Nodes (10): Page(), Screen2Intro(), Screen3Profile(), MODULES, Screen4Selector(), Screen5Constellation(), Screen6ProofOfWork(), Screen7Process() (+2 more)

### Community 9 - "Project Detail Page & Links"
Cohesion: 0.26
Nodes (6): ProjectLinks(), base, Project, projects, ProjectStatus, ProjectTier

### Community 10 - "Capabilities Page & Data"
Cohesion: 0.22
Nodes (13): app/capabilities/page.tsx, AI Systems capability entry, Product Prototyping capability entry, Technical Collaboration capability entry, Web Development capability entry, data/capabilities.ts (Capability registry), Task 15: Capabilities page, Task 3: Capabilities data (+5 more)

### Community 11 - "Design Tokens & Tech Architecture"
Cohesion: 0.22
Nodes (13): lib/design-tokens.ts (colors, fonts), Task 1: Project scaffold, design tokens, test tooling, Framer Motion, Next.js 14 (App Router, TypeScript strict), Resend, Tailwind CSS, Vitest + Testing Library + jsdom, §15 Technical architecture (+5 more)

### Community 12 - "Boot Sequence Component & Logic"
Cohesion: 0.42
Nodes (4): BootSequence(), LINES, hasSeenBoot(), markBootSeen()

### Community 13 - "Capabilities Data & Tests"
Cohesion: 0.43
Nodes (3): CapabilitiesPage(), capabilities, Capability

### Community 14 - "Inquiry API Route & Reference Generator"
Cohesion: 0.53
Nodes (3): InquiryPayload, POST(), generateInquiryReference()

### Community 15 - "Design Tokens Module"
Cohesion: 0.60
Nodes (3): AccentCategory, colors, fonts

### Community 16 - "ESLint Config File"
Cohesion: 0.50
Nodes (3): extends, next/core-web-vitals, next/typescript

## Knowledge Gaps
- **85 isolated node(s):** `next/core-web-vitals`, `next/typescript`, `sendMock`, `InquiryPayload`, `geistSans` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ORBIT OS Personal Builder Portfolio Phase 1 Design Spec` connect `README Page & Plan Concept` to `Homepage Composition & Project Registry`, `Capabilities Page & Data`, `Design Tokens & Tech Architecture`, `Inquiry Flow Backend & Command Palette`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `§6 Homepage: Command Center — 8 screens` connect `Homepage Composition & Project Registry` to `README Page & Plan Concept`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `§8 Capabilities page` connect `Capabilities Page & Data` to `README Page & Plan Concept`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `next/typescript`, `sendMock` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Homepage Composition & Project Registry` be split into smaller, more focused modules?**
  _Cohesion score 0.06923076923076923 - nodes in this community are weakly interconnected._
- **Should `ESLint & Test Tooling Deps` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config Types` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._