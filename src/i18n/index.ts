import en from "./en";
import ru from "./ru";
import type { TranslationKey } from "./en";
import { useSettingsStore, type Locale } from "@/stores/settings-store";

const translations: Record<Locale, Record<TranslationKey, string>> = { en, ru };

/**
 * Simple interpolation: replaces {key} placeholders in a string.
 * e.g. t("mode.daily.completed", { score: 3 }) => "Completed today — 3/3"
 */
function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`,
  );
}

/**
 * Translation hook. Returns a `t()` function that resolves a key
 * to the current locale's string, with optional interpolation.
 */
export function useTranslation() {
  const locale = useSettingsStore((s) => s.locale);

  function t(
    key: TranslationKey,
    params?: Record<string, string | number>,
  ): string {
    const dict = translations[locale] ?? translations.en;
    const raw = dict[key] ?? translations.en[key] ?? key;
    return interpolate(raw, params);
  }

  return { t, locale };
}

export type { TranslationKey };
