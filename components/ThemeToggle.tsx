"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  const isDark = resolved === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="
        relative flex items-center justify-center
        w-8 h-8 border
        hover:border-[var(--accent)] hover:text-[var(--accent)]
        transition-all duration-200
      "
      style={{
        borderRadius: "var(--radius)",
        borderColor: "var(--border)",
        background: "var(--bg-elevated)",
        color: "var(--text-secondary)",
      }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? "rotate(90deg) scale(0.6)" : "rotate(0deg) scale(1)",
        }}
        aria-hidden="true"
      >
        <Moon size={14} strokeWidth={1.75} />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.6)",
        }}
        aria-hidden="true"
      >
        <Sun size={14} strokeWidth={1.75} />
      </span>
    </button>
  );
}
