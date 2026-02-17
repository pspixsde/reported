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
import { PUZZLES_PER_LEVEL } from "@/lib/game-types";

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

  // Daily-only stats
  streak: number;
  gamesPlayed: number;
  totalScore: number;

  // Puzzles mode
  puzzlesLevelSelect: boolean;
  currentPuzzleLevel: number | null;
  currentPuzzleIndex: number;
  completedLevels: number[];
  levelScores: Record<number, number[]>;

  // Constants (hero/item lookup)
  heroes: Record<number, HeroConstant> | null;
  items: Record<number, ItemConstant> | null;
  constantsLoaded: boolean;

  // Actions
  loadConstants: () => Promise<void>;
  startGame: (mode: GameMode) => Promise<void>;
  submitGuess: (guess: string) => Promise<void>;
  resetGame: () => void;
  // Puzzles mode actions
  startPuzzlesMode: () => void;
  selectLevel: (level: number) => Promise<void>;
  advanceToNextPuzzle: () => Promise<void>;
  returnToLevelSelect: () => void;
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

      // Puzzles mode
      puzzlesLevelSelect: false,
      currentPuzzleLevel: null,
      currentPuzzleIndex: 0,
      completedLevels: [],
      levelScores: {},

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

      // ── Start a game (daily only — puzzles uses startPuzzlesMode) ──
      startGame: async (mode: GameMode) => {
        if (mode === "puzzles") {
          get().startPuzzlesMode();
          return;
        }

        const state = get();

        // If daily and already completed today, re-fetch puzzle and restore results
        if (mode === "daily" && state.dailyDate === todayUTC() && state.dailyCompleted) {
          set({ loading: true, error: null });
          try {
            const res = await fetch("/api/puzzle/daily");
            if (!res.ok) throw new Error("Failed to fetch puzzle");
            const puzzle: PuzzlePublic = await res.json();
            set({
              mode: "daily",
              puzzle,
              completed: true,
              results: state.dailyResults,
              score: state.dailyScore ?? 0,
              currentLevel: 1,
              loading: false,
              error: null,
            });
          } catch {
            set({ loading: false, error: "Failed to load daily puzzle." });
          }
          return;
        }

        set({ loading: true, error: null });

        try {
          const res = await fetch("/api/puzzle/daily");
          if (!res.ok) throw new Error("Failed to fetch puzzle");
          const puzzle: PuzzlePublic = await res.json();

          // If daily and we have an in-progress game for today, restore
          if (
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
            mode: "daily",
            puzzle,
            currentLevel: 1,
            results: [],
            completed: false,
            score: 0,
            loading: false,
            error: null,
            dailyDate: todayUTC(),
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
              : "/api/puzzle/level";

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

            // Only track stats for daily mode
            const statsUpdate =
              mode === "daily"
                ? {
                    gamesPlayed: state.gamesPlayed + 1,
                    totalScore: state.totalScore + newScore,
                    streak: newScore === 3 ? state.streak + 1 : 0,
                  }
                : {};

            // Puzzles mode: record score for this puzzle in the level
            let puzzlesUpdate = {};
            if (mode === "puzzles" && state.currentPuzzleLevel !== null) {
              const lvl = state.currentPuzzleLevel;
              const newLevelScores = { ...state.levelScores };
              const existing = newLevelScores[lvl] || [];
              newLevelScores[lvl] = [...existing, newScore];

              // Check if level is now complete (all puzzles done)
              const isLevelDone =
                state.currentPuzzleIndex >= PUZZLES_PER_LEVEL - 1;
              const newCompleted = isLevelDone
                ? [...new Set([...state.completedLevels, lvl])]
                : state.completedLevels;

              puzzlesUpdate = {
                levelScores: newLevelScores,
                completedLevels: newCompleted,
              };
            }

            set({
              results: newResults,
              score: newScore,
              completed: true,
              loading: false,
              ...statsUpdate,
              ...puzzlesUpdate,
              ...(mode === "daily"
                ? {
                    dailyCompleted: true,
                    dailyScore: newScore,
                    dailyResults: newResults,
                  }
                : {}),
            });
          } else {
            // Advance to next guess level
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

      // ── Reset for main menu ──
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
          puzzlesLevelSelect: false,
          currentPuzzleLevel: null,
          currentPuzzleIndex: 0,
        });
      },

      // ── Puzzles mode: show level select ──
      startPuzzlesMode: () => {
        set({
          mode: "puzzles",
          puzzle: null,
          puzzlesLevelSelect: true,
          currentPuzzleLevel: null,
          currentPuzzleIndex: 0,
          currentLevel: 1,
          results: [],
          completed: false,
          score: 0,
          loading: false,
          error: null,
        });
      },

      // ── Puzzles mode: start playing a level ──
      selectLevel: async (level: number) => {
        set({ loading: true, error: null });

        try {
          const res = await fetch(
            `/api/puzzle/level?level=${level}&index=0`,
          );
          if (!res.ok) throw new Error("Failed to fetch puzzle");
          const puzzle: PuzzlePublic = await res.json();

          set({
            mode: "puzzles",
            puzzle,
            puzzlesLevelSelect: false,
            currentPuzzleLevel: level,
            currentPuzzleIndex: 0,
            currentLevel: 1,
            results: [],
            completed: false,
            score: 0,
            loading: false,
            error: null,
          });
        } catch (err) {
          console.error("Error selecting level:", err);
          set({
            loading: false,
            error: "Failed to load puzzle. Try again.",
          });
        }
      },

      // ── Puzzles mode: advance to next puzzle in level ──
      advanceToNextPuzzle: async () => {
        const state = get();
        if (state.currentPuzzleLevel === null) return;

        const nextIndex = state.currentPuzzleIndex + 1;
        if (nextIndex >= PUZZLES_PER_LEVEL) {
          // Level complete — return to level select
          get().returnToLevelSelect();
          return;
        }

        set({ loading: true, error: null });

        try {
          const res = await fetch(
            `/api/puzzle/level?level=${state.currentPuzzleLevel}&index=${nextIndex}`,
          );
          if (!res.ok) throw new Error("Failed to fetch puzzle");
          const puzzle: PuzzlePublic = await res.json();

          set({
            puzzle,
            currentPuzzleIndex: nextIndex,
            currentLevel: 1,
            results: [],
            completed: false,
            score: 0,
            loading: false,
            error: null,
          });
        } catch (err) {
          console.error("Error advancing puzzle:", err);
          set({
            loading: false,
            error: "Failed to load next puzzle. Try again.",
          });
        }
      },

      // ── Puzzles mode: return to level select ──
      returnToLevelSelect: () => {
        set({
          puzzle: null,
          puzzlesLevelSelect: true,
          currentPuzzleLevel: null,
          currentPuzzleIndex: 0,
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
        // Puzzles mode progress
        completedLevels: state.completedLevels,
        levelScores: state.levelScores,
      }),
    },
  ),
);
