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
  const completedHardPuzzles = useGameStore((s) => s.completedHardPuzzles);
  const hardPuzzleScores = useGameStore((s) => s.hardPuzzleScores);
  const puzzlesHardMode = useGameStore((s) => s.puzzlesHardMode);
  const togglePuzzlesHardMode = useGameStore((s) => s.togglePuzzlesHardMode);
  const selectPuzzle = useGameStore((s) => s.selectPuzzle);
  const loading = useGameStore((s) => s.loading);
  const resetGame = useGameStore((s) => s.resetGame);

  // Stats
  const puzzlesGamesPlayed = useGameStore((s) => s.puzzlesGamesPlayed);
  const puzzlesTotalScore = useGameStore((s) => s.puzzlesTotalScore);
  const hardPuzzlesGamesPlayed = useGameStore((s) => s.hardPuzzlesGamesPlayed);
  const hardPuzzlesTotalScore = useGameStore((s) => s.hardPuzzlesTotalScore);

  const inProgressIndex = useGameStore((s) =>
    puzzlesHardMode ? s.hardPuzzlesInProgressIndex : s.puzzlesInProgressIndex,
  );

  const activeCompleted = puzzlesHardMode ? completedHardPuzzles : completedPuzzles;
  const activeScores = puzzlesHardMode ? hardPuzzleScores : puzzleScores;
  const activeGamesPlayed = puzzlesHardMode ? hardPuzzlesGamesPlayed : puzzlesGamesPlayed;
  const activeTotalScore = puzzlesHardMode ? hardPuzzlesTotalScore : puzzlesTotalScore;
  const maxScorePerPuzzle = puzzlesHardMode ? 4 : 3;

  const puzzles = Array.from({ length: PUZZLES_TOTAL }, (_, i) => i);
  const completedCount = activeCompleted.length;

  return (
    <div className={cn("flex w-full max-w-xl flex-col items-center", className)}>
      <h2 className="text-2xl font-bold text-dota-gold">{t("levels.title")}</h2>
      <p className="mt-2 text-sm text-dota-text-dim">
        {t("levels.desc", { completed: completedCount, total: PUZZLES_TOTAL })}
      </p>

      {/* Hard Mode toggle */}
      <button
        onClick={togglePuzzlesHardMode}
        className={cn(
          "mt-4 rounded-lg border px-4 py-2 text-sm font-semibold transition-all",
          puzzlesHardMode
            ? "border-dota-red/40 bg-dota-red/10 text-dota-red hover:bg-dota-red/20"
            : "border-dota-border bg-dota-card text-dota-text-dim hover:border-dota-gold/40 hover:text-dota-text",
        )}
      >
        {puzzlesHardMode ? t("levels.hardMode.on") : t("levels.hardMode.off")}
      </button>

      <div
        className="mt-6 grid w-full gap-2"
        style={{ gridTemplateColumns: `repeat(${PUZZLES_GRID_COLS}, minmax(0, 1fr))` }}
      >
        {puzzles.map((idx) => {
          const isCompleted = activeCompleted.includes(idx);
          const isInProgress = !isCompleted && inProgressIndex === idx;
          const score = activeScores[idx];

          return (
            <button
              key={idx}
              onClick={() => selectPuzzle(idx)}
              disabled={loading}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border p-2 text-sm font-bold transition-all",
                "disabled:cursor-not-allowed",
                "active:scale-[0.95]",
                "aspect-square",
                isCompleted
                  ? puzzlesHardMode
                    ? "border-dota-red/40 bg-dota-red/10 text-dota-red"
                    : "border-dota-green/40 bg-dota-green/10 text-dota-green"
                  : isInProgress
                    ? "border-dota-gold/40 bg-dota-gold/10 text-dota-gold"
                    : puzzlesHardMode
                      ? "border-dota-red/20 bg-dota-card text-dota-text hover:border-dota-red/40 hover:bg-dota-red/10 hover:text-dota-red disabled:opacity-50"
                      : "border-dota-border bg-dota-card text-dota-text hover:border-dota-gold/40 hover:bg-dota-gold/10 hover:text-dota-gold disabled:opacity-50",
              )}
            >
              <span>{idx + 1}</span>
              {isCompleted && score !== undefined && (
                <span className="text-[10px] font-medium">{score}/{maxScorePerPuzzle}</span>
              )}
              {isCompleted && (
                <span className={cn(
                  "absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-dota-bg",
                  puzzlesHardMode ? "bg-dota-red" : "bg-dota-green",
                )}>
                  ✓
                </span>
              )}
              {isInProgress && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-dota-gold text-[8px] font-bold text-dota-bg">
                  ●
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Puzzles Stats */}
      {activeGamesPlayed > 0 && (
        <div className="mt-6 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dota-text-dim">
            {t("levels.stats.title")}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-dota-text-dim">
            <div className="text-center">
              <p className="text-2xl font-bold text-dota-text">{activeGamesPlayed}</p>
              <p>{t("levels.stats.played")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-dota-text">
                {activeGamesPlayed > 0
                  ? ((activeTotalScore / (activeGamesPlayed * maxScorePerPuzzle)) * 100).toFixed(0)
                  : 0}
                %
              </p>
              <p>{t("levels.stats.accuracy")}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={resetGame}
        className="mt-6 text-sm text-dota-text-dim transition-colors hover:text-dota-text"
      >
        {t("levels.back")}
      </button>
    </div>
  );
}
