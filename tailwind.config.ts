import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base backgrounds & surfaces (Light / Dark)
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          subtle: "var(--surface-subtle)",
          elevated: "var(--surface-elevated)",
          border: "var(--surface-border)",
        },
        // Single restrained brand accent (B2B SaaS style: Indigo/Violet)
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
          muted: "rgba(99, 102, 241, 0.12)",
        },
        // Semantic sentiment / status palette (fixed tokens, distinct from brand)
        sentiment: {
          pos: {
            DEFAULT: "#10B981", // Emerald
            muted: "rgba(16, 185, 129, 0.12)",
            text: "#059669",
            darkText: "#34D399",
          },
          neu: {
            DEFAULT: "#F59E0B", // Amber
            muted: "rgba(245, 158, 11, 0.12)",
            text: "#D97706",
            darkText: "#FBBF24",
          },
          neg: {
            DEFAULT: "#EF4444", // Red
            muted: "rgba(239, 68, 68, 0.12)",
            text: "#DC2626",
            darkText: "#F87171",
          },
        },
      },
      boxShadow: {
        // Neumorphic subtle dual-shadows for grounded elements
        "neu-flat": "3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light)",
        "neu-pressed": "inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light)",
        "neu-sm": "1px 1px 3px var(--neu-shadow-dark), -1px -1px 3px var(--neu-shadow-light)",
        // Floating elevation for overlays & dropdowns
        "glass-floating": "0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "12px",
      },
      borderRadius: {
        lg: "0.625rem",
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
    },
  },
  plugins: [],
};
export default config;
