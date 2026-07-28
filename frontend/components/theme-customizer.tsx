"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useDashboardStore } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";

const ACCENT_COLORS = {
  blue: "oklch(0.68 0.15 245)",
  purple: "oklch(0.62 0.22 300)",
  green: "oklch(0.68 0.17 155)",
  orange: "oklch(0.72 0.17 55)",
} as const;

const FONT_SIZES = {
  sm: "14px",
  base: "16px",
  lg: "18px",
} as const;

export function ThemeApplier() {
  const accentColor = useDashboardStore((s) => s.accentColor);
  const fontSize = useDashboardStore((s) => s.fontSize);

  useEffect(() => {
    console.log("[ThemeApplier] Setting primary:", ACCENT_COLORS[accentColor]);
    document.documentElement.style.setProperty(
      "--primary",
      ACCENT_COLORS[accentColor],
      "important",
    );
  }, [accentColor]);

  useEffect(() => {
    console.log("[ThemeApplier] Setting fontSize:", FONT_SIZES[fontSize]);
    document.documentElement.style.fontSize = FONT_SIZES[fontSize];
  }, [fontSize]);

  return null;
}

export function ThemeCustomizer() {
  const accentColor = useDashboardStore((s) => s.accentColor);
  const setAccentColor = useDashboardStore((s) => s.setAccentColor);
  const fontSize = useDashboardStore((s) => s.fontSize);
  const setFontSize = useDashboardStore((s) => s.setFontSize);

  const handleColorChange = (c: keyof typeof ACCENT_COLORS) => {
    console.log("[ThemeCustomizer] Click color:", c);
    setAccentColor(c);
    toast.success(`Accent color changed to ${c}`, { duration: 1500 });
  };

  const handleFontChange = (s: "sm" | "base" | "lg") => {
    setFontSize(s);
    toast.success(
      `Font size: ${s === "sm" ? "Small" : s === "base" ? "Default" : "Large"}`,
      { duration: 1500 },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Accent color</label>
        <div className="flex gap-3">
          {(Object.keys(ACCENT_COLORS) as (keyof typeof ACCENT_COLORS)[]).map(
            (c) => (
              <button
                key={c}
                onClick={() => handleColorChange(c)}
                aria-label={`Set ${c} accent color`}
                className={cn(
                  "size-10 rounded-full border-2 transition-all",
                  accentColor === c
                    ? "ring-2 ring-offset-2 ring-primary scale-110"
                    : "hover:scale-105",
                )}
                style={{ backgroundColor: ACCENT_COLORS[c] }}
              />
            ),
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Changes apply automatically.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Font size</label>
        <div className="flex gap-2">
          {(["sm", "base", "lg"] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleFontChange(s)}
              className={cn(
                "rounded-md border px-4 py-2 text-sm transition-colors",
                fontSize === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-muted",
              )}
              style={{
                fontSize: s === "sm" ? "13px" : s === "base" ? "15px" : "17px",
              }}
            >
              {s === "sm" ? "Small" : s === "base" ? "Default" : "Large"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
