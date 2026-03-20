"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import { CountdownTimer } from "./CountdownTimer";
import { SocialLinks } from "./SocialLinks";

interface ScoreCardProps {
  className?: string;
}

export function ScoreCard({ className }: ScoreCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const completed = useGameStore((s) => s.completed);
  const score = useGameStore((s) => s.score);
  const results = useGameStore((s) => s.results);
  const mode = useGameStore((s) => s.mode);
  const puzzle = useGameStore((s) => s.puzzle);
  const clashPuzzle = useGameStore((s) => s.clashPuzzle);
  const resetGame = useGameStore((s) => s.resetGame);
  const returnToPuzzleGrid = useGameStore((s) => s.returnToPuzzleGrid);
  const maxScore = useGameStore((s) => s.maxScore);
  const globalStats = useGameStore((s) => s.puzzleGlobalStats);

  if (!completed) return null;

  const max = maxScore();

  const scoreKey =
    mode === "clash"
      ? (`score.clash.${Math.min(score, 3)}` as
          | "score.clash.0"
          | "score.clash.1"
          | "score.clash.2"
          | "score.clash.3")
      : max === 4
        ? (`score.hard.${score}` as
            | "score.hard.0"
            | "score.hard.1"
            | "score.hard.2"
            | "score.hard.3"
            | "score.hard.4")
        : (`score.${Math.min(score, 3)}` as "score.0" | "score.1" | "score.2" | "score.3");

  const shareText = generateShareText(score, max, results.map((r) => r.correct));

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  function handleBackToMenu() {
    resetGame();
    router.push("/");
  }

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-lg border border-dota-border bg-dota-surface p-6 text-center",
        "animate-[fadeSlideIn_0.4s_ease-out]",
        className,
      )}
    >
      {/* Score */}
      <div className="mb-2 text-5xl font-black text-dota-gold">{score}/{max}</div>
      <p className="text-sm text-dota-text-dim">{t(scoreKey)}</p>
      {globalStats && globalStats.completions > 0 && (
        <p className="mt-1 text-xs text-dota-text-dim">
          {t("stats.avgScore", {
            avg: (globalStats.totalScore / globalStats.completions).toFixed(1),
            max,
          })}
        </p>
      )}
      {puzzle && (
        <p className="mt-1 text-xs text-dota-text-dim">
          {t("score.matchId")}{" "}
          <a
            href={`https://www.opendota.com/matches/${puzzle.id.split("-")[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-dota-text underline decoration-dota-border underline-offset-2 transition-colors hover:text-dota-gold hover:decoration-dota-gold"
          >
            {puzzle.id.split("-")[0]}
          </a>
        </p>
      )}
      {mode === "clash" && clashPuzzle && (
        <p className="mt-1 text-xs text-dota-text-dim">
          {t("score.matchId")}{" "}
          <a
            href={`https://www.opendota.com/matches/${clashPuzzle.buildA.id.split("-")[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-dota-text underline decoration-dota-border underline-offset-2 transition-colors hover:text-dota-gold hover:decoration-dota-gold"
          >
            {clashPuzzle.buildA.id.split("-")[0]}
          </a>{" "}
          /{" "}
          <a
            href={`https://www.opendota.com/matches/${clashPuzzle.buildB.id.split("-")[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-dota-text underline decoration-dota-border underline-offset-2 transition-colors hover:text-dota-gold hover:decoration-dota-gold"
          >
            {clashPuzzle.buildB.id.split("-")[0]}
          </a>
        </p>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex flex-col gap-2">
        {/* Copy Results — shown for all modes */}
        <button
          onClick={handleShare}
          className={cn(
            "rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
            copied
              ? "bg-dota-green text-dota-bg"
              : "bg-dota-gold text-dota-bg hover:bg-dota-gold-dim",
          )}
        >
          {copied ? t("score.copied") : t("score.copy")}
        </button>

        {/* Back to Puzzles — only in puzzles mode */}
        {mode === "puzzles" && (
          <button
            onClick={returnToPuzzleGrid}
            className="rounded-lg border border-dota-border px-4 py-2.5 text-sm font-semibold text-dota-text transition-all hover:bg-dota-card"
          >
            {t("score.backToPuzzles")}
          </button>
        )}

        <button
          onClick={handleBackToMenu}
          className="rounded-lg border border-dota-border px-4 py-2.5 text-sm font-semibold text-dota-text transition-all hover:bg-dota-card"
        >
          {t("score.backToMenu")}
        </button>
      </div>

      {/* Daily countdown */}
      {(mode === "daily" || mode === "clash") && (
        <div className="mt-6 border-t border-dota-border pt-4">
          <CountdownTimer />
        </div>
      )}

      <div className="mt-6 border-t border-dota-border pt-4">
        <SocialLinks />
      </div>
    </div>
  );
}

function generateShareText(score: number, maxScore: number, correctResults: boolean[]): string {
  const emojis = correctResults
    .map((c) => (c ? "🟢" : "🔴"))
    .join(" ");

  const today = new Date().toISOString().slice(0, 10);

  return [
    `REPORTED ${score}/${maxScore}`,
    emojis,
    `${today}`,
    "",
    "https://reported-dota.org",
  ].join("\n");
}
