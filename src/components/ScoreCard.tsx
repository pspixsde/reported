"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { CountdownTimer } from "./CountdownTimer";

interface ScoreCardProps {
  className?: string;
}

export function ScoreCard({ className }: ScoreCardProps) {
  const [copied, setCopied] = useState(false);
  const completed = useGameStore((s) => s.completed);
  const score = useGameStore((s) => s.score);
  const results = useGameStore((s) => s.results);
  const mode = useGameStore((s) => s.mode);
  const puzzle = useGameStore((s) => s.puzzle);
  const heroes = useGameStore((s) => s.heroes);
  const resetGame = useGameStore((s) => s.resetGame);
  const startGame = useGameStore((s) => s.startGame);

  if (!completed) return null;

  const heroName =
    (puzzle && heroes?.[puzzle.heroId]?.localized_name) ||
    puzzle?.hero ||
    "Unknown";

  const scoreMessages: Record<number, string> = {
    0: "Griefing! Better luck next time.",
    1: "Not bad, but still reported.",
    2: "Close! Almost got away with it.",
    3: "Perfect read! This player is clean.",
  };

  const shareText = generateShareText(score, results.map((r) => r.correct));

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
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
      <div className="mb-2 text-5xl font-black text-dota-gold">{score}/3</div>
      <p className="text-sm text-dota-text-dim">
        {scoreMessages[score] || "GG!"}
      </p>
      <p className="mt-1 text-xs text-dota-text-dim">
        Hero: <span className="font-medium text-dota-text">{heroName}</span>
      </p>

      {/* Action buttons */}
      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={handleShare}
          className={cn(
            "rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
            copied
              ? "bg-dota-green text-dota-bg"
              : "bg-dota-gold text-dota-bg hover:bg-dota-gold-dim",
          )}
        >
          {copied ? "Copied!" : "Copy Results"}
        </button>

        {mode === "practice" && (
          <button
            onClick={() => startGame("practice")}
            className="rounded-lg border border-dota-border px-4 py-2.5 text-sm font-medium text-dota-text transition-colors hover:border-dota-gold/40 hover:text-dota-gold"
          >
            Play Again
          </button>
        )}

        <button
          onClick={resetGame}
          className="text-sm text-dota-text-dim transition-colors hover:text-dota-text"
        >
          Back to Menu
        </button>
      </div>

      {/* Daily countdown */}
      {mode === "daily" && (
        <div className="mt-6 border-t border-dota-border pt-4">
          <CountdownTimer />
        </div>
      )}
    </div>
  );
}

function generateShareText(score: number, correctResults: boolean[]): string {
  const emojis = correctResults
    .map((c) => (c ? "🟢" : "🔴"))
    .join(" ");

  const today = new Date().toISOString().slice(0, 10);

  return [
    `REPORTED ${score}/3`,
    emojis,
    `${today}`,
    "",
    "https://reported.gg", // placeholder
  ].join("\n");
}
