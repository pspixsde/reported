"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";

/**
 * Applies global settings (colorblind mode, locale) to the document.
 * Must be rendered inside the <body> tag.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const colorblindMode = useSettingsStore((s) => s.colorblindMode);
  const locale = useSettingsStore((s) => s.locale);

  useEffect(() => {
    document.body.classList.toggle("colorblind", colorblindMode);
  }, [colorblindMode]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <>{children}</>;
}
