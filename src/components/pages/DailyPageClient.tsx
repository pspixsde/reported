"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import { Header } from "@/components/Header";
import { PuzzleCard } from "@/components/PuzzleCard";
import { GuessPanel } from "@/components/GuessPanel";
import { ResultFeedback } from "@/components/ResultFeedback";
import { ScoreCard } from "@/components/ScoreCard";
import { ReportSurvey } from "@/components/ReportSurvey";
import { Footer } from "@/components/Footer";

export function DailyPageClient() {
  const mode = useGameStore((s) => s.mode);
  const puzzle = useGameStore((s) => s.puzzle);
  const loading = useGameStore((s) => s.loading);
  const error = useGameStore((s) => s.error);
  const completed = useGameStore((s) => s.completed);
  const loadConstants = useGameStore((s) => s.loadConstants);
  const startGame = useGameStore((s) => s.startGame);

  useEffect(() => {
    loadConstants();
  }, [loadConstants]);

  useEffect(() => {
    if (mode !== "daily" || !puzzle) {
      startGame("daily");
    }
  }, [mode, puzzle, startGame]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 flex-col items-center px-4 py-8">
        {error && (
          <div className="mb-4 rounded-lg border border-dota-red/30 bg-dota-red/10 px-4 py-2 text-sm text-dota-red">
            {error}
          </div>
        )}

        {loading && !puzzle && <LoadingSpinner />}

        {puzzle && (
          <div className="flex w-full flex-col items-center gap-4">
            <PuzzleCard />
            <ResultFeedback />
            {!completed && <GuessPanel />}
            {!completed && <LevelGlobalStat daily />}
            {completed && <ReportSurvey />}
            {completed && <ScoreCard />}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function LevelGlobalStat({ daily }: { daily: boolean }) {
  const { t } = useTranslation();
  const currentLevel = useGameStore((s) => s.currentLevel);
  const stats = useGameStore((s) => s.puzzleGlobalStats);

  if (!stats) return null;

  const levelStat = stats.levels[String(currentLevel)];
  if (!levelStat || levelStat.total === 0) return null;

  const percent = Math.round((levelStat.correct / levelStat.total) * 100);

  return (
    <p className="text-center text-xs text-dota-text-dim">
      {t(daily ? "stats.levelCorrect.daily" : "stats.levelCorrect", { percent })}
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
