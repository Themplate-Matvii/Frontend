"use client";

import React, { useEffect, useRef, useState } from "react";
import { Theme } from "@/shared/ui";
import { THEME_STORAGE_KEY } from "@/shared/config";
import { useAuth } from "@/entities/identity/auth";
import { ThemeContext } from "@/shared/lib/theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(Theme.LIGHT);
  const hasStoredTheme = useRef(false);

  const readStoredTheme = () => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && Object.values(Theme).includes(stored as Theme)) {
      return stored as Theme;
    }
    return null;
  };

  // Load theme from localStorage or system preference
  useEffect(() => {
    const saved = readStoredTheme();
    if (saved) {
      hasStoredTheme.current = true;
      setTheme(saved);
    } else {
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? Theme.DARK : Theme.LIGHT);
    }
  }, []);

  useEffect(() => {
    const backendTheme = user?.settings?.theme as Theme | undefined;
    if (!backendTheme || hasStoredTheme.current) return;

    setTheme(backendTheme);
  }, [user?.settings?.theme, setTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (theme !== Theme.SYSTEM) {
      setResolvedTheme(theme);
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () =>
      setResolvedTheme(media.matches ? Theme.DARK : Theme.LIGHT);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [theme]);

  // Apply theme class and sync to localStorage
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle(
        "dark",
        resolvedTheme === Theme.DARK,
      );
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.resolvedTheme = resolvedTheme;
    }
    if (typeof window !== "undefined") {
      const persisted =
        theme === Theme.SYSTEM ? resolvedTheme : theme;
      window.localStorage.setItem(THEME_STORAGE_KEY, persisted);
    }
  }, [theme, resolvedTheme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
