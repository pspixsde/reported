"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import { PUZZLES_TOTAL, PUZZLES_GRID_COLS } from "@/lib/game-types";

interface PuzzleGridProps {
  className?: string;
}

export function LevelSelect({ className }: PuzzleGridProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const completedPuzzles = useGameStore((s) => s.completedPuzzles);
  const puzzleScores = useGameStore((s) => s.puzzleScores);
  const completedHardPuzzles = useGameStore((s) => s.completedHardPuzzles);
  const hardPuzzleScores = useGameStore((s) => s.hardPuzzleScores);
  const selectPuzzle = useGameStore((s) => s.selectPuzzle);
  const loading = useGameStore((s) => s.loading);
  const resetGame = useGameStore((s) => s.resetGame);

  // Stats
  const puzzlesGamesPlayed = useGameStore((s) => s.puzzlesGamesPlayed);
  const puzzlesTotalScore = useGameStore((s) => s.puzzlesTotalScore);
  const hardPuzzlesGamesPlayed = useGameStore((s) => s.hardPuzzlesGamesPlayed);
  const hardPuzzlesTotalScore = useGameStore((s) => s.hardPuzzlesTotalScore);

  const inProgressStandard = useGameStore((s) => s.puzzlesInProgressIndex);
  const inProgressHard = useGameStore((s) => s.hardPuzzlesInProgressIndex);

  const puzzles = Array.from({ length: PUZZLES_TOTAL }, (_, i) => i);
  const totalCompleted = completedPuzzles.length + completedHardPuzzles.length;
  const totalPuzzles = PUZZLES_TOTAL * 2;
  const combinedGamesPlayed = puzzlesGamesPlayed + hardPuzzlesGamesPlayed;
  const combinedTotalScore = puzzlesTotalScore + hardPuzzlesTotalScore;
  const combinedMaxScore = puzzlesGamesPlayed * 3 + hardPuzzlesGamesPlayed * 4;

  function handleBackToMenu() {
    resetGame();
    router.push("/");
  }

  return (
    <div className={cn("flex w-full max-w-2xl flex-col items-center", className)}>
      <h2 className="text-2xl font-bold text-dota-gold">{t("levels.title")}</h2>
      <p className="mt-2 text-sm text-dota-text-dim">
        {t("levels.desc", { completed: totalCompleted, total: totalPuzzles })}
      </p>

      <section className="mt-6 w-full">
        <h3 className="text-center text-base font-bold text-dota-gold">{t("levels.standard.title")}</h3>

        <div
          className="mt-3 grid w-full gap-2"
          style={{ gridTemplateColumns: `repeat(${PUZZLES_GRID_COLS}, minmax(0, 1fr))` }}
        >
          {puzzles.map((idx) => {
            const isCompleted = completedPuzzles.includes(idx);
            const isInProgress = !isCompleted && inProgressStandard === idx;
            const score = puzzleScores[idx];

            return (
              <button
                key={`std-${idx}`}
                onClick={() => selectPuzzle(idx, false)}
                disabled={loading}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-lg border p-2 text-sm font-bold transition-all",
                  "disabled:cursor-not-allowed",
                  "active:scale-[0.95]",
                  isCompleted
                    ? "border-dota-green/40 bg-dota-green/10 text-dota-green"
                    : isInProgress
                      ? "border-dota-gold/40 bg-dota-gold/10 text-dota-gold"
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
                {isInProgress && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-dota-gold text-[8px] font-bold text-dota-bg">
                    ●
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </section>

      <section className="mt-8 w-full">
        <h3 className="text-center text-base font-bold text-dota-red">{t("levels.hard.title")}</h3>

        <div
          className="mt-3 grid w-full gap-2"
          style={{ gridTemplateColumns: `repeat(${PUZZLES_GRID_COLS}, minmax(0, 1fr))` }}
        >
          {puzzles.map((idx) => {
            const isCompleted = completedHardPuzzles.includes(idx);
            const isInProgress = !isCompleted && inProgressHard === idx;
            const score = hardPuzzleScores[idx];

            return (
              <button
                key={`hard-${idx}`}
                onClick={() => selectPuzzle(idx, true)}
                disabled={loading}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-lg border p-2 text-sm font-bold transition-all",
                  "disabled:cursor-not-allowed",
                  "active:scale-[0.95]",
                  isCompleted
                    ? "border-dota-red/40 bg-dota-red/10 text-dota-red"
                    : isInProgress
                      ? "border-dota-gold/40 bg-dota-gold/10 text-dota-gold"
                      : "border-dota-red/20 bg-dota-card text-dota-text hover:border-dota-red/40 hover:bg-dota-red/10 hover:text-dota-red disabled:opacity-50",
                )}
              >
                <span>{idx + 1}</span>
                {isCompleted && score !== undefined && (
                  <span className="text-[10px] font-medium">{score}/4</span>
                )}
                {isCompleted && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-dota-red text-[8px] font-bold text-dota-bg">
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

        {combinedGamesPlayed > 0 && (
          <div className="mt-6 border-t border-dota-border pt-4 text-center">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dota-text-dim">
              {t("levels.stats.title")}
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-dota-text-dim">
              <div className="text-center">
                <p className="text-2xl font-bold text-dota-text">{combinedGamesPlayed}</p>
                <p>{t("levels.stats.played")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-dota-text">
                  {combinedMaxScore > 0
                    ? ((combinedTotalScore / combinedMaxScore) * 100).toFixed(0)
                    : 0}
                  %
                </p>
                <p>{t("levels.stats.accuracy")}</p>
              </div>
            </div>
          </div>
        )}

      </section>

      <div className="mt-6 border-t border-dota-border pt-4">
        <p className="text-sm font-medium text-dota-text-dim">
          {t("levels.newPuzzlesMonthly")}
        </p>
      </div>

      <button
        onClick={handleBackToMenu}
        className="mt-6 rounded-lg border border-dota-border px-4 py-2.5 text-sm font-semibold text-dota-text transition-all hover:bg-dota-card"
      >
        {t("levels.back")}
      </button>
    </div>
  );
}
