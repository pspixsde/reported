"use client";

import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import { translateAnswer } from "@/lib/translate-answer";
import type { LevelResult } from "@/lib/game-types";

interface ResultFeedbackProps {
  className?: string;
}

export function ResultFeedback({ className }: ResultFeedbackProps) {
  const { t } = useTranslation();
  const results = useGameStore((s) => s.results);
  const mode = useGameStore((s) => s.mode);
  const puzzlesHardMode = useGameStore((s) => s.puzzlesHardMode);

  if (results.length === 0) return null;

  const hard = puzzlesHardMode && mode === "puzzles";
  const levelLabels = hard
    ? [t("result.hero"), t("result.winloss"), t("result.kda"), t("result.rank")]
    : [t("result.winloss"), t("result.kda"), t("result.rank")];

  return (
    <div className={cn("w-full max-w-md space-y-2", className)}>
      {results.map((result, i) => (
        <ResultRow
          key={i}
          label={levelLabels[i]}
          result={result}
          index={i}
          isHeroLevel={hard && i === 0}
        />
      ))}
    </div>
  );
}

function ResultRow({
  label,
  result,
  index,
  isHeroLevel,
}: {
  label: string;
  result: LevelResult;
  index: number;
  isHeroLevel?: boolean;
}) {
  const { t } = useTranslation();
  const heroes = useGameStore((s) => s.heroes);

  // For hero guess level, resolve hero IDs to names
  let displayGuess = translateAnswer(result.guess, t);
  let displayAnswer = translateAnswer(result.answer, t);
  if (isHeroLevel && heroes) {
    const guessId = Number(result.guess);
    const answerId = Number(result.answer);
    if (!isNaN(guessId) && heroes[guessId]) {
      displayGuess = heroes[guessId].localized_name;
    }
    if (!isNaN(answerId) && heroes[answerId]) {
      displayAnswer = heroes[answerId].localized_name;
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border px-4 py-3 transition-all",
        "animate-[fadeSlideIn_0.3s_ease-out_forwards]",
        result.correct
          ? "border-dota-green/30 bg-dota-green/10"
          : "border-dota-red/30 bg-dota-red/10",
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-dota-text-dim">
          {t("result.level", { n: index + 1, label })}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {result.correct ? (
            <span className="text-sm font-semibold text-dota-green">
              {displayAnswer}
            </span>
          ) : (
            <>
              <span className="text-sm text-dota-red line-through">
                {displayGuess}
              </span>
              <span className="text-dota-text-dim">&rarr;</span>
              <span className="text-sm font-semibold text-dota-text">
                {displayAnswer}
              </span>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
          result.correct
            ? "bg-dota-green text-dota-bg"
            : "bg-dota-red text-white",
        )}
      >
        {result.correct ? "✓" : "✗"}
      </div>
    </div>
  );
}
