"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { THEMES, type Theme, type Mode } from "@/constants/themes";

type ThemeContextType = {
  theme: Theme;
  mode: Mode;
  setTheme: (theme: Theme) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("emerald");
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) ?? "blue";

    const savedMode = (localStorage.getItem("mode") as Mode) ?? "light";

    setTheme(savedTheme);
    setMode(savedMode);
  }, []);

  useEffect(() => {
    const html = document.documentElement;

    html.classList.remove(...THEMES.map((theme) => `theme-${theme}`));

    html.classList.add(`theme-${theme}`);

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const html = document.documentElement;

    if (mode === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    localStorage.setItem("mode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        setTheme,
        toggleMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
