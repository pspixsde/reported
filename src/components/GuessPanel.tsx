"use client";

import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import { RANK_BRACKETS, KDA_BUCKETS } from "@/lib/game-types";
import type { GuessLevel } from "@/lib/game-types";

interface GuessPanelProps {
  className?: string;
}

export function GuessPanel({ className }: GuessPanelProps) {
  const currentLevel = useGameStore((s) => s.currentLevel);
  const completed = useGameStore((s) => s.completed);
  const loading = useGameStore((s) => s.loading);
  const submitGuess = useGameStore((s) => s.submitGuess);

  if (completed) return null;

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-lg border border-dota-border bg-dota-surface p-5",
        className,
      )}
    >
      <LevelIndicator current={currentLevel} />

      <div className="mt-4">
        {currentLevel === 1 && (
          <Level1Guess onGuess={submitGuess} disabled={loading} />
        )}
        {currentLevel === 2 && (
          <Level2Guess onGuess={submitGuess} disabled={loading} />
        )}
        {currentLevel === 3 && (
          <Level3Guess onGuess={submitGuess} disabled={loading} />
        )}
      </div>
    </div>
  );
}

// ── Level indicator ──

function LevelIndicator({ current }: { current: GuessLevel }) {
  const { t } = useTranslation();
  const labels = [t("guess.winloss"), t("guess.rank"), t("guess.kda")];
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => {
        const level = (i + 1) as GuessLevel;
        const isActive = level === current;
        const isPast = level < current;
        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={cn(
                  "h-px w-4",
                  isPast ? "bg-dota-gold" : "bg-dota-border",
                )}
              />
            )}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                isActive && "bg-dota-gold/20 text-dota-gold",
                isPast && "bg-dota-green/20 text-dota-green",
                !isActive && !isPast && "text-dota-text-dim",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  isActive && "bg-dota-gold text-dota-bg",
                  isPast && "bg-dota-green text-dota-bg",
                  !isActive && !isPast && "bg-dota-border text-dota-text-dim",
                )}
              >
                {isPast ? "✓" : level}
              </span>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Level 1: Win or Loss ──

function Level1Guess({
  onGuess,
  disabled,
}: {
  onGuess: (g: string) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="mb-3 text-sm text-dota-text-dim">
        {t("guess.level1.prompt")
          .split(/<b>|<\/b>/)
          .map((part, i) =>
            i % 2 === 1 ? (
              <span key={i} className="font-semibold text-dota-text">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
      </p>
      <div className="flex gap-3">
        <GuessButton
          onClick={() => onGuess("Win")}
          disabled={disabled}
          variant="green"
        >
          {t("guess.win")}
        </GuessButton>
        <GuessButton
          onClick={() => onGuess("Loss")}
          disabled={disabled}
          variant="red"
        >
          {t("guess.loss")}
        </GuessButton>
      </div>
    </div>
  );
}

// ── Level 2: Rank Bracket ──

function Level2Guess({
  onGuess,
  disabled,
}: {
  onGuess: (g: string) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="mb-3 text-sm text-dota-text-dim">
        {t("guess.level2.prompt")
          .split(/<b>|<\/b>/)
          .map((part, i) =>
            i % 2 === 1 ? (
              <span key={i} className="font-semibold text-dota-text">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {RANK_BRACKETS.map((bracket) => (
          <GuessButton
            key={bracket}
            onClick={() => onGuess(bracket)}
            disabled={disabled}
            variant="neutral"
            size="sm"
          >
            {bracket}
          </GuessButton>
        ))}
      </div>
    </div>
  );
}

// ── Level 3: KDA Range ──

function Level3Guess({
  onGuess,
  disabled,
}: {
  onGuess: (g: string) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="mb-3 text-sm text-dota-text-dim">
        {t("guess.level3.prompt")
          .split(/<b>|<\/b>/)
          .map((part, i) =>
            i % 2 === 1 ? (
              <span key={i} className="font-semibold text-dota-text">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {KDA_BUCKETS.map((bucket) => (
          <GuessButton
            key={bucket}
            onClick={() => onGuess(bucket)}
            disabled={disabled}
            variant="neutral"
            size="sm"
          >
            {bucket}
          </GuessButton>
        ))}
      </div>
    </div>
  );
}

// ── Shared button ──

function GuessButton({
  children,
  onClick,
  disabled,
  variant = "neutral",
  size = "md",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  variant?: "green" | "red" | "neutral";
  size?: "sm" | "md";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg border font-medium transition-all",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "active:scale-[0.97]",
        size === "sm" ? "px-2 py-1.5 text-xs" : "px-6 py-2.5 text-sm",
        variant === "green" &&
          "border-dota-green/30 bg-dota-green/10 text-dota-green hover:bg-dota-green/20",
        variant === "red" &&
          "border-dota-red/30 bg-dota-red/10 text-dota-red hover:bg-dota-red/20",
        variant === "neutral" &&
          "border-dota-border bg-dota-card text-dota-text hover:border-dota-gold/40 hover:bg-dota-gold/10 hover:text-dota-gold",
      )}
    >
      {children}
    </button>
  );
}
