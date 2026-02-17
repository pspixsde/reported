"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "ru";

interface SettingsStoreState {
  locale: Locale;
  colorblindMode: boolean;
  setLocale: (locale: Locale) => void;
  setColorblindMode: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      locale: "en",
      colorblindMode: false,

      setLocale: (locale: Locale) => set({ locale }),
      setColorblindMode: (enabled: boolean) => set({ colorblindMode: enabled }),
    }),
    {
      name: "reported-settings",
    },
  ),
);
