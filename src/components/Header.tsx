"use client";

import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const mode = useGameStore((s) => s.mode);
  const streak = useGameStore((s) => s.streak);
  const gamesPlayed = useGameStore((s) => s.gamesPlayed);
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <header
      className={cn(
        "flex items-center justify-between border-b border-dota-border px-4 py-3",
        className,
      )}
    >
      <button
        onClick={resetGame}
        className="text-2xl font-bold tracking-tight text-dota-gold transition-colors hover:text-dota-gold-dim"
      >
        REPORTED
      </button>

      <div className="flex items-center gap-4">
        {mode && (
          <span className="rounded bg-dota-card px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-dota-text-dim">
            {mode}
          </span>
        )}

        {gamesPlayed > 0 && (
          <div className="flex items-center gap-2 text-sm text-dota-text-dim">
            <span title="Games played">{gamesPlayed} played</span>
            {streak > 0 && (
              <span
                className="font-semibold text-dota-gold"
                title="Perfect streak"
              >
                {streak} streak
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
