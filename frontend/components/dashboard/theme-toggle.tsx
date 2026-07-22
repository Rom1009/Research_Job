"use client";

import { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { ThemeContext } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
    >
      <div className="flex items-center gap-3">
        {isDark ? (
          <Moon className="size-4 text-sidebar-primary" />
        ) : (
          <Sun className="size-4 text-amber-500" />
        )}
        <span className="text-sm font-medium">
          {isDark ? "Dark" : "Light"} mode
        </span>
      </div>

      {/* Switch */}
      <div
        className={`relative h-5 w-9 rounded-full border transition-colors ${
          isDark
            ? "border-sidebar-primary/40 bg-sidebar-primary/20"
            : "border-sidebar-border bg-sidebar-accent"
        }`}
      >
        <span
          className={`absolute top-1/2 -translate-y-1/2 flex size-3.5 items-center justify-center rounded-full bg-sidebar-primary shadow transition-all duration-300 ${
            isDark ? "left-[calc(100%-1rem)]" : "left-0.5"
          }`}
        />
      </div>
    </button>
  );
}
