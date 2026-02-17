"use client";

import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import { PUZZLES_LEVEL_COUNT, PUZZLES_PER_LEVEL } from "@/lib/game-types";

interface LevelSelectProps {
  className?: string;
}

export function LevelSelect({ className }: LevelSelectProps) {
  const { t } = useTranslation();
  const completedLevels = useGameStore((s) => s.completedLevels);
  const levelScores = useGameStore((s) => s.levelScores);
  const selectLevel = useGameStore((s) => s.selectLevel);
  const loading = useGameStore((s) => s.loading);
  const resetGame = useGameStore((s) => s.resetGame);

  const levels = Array.from({ length: PUZZLES_LEVEL_COUNT }, (_, i) => i);

  return (
    <div className={cn("flex w-full max-w-lg flex-col items-center", className)}>
      <h2 className="text-2xl font-bold text-dota-gold">{t("levels.title")}</h2>
      <p className="mt-2 text-sm text-dota-text-dim">
        {t("levels.desc", { count: PUZZLES_PER_LEVEL })}
      </p>

      <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
        {levels.map((lvl) => {
          const isCompleted = completedLevels.includes(lvl);
          const scores = levelScores[lvl] || [];
          const totalLevelScore = scores.reduce((a, b) => a + b, 0);

          return (
            <button
              key={lvl}
              onClick={() => selectLevel(lvl)}
              disabled={loading}
              className={cn(
                "group relative overflow-hidden rounded-xl border p-5 text-left transition-all disabled:opacity-50",
                isCompleted
                  ? "border-dota-green/40 bg-dota-green/5 hover:border-dota-green/60 hover:shadow-lg hover:shadow-dota-green/5"
                  : "border-dota-border bg-dota-surface hover:border-dota-gold/40 hover:shadow-lg hover:shadow-dota-gold/5",
              )}
            >
              <div
                className={cn(
                  "absolute -right-4 -top-4 h-20 w-20 rounded-full transition-transform group-hover:scale-150",
                  isCompleted ? "bg-dota-green/5" : "bg-dota-gold/5",
                )}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h3
                    className={cn(
                      "text-lg font-bold",
                      isCompleted ? "text-dota-green" : "text-dota-text",
                    )}
                  >
                    {t("levels.level", { n: lvl + 1 })}
                  </h3>
                  {isCompleted && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dota-green text-xs font-bold text-dota-bg">
                      ✓
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-dota-text-dim">
                  {t("levels.puzzles", { count: PUZZLES_PER_LEVEL })}
                </p>
                {isCompleted && scores.length > 0 && (
                  <p className="mt-1 text-xs font-medium text-dota-green">
                    {t("levels.score", {
                      score: totalLevelScore,
                      total: PUZZLES_PER_LEVEL * 3,
                    })}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={resetGame}
        className="mt-6 text-sm text-dota-text-dim transition-colors hover:text-dota-text"
      >
        {t("levels.back")}
      </button>
    </div>
  );
}
