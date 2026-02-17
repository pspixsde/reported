"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "ru";

interface SettingsStoreState {
  locale: Locale;
  colorblindMode: boolean;
  easyMode: boolean;
  setLocale: (locale: Locale) => void;
  setColorblindMode: (enabled: boolean) => void;
  setEasyMode: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      locale: "en",
      colorblindMode: false,
      easyMode: false,

      setLocale: (locale: Locale) => set({ locale }),
      setColorblindMode: (enabled: boolean) => set({ colorblindMode: enabled }),
      setEasyMode: (enabled: boolean) => set({ easyMode: enabled }),
    }),
    {
      name: "reported-settings",
    },
  ),
);
