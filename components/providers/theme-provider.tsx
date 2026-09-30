"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

const THEME_MANUAL_KEY = "mk-theme-manual";

/** Remember that the user picked a theme, so light stays the default until then. */
export function markThemeManual() {
  try {
    localStorage.setItem(THEME_MANUAL_KEY, "1");
  } catch {
    // Storage can be blocked; the in-memory theme still updates.
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
