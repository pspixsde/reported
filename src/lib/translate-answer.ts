import type { TranslationKey } from "@/i18n";

const TRANSLATABLE_ANSWERS = [
  "Win", "Loss",
  "Herald", "Guardian", "Crusader", "Archon",
  "Legend", "Ancient", "Divine", "Immortal",
] as const;

type TranslateFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

/**
 * Translate a guess or answer string (Win/Loss/rank bracket) to the
 * current locale. KDA bucket strings pass through unchanged.
 */
export function translateAnswer(answer: string, t: TranslateFn): string {
  if ((TRANSLATABLE_ANSWERS as readonly string[]).includes(answer)) {
    return t(`answer.${answer}` as TranslationKey);
  }
  return answer;
}
