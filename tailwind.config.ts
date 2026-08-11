import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: "var(--color-graphite)",
        panel: "var(--color-panel)",
        "panel-raised": "var(--color-panel-raised)",
        line: "var(--color-line)",
        "line-bright": "var(--color-line-bright)",
        ink: "var(--color-text)",
        "ink-dim": "var(--color-text-dim)",
        "ink-faint": "var(--color-text-faint)",
        accent: {
          ai: "var(--color-accent-ai)",
          web: "var(--color-accent-web)",
          client: "var(--color-accent-client)",
          oss: "var(--color-accent-oss)",
          exp: "var(--color-accent-exp)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Instrument labels: small, wide-tracked, uppercase
        label: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.12em" }],
        data: ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "0.01em" }],
        // Display scale — tight leading, slight negative tracking
        "display-sm": ["2rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-lg": ["4.5rem", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
      },
      letterSpacing: {
        widest: "0.18em",
      },
      transitionTimingFunction: {
        instrument: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
