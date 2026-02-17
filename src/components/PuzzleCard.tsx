"use client";

import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { HeroIcon } from "./HeroIcon";
import { ItemIcon } from "./ItemIcon";
import { formatDuration } from "@/lib/puzzle-utils";

interface PuzzleCardProps {
  className?: string;
}

export function PuzzleCard({ className }: PuzzleCardProps) {
  const puzzle = useGameStore((s) => s.puzzle);
  const heroes = useGameStore((s) => s.heroes);

  if (!puzzle) return null;

  const hero = heroes?.[puzzle.heroId];
  const heroDisplayName = hero?.localized_name || puzzle.hero;

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-lg border border-dota-border bg-dota-surface p-5",
        className,
      )}
    >
      {/* Hero section */}
      <div className="flex items-center gap-4">
        <HeroIcon
          heroName={puzzle.hero}
          localizedName={heroDisplayName}
          size="md"
        />
        <div>
          <h2 className="text-xl font-bold text-dota-text">{heroDisplayName}</h2>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge>{puzzle.role}</Badge>
            <Badge>{puzzle.lane}</Badge>
          </div>
        </div>
      </div>

      {/* Items grid */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dota-text-dim">
          Items
        </p>
        <div className="flex flex-wrap gap-1.5">
          {puzzle.items.map((itemId, i) => (
            <ItemIcon key={`${itemId}-${i}`} itemId={itemId} />
          ))}
        </div>
      </div>

      {/* Match info */}
      <div className="mt-4 flex items-center gap-4 text-sm text-dota-text-dim">
        <div className="flex items-center gap-1.5">
          <ClockIcon />
          <span>{formatDuration(puzzle.duration)}</span>
        </div>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-dota-card px-2 py-0.5 text-xs font-medium text-dota-gold">
      {children}
    </span>
  );
}

function ClockIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

