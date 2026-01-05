"use client";

import React, { useEffect, useState } from "react";
import { Theme } from "@/shared/ui";
import { THEME_COOKIE } from "@/shared/config";
import { getCookie, setCookie } from "@/shared/lib/cookies";
import { useAuth } from "@/entities/identity";
import { ThemeContext } from "@/shared/lib/theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(Theme.LIGHT);

  // Load theme from cookie or system preference
  useEffect(() => {
    const saved = getCookie(THEME_COOKIE) as Theme | null;

    if (saved && Object.values(Theme).includes(saved)) {
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
    if (!backendTheme) return;

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

  // Apply theme class and sync to cookie
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove(Theme.LIGHT);
      document.documentElement.classList.toggle(
        "dark",
        resolvedTheme === Theme.DARK,
      );
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.resolvedTheme = resolvedTheme;
    }
    setCookie(THEME_COOKIE, theme);
  }, [theme, resolvedTheme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
