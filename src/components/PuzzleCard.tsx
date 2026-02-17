"use client";

import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import { HeroIcon } from "./HeroIcon";
import { ItemIcon } from "./ItemIcon";
import { formatDuration, formatNetWorth } from "@/lib/puzzle-utils";

interface PuzzleCardProps {
  className?: string;
}

export function PuzzleCard({ className }: PuzzleCardProps) {
  const { t } = useTranslation();
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
        </div>
      </div>

      {/* Items grid */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dota-text-dim">
          {t("puzzle.items")}
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
        <div className="flex items-center gap-1.5" title="Net Worth">
          <GoldIcon />
          <span>{t("puzzle.gold", { value: formatNetWorth(puzzle.netWorth) })}</span>
        </div>
        <div className="flex items-center gap-1.5" title="Last Hits / Denies">
          <SwordIcon />
          <span>{t("puzzle.cs", { lastHits: puzzle.lastHits, denies: puzzle.denies })}</span>
        </div>
      </div>
    </div>
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

function GoldIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M9 11h6" />
    </svg>
  );
}

function SwordIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

