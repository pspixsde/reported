"use client";

import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import { PUZZLES_TOTAL, PUZZLES_GRID_COLS } from "@/lib/game-types";

interface PuzzleGridProps {
  className?: string;
}

export function LevelSelect({ className }: PuzzleGridProps) {
  const { t } = useTranslation();
  const completedPuzzles = useGameStore((s) => s.completedPuzzles);
  const puzzleScores = useGameStore((s) => s.puzzleScores);
  const selectPuzzle = useGameStore((s) => s.selectPuzzle);
  const loading = useGameStore((s) => s.loading);
  const resetGame = useGameStore((s) => s.resetGame);

  const puzzles = Array.from({ length: PUZZLES_TOTAL }, (_, i) => i);
  const completedCount = completedPuzzles.length;

  return (
    <div className={cn("flex w-full max-w-xl flex-col items-center", className)}>
      <h2 className="text-2xl font-bold text-dota-gold">{t("levels.title")}</h2>
      <p className="mt-2 text-sm text-dota-text-dim">
        {t("levels.desc", { completed: completedCount, total: PUZZLES_TOTAL })}
      </p>

      <div
        className="mt-6 grid w-full gap-2"
        style={{ gridTemplateColumns: `repeat(${PUZZLES_GRID_COLS}, minmax(0, 1fr))` }}
      >
        {puzzles.map((idx) => {
          const isCompleted = completedPuzzles.includes(idx);
          const score = puzzleScores[idx];

          return (
            <button
              key={idx}
              onClick={() => selectPuzzle(idx)}
              disabled={loading || isCompleted}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border p-2 text-sm font-bold transition-all",
                "disabled:cursor-not-allowed",
                "active:scale-[0.95]",
                "aspect-square",
                isCompleted
                  ? "border-dota-green/40 bg-dota-green/10 text-dota-green"
                  : "border-dota-border bg-dota-card text-dota-text hover:border-dota-gold/40 hover:bg-dota-gold/10 hover:text-dota-gold disabled:opacity-50",
              )}
            >
              <span>{idx + 1}</span>
              {isCompleted && score !== undefined && (
                <span className="text-[10px] font-medium">{score}/3</span>
              )}
              {isCompleted && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-dota-green text-[8px] font-bold text-dota-bg">
                  ✓
                </span>
              )}
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
