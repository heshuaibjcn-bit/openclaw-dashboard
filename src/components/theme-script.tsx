"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeScript() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    // Apply theme class immediately to prevent flash
    const root = document.documentElement;
    const resolvedTheme = theme === "system" ? systemTheme : theme;

    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, systemTheme]);

  return null;
}
