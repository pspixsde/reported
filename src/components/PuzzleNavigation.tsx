"use client";

import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import { PUZZLES_TOTAL } from "@/lib/game-types";

export function PuzzleNavigation() {
  const { t } = useTranslation();
  const currentPuzzleIndex = useGameStore((s) => s.currentPuzzleIndex);
  const navigateToPuzzle = useGameStore((s) => s.navigateToPuzzle);
  const returnToPuzzleGrid = useGameStore((s) => s.returnToPuzzleGrid);
  const loading = useGameStore((s) => s.loading);

  if (currentPuzzleIndex === null) return null;

  const hasPrev = currentPuzzleIndex > 0;
  const hasNext = currentPuzzleIndex < PUZZLES_TOTAL - 1;

  return (
    <div className="flex w-full max-w-md items-center justify-between">
      {/* Previous arrow */}
      <button
        onClick={() => navigateToPuzzle(currentPuzzleIndex - 1)}
        disabled={!hasPrev || loading}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border transition-all",
          hasPrev && !loading
            ? "border-dota-border bg-dota-card text-dota-text hover:border-dota-gold/40 hover:bg-dota-gold/10 hover:text-dota-gold"
            : "border-transparent text-dota-text-dim/30 cursor-not-allowed",
        )}
        title={t("nav.prevPuzzle")}
      >
        <ChevronLeftIcon />
      </button>

      {/* Center: puzzle number + grid button */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-dota-text">
          {currentPuzzleIndex + 1} / {PUZZLES_TOTAL}
        </span>
        <button
          onClick={returnToPuzzleGrid}
          disabled={loading}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-dota-border bg-dota-card px-3 text-xs font-medium text-dota-text-dim transition-all hover:border-dota-gold/40 hover:text-dota-text disabled:opacity-50"
          title={t("nav.backToGrid")}
        >
          <GridIcon />
          <span>{t("nav.backToGrid")}</span>
        </button>
      </div>

      {/* Next arrow */}
      <button
        onClick={() => navigateToPuzzle(currentPuzzleIndex + 1)}
        disabled={!hasNext || loading}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border transition-all",
          hasNext && !loading
            ? "border-dota-border bg-dota-card text-dota-text hover:border-dota-gold/40 hover:bg-dota-gold/10 hover:text-dota-gold"
            : "border-transparent text-dota-text-dim/30 cursor-not-allowed",
        )}
        title={t("nav.nextPuzzle")}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
