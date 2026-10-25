"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeCtx {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx>({
  theme: "light",
  resolved: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(Ctx);
}

function applyTheme(isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", isDark ? "dark" : "light");
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // Default to the light-blue theme regardless of OS dark-mode preference
  useEffect(() => {
    setThemeState("light");
    setResolved("light");
    applyTheme(false);
    localStorage.removeItem("trialfind-theme");
  }, []);

  function setTheme(t: Theme) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = t === "dark" || (t === "system" && mql.matches);
    setThemeState(t);
    setResolved(isDark ? "dark" : "light");
    applyTheme(isDark);
    if (t === "system") {
      localStorage.removeItem("trialfind-theme");
    } else {
      localStorage.setItem("trialfind-theme", t);
    }
  }

  return <Ctx.Provider value={{ theme, resolved, setTheme }}>{children}</Ctx.Provider>;
}
