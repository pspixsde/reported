"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "ru";

interface SettingsStoreState {
  locale: Locale;
  colorblindMode: boolean;
  hardMode: boolean;
  setLocale: (locale: Locale) => void;
  setColorblindMode: (enabled: boolean) => void;
  setHardMode: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      locale: "en",
      colorblindMode: false,
      hardMode: false,

      setLocale: (locale: Locale) => set({ locale }),
      setColorblindMode: (enabled: boolean) => set({ colorblindMode: enabled }),
      setHardMode: (enabled: boolean) => set({ hardMode: enabled }),
    }),
    {
      name: "reported-settings",
    },
  ),
);
