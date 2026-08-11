export type ProjectCategory = "ai" | "web" | "prototype" | "open-source";
export type ProjectTier = "featured" | "supporting" | "archive";
export type ProjectStatus = "live" | "in-development" | "archived" | "tbd";

/**
 * Narrative fields are optional by design. Featured projects carry a full case
 * study; supporting and archive entries carry a one-liner, a stack, and links.
 * Inventing problem/outcome copy for every repo would make the portfolio read
 * as padded, so those fields stay empty unless the story is real.
 */
export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  tier: ProjectTier;
  oneLiner: string;
  status: ProjectStatus;
  techStack: string[];
  year?: string;
  role?: string;
  problem?: string;
  contribution?: string;
  solution?: string;
  challenges?: string[];
  outcome?: string[];
  githubUrl?: string;
  liveUrl?: string;
  screenshots: string[];
}

const GH = "https://github.com/viralfaceless25-sketch";

export const projects: Project[] = [
  /* ---------------------------------------------------------------- featured */
  {
    slug: "ams",
    title: "AMS",
    category: "ai",
    tier: "featured",
    oneLiner: "Coordinates multiple AI agents from one orchestrator dashboard.",
    status: "in-development",
    role: "Sole builder. Architecture, orchestrator, dashboard.",
    problem:
      "Running several AI agents on real work meant juggling separate terminals, logs, and state with no shared view of what each agent was doing or had access to.",
    contribution:
      "Designed and built the orchestrator core, the agent/account/skills model, and the dashboard that surfaces it.",
    solution:
      "A Python orchestrator manages agent accounts, skills, and run state in SQLite, exposing everything through a Next.js dashboard so multiple agents can be launched, monitored, and coordinated from one place.",
    techStack: ["Python", "SQLite", "Next.js", "TypeScript", "Tailwind CSS"],
    challenges: [
      'Modeling agent "skills" so they are shareable across agents without duplicating logic per agent.',
      "Keeping the dashboard in sync with orchestrator state without a heavy real-time infrastructure.",
    ],
    outcome: [
      "Runs multiple agents against real client and personal projects from a single control surface.",
      "Skill system reused across agents instead of rebuilt per agent.",
    ],
    screenshots: [],
  },
  {
    slug: "gold",
    title: "Albert's Gold and Silver",
    category: "web",
    tier: "featured",
    oneLiner:
      "A bullion dealer platform: customer storefront, staff back-office, and mobile app on one live market feed.",
    status: "live",
    role: "Design and development across all three surfaces.",
    problem:
      "A retail bullion dealer prices every product against a market that moves all day. Static prices go stale within minutes, and staff had no shared place to manage stock and orders against the live spot rate.",
    contribution:
      "Built the storefront, the staff back-office, and the mobile application, all reading a single live market feed.",
    solution:
      "One pricing pipeline drives every surface. Product prices derive from the live spot feed rather than being entered by hand, so the storefront, back-office, and mobile app never disagree.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    challenges: [
      "Deriving every displayed price from one live feed so the three surfaces can never drift out of sync.",
      "Keeping the storefront fast while prices update continuously.",
    ],
    outcome: [
      "Storefront, staff back-office, and mobile app shipped against a single source of pricing truth.",
      "Deployed and running publicly.",
    ],
    githubUrl: `${GH}/gold-website`,
    liveUrl: "https://albertsgold.vercel.app",
    screenshots: [],
  },
  {
    slug: "jewel-stone",
    title: "Jewel Stone",
    category: "web",
    tier: "featured",
    oneLiner: "A 3D-driven jewelry storefront with checkout and custom product configuration.",
    status: "live",
    role: "Design and development.",
    problem:
      "A jewelry retailer needed an online storefront that could show product detail and craftsmanship the way a physical showroom does, not just flat product photos.",
    contribution:
      "Built the storefront end to end: 3D product presentation, checkout, and the custom-order flow.",
    solution:
      "A Next.js storefront rendering products in 3D with React Three Fiber, GSAP and Framer Motion driven interaction, Stripe checkout, and document handling for custom orders.",
    techStack: [
      "Next.js",
      "React Three Fiber",
      "Three.js",
      "GSAP",
      "Framer Motion",
      "Stripe",
      "TypeScript",
    ],
    challenges: [
      "Keeping 3D product rendering performant on real devices, not just on a dev machine.",
      "Making a checkout flow feel as premium as the 3D product experience around it.",
    ],
    outcome: [
      "Full storefront built end to end, from 3D product views through checkout.",
      "Custom-order flow handles real document upload and extraction.",
    ],
    githubUrl: `${GH}/jewel-stone`,
    liveUrl: "https://thejewelstone.com",
    screenshots: [],
  },
  {
    slug: "dims",
    title: "DIMS",
    category: "prototype",
    tier: "featured",
    oneLiner: "Shared diamond inventory and request system across three offices.",
    status: "in-development",
    role: "Sole builder. Backend, frontend, desktop app.",
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
    githubUrl: `${GH}/DIMS-Diamond-Inventory-sales-Management-System-`,
    screenshots: [],
  },
  {
    slug: "ospa",
    title: "OSPA",
    category: "ai",
    tier: "featured",
    oneLiner: "A native macOS companion that helps non-technical people use their computer safely.",
    status: "in-development",
    role: "Sole builder. Native app, interaction and consent model.",
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
      "Consent and audit architecture in place for later milestones that add real actions.",
    ],
    githubUrl: `${GH}/-OSPA-OSPetAgent.`,
    screenshots: [],
  },

  /* -------------------------------------------------------------- supporting */
  {
    slug: "mega-ice",
    title: "Mega Ice",
    category: "web",
    tier: "supporting",
    oneLiner: "Ice delivery storefront with a 3D product presentation.",
    status: "live",
    techStack: ["React", "Three.js", "React Three Fiber", "Framer Motion"],
    githubUrl: `${GH}/megaicesite`,
    liveUrl: "https://megaicedelivery.com",
    screenshots: [],
  },
  {
    slug: "fantasy-diamonds",
    title: "Fantasy Diamonds",
    category: "web",
    tier: "supporting",
    oneLiner: "A fast, static diamond retailer site built on Astro.",
    status: "live",
    techStack: ["Astro", "Tailwind CSS"],
    githubUrl: `${GH}/fantasy-diamonds`,
    liveUrl: "https://fantasy-diamonds.netlify.app",
    screenshots: [],
  },
  {
    slug: "arch-jewelers",
    title: "Arch Jewelers",
    category: "web",
    tier: "supporting",
    oneLiner: "Jewelry retail site with motion-led product presentation.",
    status: "in-development",
    techStack: ["Next.js", "TypeScript", "Framer Motion", "Radix UI", "Tailwind CSS"],
    githubUrl: `${GH}/arch-jewelers`,
    screenshots: [],
  },
  {
    slug: "forge-athletic",
    title: "FORGE Athletic",
    category: "prototype",
    tier: "supporting",
    oneLiner: "Mobile authentication flow for iOS and Android with social sign-in.",
    status: "in-development",
    techStack: ["Expo", "React Native", "Firebase Auth", "NativeWind", "Zod"],
    githubUrl: `${GH}/gym-app`,
    screenshots: [],
  },
  {
    slug: "ai-account-dashboard",
    title: "AI Account Dashboard",
    category: "ai",
    tier: "supporting",
    oneLiner: "Desktop dashboard for managing AI service accounts in one place.",
    status: "in-development",
    techStack: ["Electron", "React", "Vite"],
    githubUrl: `${GH}/ai-account-dashboard`,
    screenshots: [],
  },

  /* ----------------------------------------------------------------- archive */
  {
    slug: "gjw-storefront",
    title: "GJW Storefront",
    category: "web",
    tier: "archive",
    oneLiner: "Headless Shopify storefront built on Hydrogen and Remix.",
    status: "archived",
    techStack: ["Shopify Hydrogen", "Remix", "TypeScript", "Vite"],
    githubUrl: `${GH}/Gjw_website`,
    screenshots: [],
  },
  {
    slug: "ai-agent-memory",
    title: "Agent Memory",
    category: "ai",
    tier: "archive",
    oneLiner: "Persistent memory layer experiment for long-running agents.",
    status: "archived",
    techStack: ["Shell", "Python"],
    screenshots: [],
  },
];

export const featuredProjects = projects.filter((p) => p.tier === "featured");
export const supportingProjects = projects.filter((p) => p.tier === "supporting");
export const archiveProjects = projects.filter((p) => p.tier === "archive");
