import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Code2,
  Database,
  LayoutDashboard,
  LineChart,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Target,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

const nav: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}[] = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/tutorial", label: "Tutorial", icon: BookOpen },
  { to: "/python-course", label: "Python course", icon: Code2 },
  { to: "/explorer", label: "Dataset explorer", icon: Database },
  { to: "/eda", label: "EDA", icon: BarChart3 },
  { to: "/features", label: "Feature engineering", icon: LineChart },
  { to: "/models", label: "Models", icon: Sparkles },
  { to: "/kpi", label: "KPI dashboard", icon: Target },
  { to: "/insights", label: "Business insights", icon: ClipboardList },
  { to: "/glossary", label: "Glossary", icon: BookOpen },
  { to: "/faq", label: "FAQ", icon: BookOpen },
];

export function AppLayout() {
  const location = useLocation();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200/80 bg-white/90 backdrop-blur-md transition-transform dark:border-zinc-800 dark:bg-zinc-950/90 lg:static lg:translate-x-0",
          collapsed && "lg:w-[72px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-zinc-200/80 px-3 dark:border-zinc-800">
          <div className={cn("min-w-0", collapsed && "lg:hidden")}>
            <p className="truncate text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              GMN ML Studio
            </p>
            <p className="truncate text-[11px] text-zinc-500">Operations tutorial</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sky-600 text-white shadow-sm dark:bg-sky-600"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" />
              <span className={cn("truncate", collapsed && "lg:hidden")}>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={cn("border-t border-zinc-200/80 p-2 dark:border-zinc-800", collapsed && "lg:px-1")}>
          <div className={cn("flex items-center justify-between gap-2", collapsed && "lg:justify-center")}>
            <ThemeToggle />
            <span className={cn("text-xs text-zinc-500", collapsed && "lg:hidden")}>Theme</span>
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200/80 bg-white/80 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <Button
            variant="secondary"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Machine learning with real GMN operations data
            </p>
            <p className="truncate text-xs text-zinc-500">
              Bundled workbook — no upload; everything runs in your browser
            </p>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-6xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
