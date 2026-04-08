import { useEffect, type ReactNode } from "react";
import { useUIStore, type ThemeMode } from "@/store/uiStore";

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const apply = () => {
      const r = resolveTheme(theme);
      document.documentElement.classList.toggle("dark", r === "dark");
    };
    apply();
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const fn = () => apply();
      mq.addEventListener("change", fn);
      return () => mq.removeEventListener("change", fn);
    }
  }, [theme]);

  return <>{children}</>;
}
