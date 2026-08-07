export const colors = {
  base: {
    graphite: "#0b0d10",
    blueGrey: "#141821",
    textOffWhite: "#e9ecf1",
  },
  accent: {
    ai: "#7c5cff", // electric violet
    web: "#3fd0e0", // cool cyan
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
