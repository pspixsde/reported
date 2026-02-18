"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useTranslation } from "@/i18n";
import { Header } from "@/components/Header";
import { PuzzleCard } from "@/components/PuzzleCard";
import { GuessPanel } from "@/components/GuessPanel";
import { ResultFeedback } from "@/components/ResultFeedback";
import { ScoreCard } from "@/components/ScoreCard";
import { ReportSurvey } from "@/components/ReportSurvey";
import { LevelSelect } from "@/components/LevelSelect";
import { PuzzleNavigation } from "@/components/PuzzleNavigation";
import { Footer } from "@/components/Footer";
import { SocialLinks } from "@/components/SocialLinks";
import type { GameMode } from "@/lib/game-types";
import { PUZZLES_TOTAL } from "@/lib/game-types";

export default function Home() {
  const mode = useGameStore((s) => s.mode);
  const puzzle = useGameStore((s) => s.puzzle);
  const loading = useGameStore((s) => s.loading);
  const error = useGameStore((s) => s.error);
  const completed = useGameStore((s) => s.completed);
  const loadConstants = useGameStore((s) => s.loadConstants);
  const puzzlesGridVisible = useGameStore((s) => s.puzzlesGridVisible);

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

        {loading && !puzzle && !puzzlesGridVisible && <LoadingSpinner />}

        {/* Puzzles mode: puzzle grid */}
        {mode === "puzzles" && puzzlesGridVisible && !puzzle && <LevelSelect />}

        {/* Active game (daily or puzzles) */}
        {mode && puzzle && (
          <div className="flex w-full flex-col items-center gap-4">
            {mode === "puzzles" && <PuzzleNavigation />}
            <PuzzleCard />
            <ResultFeedback />
            {!completed && <GuessPanel />}
            {!completed && <LevelGlobalStat />}
            {completed && <ReportSurvey />}
            {completed && <ScoreCard />}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ModeSelect() {
  const { t } = useTranslation();
  const startGame = useGameStore((s) => s.startGame);
  const dailyCompleted = useGameStore((s) => s.dailyCompleted);
  const dailyDate = useGameStore((s) => s.dailyDate);
  const dailyScore = useGameStore((s) => s.dailyScore);
  const constantsLoaded = useGameStore((s) => s.constantsLoaded);
  const gamesPlayed = useGameStore((s) => s.gamesPlayed);
  const totalScore = useGameStore((s) => s.totalScore);
  const completedPuzzles = useGameStore((s) => s.completedPuzzles);
  const easyMode = useSettingsStore((s) => s.easyMode);

  const today = new Date().toISOString().slice(0, 10);
  const dailyDoneToday = dailyCompleted && dailyDate === today;

  function handleStart(mode: GameMode) {
    if (!constantsLoaded) return;
    startGame(mode);
  }

  return (
    <div className="flex max-w-lg flex-col items-center text-center">
      {/* Logo / title */}
      <h1 className={`text-5xl font-black tracking-tight sm:text-6xl ${easyMode ? "text-dota-green" : "text-dota-gold"}`}>
        {t("app.title")}
      </h1>
      <p className="mt-3 max-w-sm text-dota-text-dim">{t("app.tagline")}</p>

      {/* Patch badges */}
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded bg-dota-card px-2.5 py-0.5 text-xs font-medium text-dota-text-dim">
          Patch 7.40+
        </span>
        <span className="rounded bg-dota-card px-2.5 py-0.5 text-xs font-medium text-dota-text-dim">
          Ranked Only
        </span>
      </div>

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
            <h3 className="text-lg font-bold text-dota-gold">
              {t("mode.daily.title")}
            </h3>
            <p className="mt-1 text-sm text-dota-text-dim">
              {t("mode.daily.desc")}
            </p>
            {dailyDoneToday && (
              <p className="mt-2 text-xs font-medium text-dota-green">
                {t("mode.daily.completed")}
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
            <h3 className="text-lg font-bold text-dota-blue">
              {t("mode.puzzles.title")}
            </h3>
            <p className="mt-1 text-sm text-dota-text-dim">
              {t("mode.puzzles.desc")}
            </p>
            {completedPuzzles.length > 0 && (
              <p className="mt-2 text-xs font-medium text-dota-blue">
                {t("mode.puzzles.progress", { completed: completedPuzzles.length, total: PUZZLES_TOTAL })}
              </p>
            )}
          </div>
        </button>
      </div>

      {/* Daily Challenge Stats */}
      {gamesPlayed > 0 && (
        <div className="mt-8 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dota-text-dim">
            {t("stats.title")}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-dota-text-dim">
            <div className="text-center">
              <p className="text-2xl font-bold text-dota-text">{gamesPlayed}</p>
              <p>{t("stats.played")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-dota-text">
                {gamesPlayed > 0
                  ? ((totalScore / (gamesPlayed * 3)) * 100).toFixed(0)
                  : 0}
                %
              </p>
              <p>{t("stats.accuracy")}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <SocialLinks />
      </div>

      {!constantsLoaded && (
        <p className="mt-4 text-sm text-dota-text-dim animate-pulse">
          {t("app.loading")}
        </p>
      )}
    </div>
  );
}

function LevelGlobalStat() {
  const { t } = useTranslation();
  const currentLevel = useGameStore((s) => s.currentLevel);
  const mode = useGameStore((s) => s.mode);
  const stats = useGameStore((s) => s.puzzleGlobalStats);

  if (!stats) return null;

  const levelStat = stats.levels[String(currentLevel)];
  if (!levelStat || levelStat.total === 0) return null;

  const percent = Math.round((levelStat.correct / levelStat.total) * 100);
  const isDaily = mode === "daily";

  return (
    <p className="text-center text-xs text-dota-text-dim">
      {t(isDaily ? "stats.levelCorrect.daily" : "stats.levelCorrect", { percent })}
    </p>
  );
}

function LoadingSpinner() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-dota-border border-t-dota-gold" />
      <p className="text-sm text-dota-text-dim">{t("loading.puzzle")}</p>
    </div>
  );
}
