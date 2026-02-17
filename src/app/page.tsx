"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";
import { Header } from "@/components/Header";
import { PuzzleCard } from "@/components/PuzzleCard";
import { GuessPanel } from "@/components/GuessPanel";
import { ResultFeedback } from "@/components/ResultFeedback";
import { ScoreCard } from "@/components/ScoreCard";
import { LevelSelect } from "@/components/LevelSelect";
import { Footer } from "@/components/Footer";
import type { GameMode } from "@/lib/game-types";

export default function Home() {
  const mode = useGameStore((s) => s.mode);
  const puzzle = useGameStore((s) => s.puzzle);
  const loading = useGameStore((s) => s.loading);
  const error = useGameStore((s) => s.error);
  const completed = useGameStore((s) => s.completed);
  const loadConstants = useGameStore((s) => s.loadConstants);
  const puzzlesLevelSelect = useGameStore((s) => s.puzzlesLevelSelect);

  // Load constants on mount
  useEffect(() => {
    loadConstants();
  }, [loadConstants]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 flex-col items-center px-4 py-8">
        {error && (
          <div className="mb-4 rounded-lg border border-dota-red/30 bg-dota-red/10 px-4 py-2 text-sm text-dota-red">
            {error}
          </div>
        )}

        {!mode && !loading && <ModeSelect />}

        {loading && !puzzle && !puzzlesLevelSelect && <LoadingSpinner />}

        {/* Puzzles mode: level select */}
        {mode === "puzzles" && puzzlesLevelSelect && !puzzle && <LevelSelect />}

        {/* Active game (daily or puzzles) */}
        {mode && puzzle && (
          <div className="flex w-full flex-col items-center gap-4">
            <PuzzleCard />
            <ResultFeedback />
            {!completed && <GuessPanel />}
            {completed && <ScoreCard />}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ModeSelect() {
  const startGame = useGameStore((s) => s.startGame);
  const dailyCompleted = useGameStore((s) => s.dailyCompleted);
  const dailyDate = useGameStore((s) => s.dailyDate);
  const dailyScore = useGameStore((s) => s.dailyScore);
  const constantsLoaded = useGameStore((s) => s.constantsLoaded);
  const gamesPlayed = useGameStore((s) => s.gamesPlayed);
  const totalScore = useGameStore((s) => s.totalScore);
  const completedLevels = useGameStore((s) => s.completedLevels);

  const today = new Date().toISOString().slice(0, 10);
  const dailyDoneToday = dailyCompleted && dailyDate === today;

  function handleStart(mode: GameMode) {
    if (!constantsLoaded) return;
    startGame(mode);
  }

  return (
    <div className="flex max-w-lg flex-col items-center text-center">
      {/* Logo / title */}
      <h1 className="text-5xl font-black tracking-tight text-dota-gold sm:text-6xl">
        REPORTED
      </h1>
      <p className="mt-3 max-w-sm text-dota-text-dim">
        Guess the outcome of real Dota 2 matches featuring unusual,
        off-meta builds. Can you read the game?
      </p>

      {/* Patch badge */}
      <span className="mt-2 rounded bg-dota-card px-2.5 py-0.5 text-xs font-medium text-dota-text-dim">
        Patch 7.40b
      </span>

      {/* Mode cards */}
      <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
        {/* Daily Challenge */}
        <button
          onClick={() => handleStart("daily")}
          disabled={!constantsLoaded}
          className="group relative overflow-hidden rounded-xl border border-dota-border bg-dota-surface p-6 text-left transition-all hover:border-dota-gold/40 hover:shadow-lg hover:shadow-dota-gold/5 disabled:opacity-50"
        >
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-dota-gold/5 transition-transform group-hover:scale-150" />
          <div className="relative">
            <h3 className="text-lg font-bold text-dota-gold">Daily Challenge</h3>
            <p className="mt-1 text-sm text-dota-text-dim">
              One puzzle per day. Same for everyone.
            </p>
            {dailyDoneToday && (
              <p className="mt-2 text-xs font-medium text-dota-green">
                Completed today — {dailyScore}/3
              </p>
            )}
          </div>
        </button>

        {/* Puzzles Mode */}
        <button
          onClick={() => handleStart("puzzles")}
          disabled={!constantsLoaded}
          className="group relative overflow-hidden rounded-xl border border-dota-border bg-dota-surface p-6 text-left transition-all hover:border-dota-blue/40 hover:shadow-lg hover:shadow-dota-blue/5 disabled:opacity-50"
        >
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-dota-blue/5 transition-transform group-hover:scale-150" />
          <div className="relative">
            <h3 className="text-lg font-bold text-dota-blue">Puzzles</h3>
            <p className="mt-1 text-sm text-dota-text-dim">
              4 levels of 5 puzzles. Complete them all.
            </p>
            {completedLevels.length > 0 && (
              <p className="mt-2 text-xs font-medium text-dota-blue">
                {completedLevels.length}/4 levels complete
              </p>
            )}
          </div>
        </button>
      </div>

      {/* Daily Challenge Stats */}
      {gamesPlayed > 0 && (
        <div className="mt-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dota-text-dim">
            Daily Challenge Stats
          </p>
          <div className="flex items-center gap-6 text-sm text-dota-text-dim">
            <div className="text-center">
              <p className="text-2xl font-bold text-dota-text">{gamesPlayed}</p>
              <p>Played</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-dota-text">
                {gamesPlayed > 0
                  ? ((totalScore / (gamesPlayed * 3)) * 100).toFixed(0)
                  : 0}
                %
              </p>
              <p>Accuracy</p>
            </div>
          </div>
        </div>
      )}

      {!constantsLoaded && (
        <p className="mt-4 text-sm text-dota-text-dim animate-pulse">
          Loading game data...
        </p>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-dota-border border-t-dota-gold" />
      <p className="text-sm text-dota-text-dim">Loading puzzle...</p>
    </div>
  );
}
