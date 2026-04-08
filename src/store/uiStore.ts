import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface UIState {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  onboardingComplete: boolean;
  chapterDone: Record<string, boolean>;
  setTheme: (t: ThemeMode) => void;
  toggleSidebar: () => void;
  completeOnboarding: () => void;
  markChapter: (id: string, done?: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarCollapsed: false,
      onboardingComplete: false,
      chapterDone: {},
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      completeOnboarding: () => set({ onboardingComplete: true }),
      markChapter: (id, done = true) =>
        set((s) => ({ chapterDone: { ...s.chapterDone, [id]: done } })),
    }),
    { name: "gmn-ml-tutorial-ui" }
  )
);
