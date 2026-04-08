import type { ReactNode } from "react";
import { Check, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useUIStore, type ThemeMode } from "@/store/uiStore";

const icons: Record<ThemeMode, ReactNode> = {
  light: <Sun className="h-4 w-4" />,
  dark: <Moon className="h-4 w-4" />,
  system: <Monitor className="h-4 w-4" />,
};

export function ThemeToggle() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="secondary" size="icon" aria-label="Theme menu" aria-haspopup="menu">
          {icons[theme]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-100 min-w-40">
        {(
          [
            { id: "light" as const, label: "Light" },
            { id: "dark" as const, label: "Dark" },
            { id: "system" as const, label: "System" },
          ] as const
        ).map(({ id, label }) => (
          <DropdownMenuItem
            key={id}
            className="gap-2"
            onSelect={() => setTheme(id)}
          >
            <span className={cn("flex w-4 justify-center", theme === id ? "opacity-100" : "opacity-0")}>
              <Check className="h-4 w-4" aria-hidden />
            </span>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
