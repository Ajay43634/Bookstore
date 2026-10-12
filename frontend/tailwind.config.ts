import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:     { base: "var(--bg-base)", elevated: "var(--bg-elevated)", sunken: "var(--bg-sunken)" },
        ink:    { DEFAULT: "var(--ink)", muted: "var(--ink-muted)", faint: "var(--ink-faint)" },
        blue:   { soft: "var(--blue-soft)", DEFAULT: "var(--blue)", deep: "var(--blue-deep)" },
        green:  { soft: "var(--green-soft)", DEFAULT: "var(--green)", deep: "var(--green-deep)" },
        yellow: { soft: "var(--yellow-soft)", DEFAULT: "var(--yellow)", deep: "var(--yellow-deep)" },
      },
    },
  },
} satisfies Config;
