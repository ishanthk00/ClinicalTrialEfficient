import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // v4 is a single-typeface design — Outfit for everything, including
      // display. Neither Sora nor Playfair Display is loaded by the app.
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      // One radius throughout the v4 design; these aliases keep any
      // leftover `rounded-*` utilities on-token instead of drifting.
      borderRadius: {
        lg: "var(--radius)",
        xl: "var(--radius)",
        "2xl": "var(--radius)",
        "3xl": "var(--radius)",
      },
    },
  },
  plugins: [],
};

export default config;
