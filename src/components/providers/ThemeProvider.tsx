import { useEffect, useState, type ReactNode } from "react";
import { useUIStore, type ThemeMode } from "@/store/uiStore";

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

/** Keeps `dark` on <html> and `color-scheme` in sync with resolved light/dark. */
export function applyThemeToDocument(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUIStore((s) => s.theme);
  const [hydrated, setHydrated] = useState(() => useUIStore.persist.hasHydrated());

  useEffect(() => {
    if (useUIStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useUIStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const run = () => applyThemeToDocument(resolveTheme(theme));

    run();

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => run();
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, [theme, hydrated]);

  return <>{children}</>;
}
