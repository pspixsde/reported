"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  GameMode,
  GuessLevel,
  LevelResult,
  PuzzlePublic,
  HeroConstant,
  ItemConstant,
  GuessResponse,
} from "@/lib/game-types";

// ── Store state ──

interface GameStoreState {
  // Current game
  mode: GameMode | null;
  puzzle: PuzzlePublic | null;
  currentLevel: GuessLevel;
  results: LevelResult[];
  completed: boolean;
  score: number;
  loading: boolean;
  error: string | null;

  // Daily tracking
  dailyDate: string | null; // "YYYY-MM-DD"
  dailyCompleted: boolean;
  dailyScore: number | null;
  dailyResults: LevelResult[];

  // Stats
  streak: number;
  gamesPlayed: number;
  totalScore: number;

  // Constants (hero/item lookup)
  heroes: Record<number, HeroConstant> | null;
  items: Record<number, ItemConstant> | null;
  constantsLoaded: boolean;

  // Actions
  loadConstants: () => Promise<void>;
  startGame: (mode: GameMode) => Promise<void>;
  submitGuess: (guess: string) => Promise<void>;
  resetGame: () => void;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      mode: null,
      puzzle: null,
      currentLevel: 1,
      results: [],
      completed: false,
      score: 0,
      loading: false,
      error: null,

      dailyDate: null,
      dailyCompleted: false,
      dailyScore: null,
      dailyResults: [],

      streak: 0,
      gamesPlayed: 0,
      totalScore: 0,

      heroes: null,
      items: null,
      constantsLoaded: false,

      // ── Load hero/item constants ──
      loadConstants: async () => {
        if (get().constantsLoaded) return;
        try {
          const res = await fetch("/api/constants");
          if (!res.ok) throw new Error("Failed to load constants");
          const data = await res.json();
          set({
            heroes: data.heroes,
            items: data.items,
            constantsLoaded: true,
          });
        } catch (err) {
          console.error("Failed to load constants:", err);
          set({ error: "Failed to load game data" });
        }
      },

      // ── Start a new game ──
      startGame: async (mode: GameMode) => {
        const state = get();

        // If daily and already completed today, restore results
        if (mode === "daily" && state.dailyDate === todayUTC() && state.dailyCompleted) {
          set({
            mode: "daily",
            completed: true,
            results: state.dailyResults,
            score: state.dailyScore ?? 0,
            currentLevel: 1,
            error: null,
          });
          return;
        }

        set({ loading: true, error: null });

        try {
          const endpoint =
            mode === "daily" ? "/api/puzzle/daily" : "/api/puzzle/random";
          const res = await fetch(endpoint);
          if (!res.ok) throw new Error("Failed to fetch puzzle");
          const puzzle: PuzzlePublic = await res.json();

          // If daily and we have an in-progress game for today, restore
          if (
            mode === "daily" &&
            state.dailyDate === todayUTC() &&
            !state.dailyCompleted &&
            state.puzzle?.id === puzzle.id
          ) {
            set({
              mode: "daily",
              loading: false,
              error: null,
            });
            return;
          }

          set({
            mode,
            puzzle,
            currentLevel: 1,
            results: [],
            completed: false,
            score: 0,
            loading: false,
            error: null,
            ...(mode === "daily" ? { dailyDate: todayUTC() } : {}),
          });
        } catch (err) {
          console.error("Error starting game:", err);
          set({
            loading: false,
            error: "Failed to start game. Try again.",
          });
        }
      },

      // ── Submit a guess for the current level ──
      submitGuess: async (guess: string) => {
        const { puzzle, currentLevel, results, mode } = get();
        if (!puzzle) return;

        set({ loading: true });

        try {
          const endpoint =
            mode === "daily"
              ? "/api/puzzle/daily"
              : "/api/puzzle/random";

          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              puzzleId: puzzle.id,
              level: currentLevel,
              guess,
            }),
          });

          if (!res.ok) throw new Error("Failed to submit guess");

          const data: GuessResponse = await res.json();
          const result: LevelResult = {
            guess,
            correct: data.correct,
            answer: data.answer,
          };

          const newResults = [...results, result];
          const newScore =
            get().score + (data.correct ? 1 : 0);

          if (currentLevel >= 3) {
            // Game complete
            const state = get();
            const newGamesPlayed = state.gamesPlayed + 1;
            const newTotalScore = state.totalScore + newScore;
            const newStreak = newScore === 3 ? state.streak + 1 : 0;

            set({
              results: newResults,
              score: newScore,
              completed: true,
              loading: false,
              gamesPlayed: newGamesPlayed,
              totalScore: newTotalScore,
              streak: newStreak,
              ...(mode === "daily"
                ? {
                    dailyCompleted: true,
                    dailyScore: newScore,
                    dailyResults: newResults,
                  }
                : {}),
            });
          } else {
            // Advance to next level
            set({
              results: newResults,
              score: newScore,
              currentLevel: (currentLevel + 1) as GuessLevel,
              loading: false,
              ...(mode === "daily" ? { dailyResults: newResults } : {}),
            });
          }
        } catch (err) {
          console.error("Error submitting guess:", err);
          set({ loading: false, error: "Failed to submit guess" });
        }
      },

      // ── Reset for a new game ──
      resetGame: () => {
        set({
          mode: null,
          puzzle: null,
          currentLevel: 1,
          results: [],
          completed: false,
          score: 0,
          loading: false,
          error: null,
        });
      },
    }),
    {
      name: "reported-game-store",
      partialize: (state) => ({
        // Only persist these fields to localStorage
        dailyDate: state.dailyDate,
        dailyCompleted: state.dailyCompleted,
        dailyScore: state.dailyScore,
        dailyResults: state.dailyResults,
        streak: state.streak,
        gamesPlayed: state.gamesPlayed,
        totalScore: state.totalScore,
      }),
    },
  ),
);
