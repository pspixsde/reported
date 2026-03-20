"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import { RANK_MEDAL_URLS, type RankBracket } from "@/lib/game-types";

function seededSwapDefault(seed: string): boolean {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % 2 === 0;
}

export function ClashGuessPanel() {
  const { t } = useTranslation();
  const clashPuzzle = useGameStore((s) => s.clashPuzzle);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const completed = useGameStore((s) => s.completed);
  const loading = useGameStore((s) => s.loading);
  const submitGuess = useGameStore((s) => s.submitGuess);

  const [swapped, setSwapped] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [swapPhase, setSwapPhase] = useState<"idle" | "out" | "in">("idle");

  useEffect(() => {
    if (!clashPuzzle) return;
    setSwapped(seededSwapDefault(clashPuzzle.id));
    setSwapping(false);
    setSwapPhase("idle");
  }, [clashPuzzle]);

  const levelLabels = useMemo(
    () => [t("result.clash.winner"), t("result.clash.kda"), t("result.clash.rank")],
    [t],
  );

  if (!clashPuzzle || completed) return null;

  const rankA = clashPuzzle.rankOptions[0] as RankBracket;
  const rankB = clashPuzzle.rankOptions[1] as RankBracket;
  const assignedA = swapped ? rankB : rankA;
  const assignedB = swapped ? rankA : rankB;

  function handleSwapRanks() {
    if (loading || swapping) return;
    setSwapping(true);
    setSwapPhase("out");
    window.setTimeout(() => {
      setSwapped((v) => !v);
      setSwapPhase("in");
    }, 150);
    window.setTimeout(() => {
      setSwapping(false);
      setSwapPhase("idle");
    }, 320);
  }

  return (
    <div className="w-full max-w-2xl rounded-xl border border-dota-border bg-dota-surface/85 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2">
        {levelLabels.map((label, i) => {
          const level = i + 1;
          const active = currentLevel === level;
          const past = currentLevel > level;
          return (
            <div
              key={label}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                active && "bg-dota-gold/20 text-dota-gold",
                past && "bg-dota-green/20 text-dota-green",
                !active && !past && "bg-dota-card text-dota-text-dim",
              )}
            >
              {level}. {label}
            </div>
          );
        })}
      </div>

      {currentLevel === 1 && (
        <BinaryLevel
          prompt={t("guess.clash.winner.prompt")}
          leftLabel={t("clash.player1")}
          rightLabel={t("clash.player2")}
          leftValue="player1"
          rightValue="player2"
          onGuess={submitGuess}
          disabled={loading}
        />
      )}

      {currentLevel === 2 && (
        <BinaryLevel
          prompt={t("guess.clash.kda.prompt")}
          leftLabel={t("clash.player1")}
          rightLabel={t("clash.player2")}
          leftValue="player1"
          rightValue="player2"
          onGuess={submitGuess}
          disabled={loading}
        />
      )}

      {currentLevel === 3 && (
        <div>
          <p className="mb-4 text-sm text-dota-text-dim">{t("guess.clash.rank.prompt")}</p>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="text-center text-xs font-semibold uppercase tracking-wider text-dota-text-dim">
                {t("clash.player1")}
              </div>
              <RankCard rank={assignedA} swapPhase={swapPhase} />
            </div>
            <button
              onClick={handleSwapRanks}
              disabled={loading || swapping}
              className="group flex h-12 w-12 items-center justify-center self-center rounded-full border border-dota-border bg-dota-card text-dota-text transition-all hover:scale-105 hover:border-dota-gold/40 hover:bg-dota-gold/10 hover:text-dota-gold active:scale-95 disabled:opacity-50"
              aria-label={t("guess.clash.swap")}
              title={t("guess.clash.swap")}
            >
              <SwapIcon spinning={swapping} />
            </button>
            <div className="flex flex-col items-center gap-2">
              <div className="text-center text-xs font-semibold uppercase tracking-wider text-dota-text-dim">
                {t("clash.player2")}
              </div>
              <RankCard rank={assignedB} swapPhase={swapPhase} />
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() =>
                submitGuess(`player1:${assignedA};player2:${assignedB}`)
              }
              disabled={loading || swapping}
              className="w-full rounded-lg bg-dota-gold px-4 py-2.5 text-sm font-semibold text-dota-bg transition-all hover:bg-dota-gold-dim disabled:opacity-50 sm:w-auto sm:min-w-44"
            >
              {t("guess.clash.confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SwapIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={cn(
        "h-5 w-5 transition-transform duration-300 ease-out",
        spinning && "rotate-180",
      )}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M7 7h10l-3-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 17H7l3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 4l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20l-3-3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BinaryLevel({
  prompt,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  onGuess,
  disabled,
}: {
  prompt: string;
  leftLabel: string;
  rightLabel: string;
  leftValue: string;
  rightValue: string;
  onGuess: (guess: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <p className="mb-3 text-sm text-dota-text-dim">{prompt}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          onClick={() => onGuess(leftValue)}
          disabled={disabled}
          className="rounded-lg border border-dota-border bg-dota-card px-4 py-2 text-sm font-semibold text-dota-text transition-all hover:border-dota-gold/40 hover:bg-dota-gold/10 hover:text-dota-gold disabled:opacity-50"
        >
          {leftLabel}
        </button>
        <button
          onClick={() => onGuess(rightValue)}
          disabled={disabled}
          className="rounded-lg border border-dota-border bg-dota-card px-4 py-2 text-sm font-semibold text-dota-text transition-all hover:border-dota-gold/40 hover:bg-dota-gold/10 hover:text-dota-gold disabled:opacity-50"
        >
          {rightLabel}
        </button>
      </div>
    </div>
  );
}

function RankCard({
  rank,
  swapPhase,
}: {
  rank: RankBracket;
  swapPhase: "idle" | "out" | "in";
}) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-dota-border bg-dota-card px-4 py-3 text-center transition-all duration-150",
        swapPhase === "out" && "scale-95 opacity-35",
        swapPhase !== "out" && "scale-100 opacity-100",
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <Image
          src={RANK_MEDAL_URLS[rank]}
          alt={rank}
          width={48}
          height={48}
          className="h-12 w-12"
          unoptimized
        />
        <span className="text-sm font-semibold text-dota-text">{rank}</span>
      </div>
    </div>
  );
}
