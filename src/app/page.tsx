"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useTranslation } from "@/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SocialLinks } from "@/components/SocialLinks";
import { PUZZLES_TOTAL } from "@/lib/game-types";

export default function Home() {
  const loadConstants = useGameStore((s) => s.loadConstants);
  const resetGame = useGameStore((s) => s.resetGame);

  useEffect(() => {
    resetGame();
    loadConstants();
  }, [loadConstants, resetGame]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <ModeSelect />
      </main>

      <Footer />
    </div>
  );
}

function ModeSelect() {
  const { t } = useTranslation();
  const dailyCompleted = useGameStore((s) => s.dailyCompleted);
  const dailyDate = useGameStore((s) => s.dailyDate);
  const clashCompleted = useGameStore((s) => s.clashCompleted);
  const clashDate = useGameStore((s) => s.clashDate);
  const constantsLoaded = useGameStore((s) => s.constantsLoaded);
  const gamesPlayed = useGameStore((s) => s.gamesPlayed);
  const totalScore = useGameStore((s) => s.totalScore);
  const completedPuzzles = useGameStore((s) => s.completedPuzzles);
  const completedHardPuzzles = useGameStore((s) => s.completedHardPuzzles);
  const easyMode = useSettingsStore((s) => s.easyMode);

  const today = new Date().toISOString().slice(0, 10);
  const dailyDoneToday = dailyCompleted && dailyDate === today;
  const clashDoneToday = clashCompleted && clashDate === today;

  return (
    <div className="flex max-w-4xl flex-col items-center text-center">
      {/* Logo / title */}
      <h1 className={`text-5xl font-black tracking-tight sm:text-6xl ${easyMode ? "text-dota-green" : "text-dota-gold"}`}>
        {t("app.title")}
      </h1>
      <p className="mt-3 max-w-sm text-dota-text-dim">{t("app.tagline")}</p>

      {/* Patch badges */}
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded bg-dota-card px-2.5 py-0.5 text-xs font-medium text-dota-text-dim">
          Patch 7.41+
        </span>
        <span className="rounded bg-dota-card px-2.5 py-0.5 text-xs font-medium text-dota-text-dim">
          Ranked Only
        </span>
      </div>

      {/* Mode cards */}
      <div className="mt-8 grid w-full gap-4 md:grid-cols-2">
        {/* Daily Challenge */}
        <Link
          href="/daily"
          aria-disabled={!constantsLoaded}
          onClick={(event) => {
            if (!constantsLoaded) event.preventDefault();
          }}
          className={`group relative overflow-hidden rounded-xl border border-dota-border bg-dota-surface p-6 text-left transition-all hover:border-dota-gold/40 hover:shadow-lg hover:shadow-dota-gold/10 md:col-span-2 md:justify-self-center md:w-full md:max-w-[43rem] ${
            !constantsLoaded ? "pointer-events-none opacity-50" : ""
          }`}
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
        </Link>

        {/* Puzzles Mode */}
        <Link
          href="/puzzles"
          aria-disabled={!constantsLoaded}
          onClick={(event) => {
            if (!constantsLoaded) event.preventDefault();
          }}
          className={`group relative overflow-hidden rounded-xl border border-dota-border bg-dota-surface p-6 text-left transition-all hover:border-dota-blue/40 hover:shadow-lg hover:shadow-dota-blue/5 md:justify-self-end md:w-full md:max-w-[21rem] ${
            !constantsLoaded ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-dota-blue/5 transition-transform group-hover:scale-150" />
          <div className="relative">
            <h3 className="text-lg font-bold text-dota-blue">
              {t("mode.puzzles.title")}
            </h3>
            <p className="mt-1 text-sm text-dota-text-dim">
              {t("mode.puzzles.desc")}
            </p>
            {completedPuzzles.length + completedHardPuzzles.length > 0 && (
              <p className="mt-2 text-xs font-medium text-dota-blue">
                {t("mode.puzzles.progress", {
                  completed: completedPuzzles.length + completedHardPuzzles.length,
                  total: PUZZLES_TOTAL * 2,
                })}
              </p>
            )}
          </div>
        </Link>

        {/* Build Clash */}
        <Link
          href="/clash"
          aria-disabled={!constantsLoaded}
          onClick={(event) => {
            if (!constantsLoaded) event.preventDefault();
          }}
          className={`group relative overflow-hidden rounded-xl border border-dota-border bg-dota-surface p-6 text-left transition-all hover:border-dota-red/40 hover:shadow-lg hover:shadow-dota-red/5 md:justify-self-start md:w-full md:max-w-[21rem] ${
            !constantsLoaded ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-dota-red/5 transition-transform group-hover:scale-150" />
          <div className="relative">
            <h3 className="text-lg font-bold text-dota-red">
              {t("mode.clash.title")}
            </h3>
            <p className="mt-1 text-sm text-dota-text-dim">
              {t("mode.clash.desc")}
            </p>
            {clashDoneToday && (
              <p className="mt-2 text-xs font-medium text-dota-green">
                {t("mode.clash.completed")}
              </p>
            )}
          </div>
        </Link>
      </div>

      {/* Daily Challenge Stats */}
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
