import { useState, useEffect, useCallback } from "react";

export function useThemeSync(externalIsDarkMode?: boolean, onThemeChange?: (isDark: boolean) => void) {
  const [internalDarkMode, setInternalDarkMode] = useState(false);
  const isDarkMode = externalIsDarkMode !== undefined ? externalIsDarkMode : internalDarkMode;

  useEffect(() => {
    if (externalIsDarkMode === undefined && typeof window !== "undefined") {
      setInternalDarkMode(document.documentElement.classList.contains("dark"));
    }
  }, [externalIsDarkMode]);

  const toggleTheme = useCallback(() => {
    const next = !isDarkMode;
    if (onThemeChange) {
      onThemeChange(next);
    } else {
      setInternalDarkMode(next);
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDarkMode, onThemeChange]);

  const resetTheme = useCallback(() => {
    if (onThemeChange) {
      onThemeChange(false);
    } else {
      setInternalDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, [onThemeChange]);

  return { isDarkMode, toggleTheme, resetTheme };
}
