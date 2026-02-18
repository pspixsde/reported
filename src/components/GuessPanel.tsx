"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import { RANK_BRACKETS, RANK_MEDAL_URLS } from "@/lib/game-types";
import type { GuessLevel } from "@/lib/game-types";
import { translateAnswer } from "@/lib/translate-answer";

interface GuessPanelProps {
  className?: string;
}

export function GuessPanel({ className }: GuessPanelProps) {
  const currentLevel = useGameStore((s) => s.currentLevel);
  const completed = useGameStore((s) => s.completed);
  const loading = useGameStore((s) => s.loading);
  const submitGuess = useGameStore((s) => s.submitGuess);
  const mode = useGameStore((s) => s.mode);
  const puzzlesHardMode = useGameStore((s) => s.puzzlesHardMode);

  if (completed) return null;

  const hard = puzzlesHardMode && mode === "puzzles";
  const totalLevels = hard ? 4 : 3;

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-lg border border-dota-border bg-dota-surface p-5",
        className,
      )}
    >
      <LevelIndicator current={currentLevel} hard={hard} total={totalLevels} />

      <div className="mt-4">
        {hard ? (
          <>
            {currentLevel === 1 && (
              <HeroGuess onGuess={submitGuess} disabled={loading} />
            )}
            {currentLevel === 2 && (
              <WinLossGuess onGuess={submitGuess} disabled={loading} />
            )}
            {currentLevel === 3 && (
              <KdaQuizGuess onGuess={submitGuess} disabled={loading} />
            )}
            {currentLevel === 4 && (
              <RankGuess onGuess={submitGuess} disabled={loading} />
            )}
          </>
        ) : (
          <>
            {currentLevel === 1 && (
              <WinLossGuess onGuess={submitGuess} disabled={loading} />
            )}
            {currentLevel === 2 && (
              <KdaQuizGuess onGuess={submitGuess} disabled={loading} />
            )}
            {currentLevel === 3 && (
              <RankGuess onGuess={submitGuess} disabled={loading} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Level indicator ──

function LevelIndicator({
  current,
  hard,
  total,
}: {
  current: GuessLevel;
  hard: boolean;
  total: number;
}) {
  const { t } = useTranslation();

  const labels = hard
    ? [t("guess.hero"), t("guess.winloss"), t("guess.kda"), t("guess.rank")]
    : [t("guess.winloss"), t("guess.kda"), t("guess.rank")];

  return (
    <div className={cn("flex items-center overflow-hidden", hard ? "gap-1" : "gap-2")}>
      {labels.slice(0, total).map((label, i) => {
        const level = (i + 1) as GuessLevel;
        const isActive = level === current;
        const isPast = level < current;
        return (
          <div key={label} className={cn("flex items-center", hard ? "gap-1" : "gap-2")}>
            {i > 0 && (
              <div
                className={cn(
                  "h-px",
                  hard ? "w-3" : "w-4",
                  isPast ? "bg-dota-gold" : "bg-dota-border",
                )}
              />
            )}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full py-1 text-xs font-medium transition-colors",
                hard ? "px-2" : "px-3",
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

// ── Hard Mode Level 1: Guess the Hero ──

function HeroGuess({
  onGuess,
  disabled,
}: {
  onGuess: (g: string) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const puzzle = useGameStore((s) => s.puzzle);
  const heroes = useGameStore((s) => s.heroes);

  const heroOptions = puzzle?.heroOptions ?? [];

  return (
    <div>
      <p className="mb-3 text-sm text-dota-text-dim">
        {t("guess.hero.prompt")
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
        {heroOptions.map((heroId) => {
          const hero = heroes?.[heroId];
          const name = hero?.localized_name || `Hero ${heroId}`;
          const imgPath = hero?.img
            ? `https://cdn.cloudflare.steamstatic.com${hero.img}`
            : undefined;
          return (
            <button
              key={heroId}
              onClick={() => onGuess(String(heroId))}
              disabled={disabled}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "active:scale-[0.97]",
                "border-dota-border bg-dota-card text-dota-text hover:border-dota-gold/40 hover:bg-dota-gold/10 hover:text-dota-gold",
              )}
            >
              {imgPath && (
                <Image
                  src={imgPath}
                  alt={name}
                  width={32}
                  height={18}
                  className="h-[18px] w-[32px] rounded-sm"
                  unoptimized
                />
              )}
              <span className="truncate">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Level 1 (Normal) / Level 2 (Hard): Win or Loss ──

function WinLossGuess({
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

// ── Level 2 (Normal) / Level 3 (Hard): KDA Quiz (4 options) ──

function KdaQuizGuess({
  onGuess,
  disabled,
}: {
  onGuess: (g: string) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const puzzle = useGameStore((s) => s.puzzle);
  const kdaOptions = puzzle?.kdaOptions ?? [];

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
      <div className="grid grid-cols-2 gap-2">
        {kdaOptions.map((kda) => (
          <GuessButton
            key={kda}
            onClick={() => onGuess(kda)}
            disabled={disabled}
            variant="neutral"
            size="sm"
          >
            {kda}
          </GuessButton>
        ))}
      </div>
    </div>
  );
}

// ── Level 3 (Normal) / Level 4 (Hard): Rank Bracket (with medal images) ──

function RankGuess({
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
      <div className="grid grid-cols-4 gap-2">
        {RANK_BRACKETS.map((bracket) => (
            <button
              key={bracket}
              onClick={() => onGuess(bracket)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-all",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "active:scale-[0.97]",
                "border-dota-border bg-dota-card text-dota-text hover:border-dota-gold/40 hover:bg-dota-gold/10 hover:text-dota-gold",
              )}
            >
              <Image
                src={RANK_MEDAL_URLS[bracket]}
                alt={bracket}
                width={32}
                height={32}
                className="h-8 w-8"
                unoptimized
              />
              <span>{translateAnswer(bracket, t)}</span>
            </button>
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
