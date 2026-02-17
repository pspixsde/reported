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
import { PUZZLES_TOTAL } from "@/lib/game-types";

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
  // Daily in-progress persistence
  dailyCurrentLevel: GuessLevel;
  dailyPuzzleId: string | null;

  // Daily-only stats
  streak: number;
  gamesPlayed: number;
  totalScore: number;

  // Puzzles mode (flat grid of 20)
  puzzlesGridVisible: boolean;
  currentPuzzleIndex: number | null;
  completedPuzzles: number[];        // indices 0-19
  puzzleScores: Record<number, number>; // index -> score
  // Puzzles in-progress persistence
  puzzlesInProgressIndex: number | null;
  puzzlesInProgressLevel: GuessLevel;
  puzzlesInProgressResults: LevelResult[];

  // Survey tracking
  surveyedPuzzleIds: string[];

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
  selectPuzzle: (index: number) => Promise<void>;
  returnToPuzzleGrid: () => void;
  // Survey actions
  markSurveyed: (puzzleId: string) => void;
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
      dailyCurrentLevel: 1,
      dailyPuzzleId: null,

      streak: 0,
      gamesPlayed: 0,
      totalScore: 0,

      // Puzzles mode (flat grid)
      puzzlesGridVisible: false,
      currentPuzzleIndex: null,
      completedPuzzles: [],
      puzzleScores: {},
      puzzlesInProgressIndex: null,
      puzzlesInProgressLevel: 1,
      puzzlesInProgressResults: [],

      // Survey tracking
      surveyedPuzzleIds: [],

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

          // If daily and we have an in-progress game for today, restore from persisted state
          if (
            state.dailyDate === todayUTC() &&
            !state.dailyCompleted &&
            state.dailyPuzzleId === puzzle.id &&
            state.dailyCurrentLevel > 1
          ) {
            set({
              mode: "daily",
              puzzle,
              currentLevel: state.dailyCurrentLevel,
              results: state.dailyResults,
              score: state.dailyResults.filter((r) => r.correct).length,
              completed: false,
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
            dailyPuzzleId: puzzle.id,
            dailyCurrentLevel: 1,
            dailyResults: [],
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

            // Puzzles mode: record score for this puzzle
            let puzzlesUpdate = {};
            if (mode === "puzzles" && state.currentPuzzleIndex !== null) {
              const idx = state.currentPuzzleIndex;
              puzzlesUpdate = {
                completedPuzzles: [...new Set([...state.completedPuzzles, idx])],
                puzzleScores: { ...state.puzzleScores, [idx]: newScore },
                puzzlesInProgressIndex: null,
                puzzlesInProgressLevel: 1 as GuessLevel,
                puzzlesInProgressResults: [],
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
                    dailyCurrentLevel: 1 as GuessLevel,
                  }
                : {}),
            });
          } else {
            // Advance to next guess level
            const nextLevel = (currentLevel + 1) as GuessLevel;
            set({
              results: newResults,
              score: newScore,
              currentLevel: nextLevel,
              loading: false,
              ...(mode === "daily"
                ? {
                    dailyResults: newResults,
                    dailyCurrentLevel: nextLevel,
                  }
                : {}),
              ...(mode === "puzzles"
                ? {
                    puzzlesInProgressLevel: nextLevel,
                    puzzlesInProgressResults: newResults,
                  }
                : {}),
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
          puzzlesGridVisible: false,
          currentPuzzleIndex: null,
        });
      },

      // ── Puzzles mode: show puzzle grid ──
      startPuzzlesMode: () => {
        set({
          mode: "puzzles",
          puzzle: null,
          puzzlesGridVisible: true,
          currentPuzzleIndex: null,
          currentLevel: 1,
          results: [],
          completed: false,
          score: 0,
          loading: false,
          error: null,
        });
      },

      // ── Puzzles mode: start playing a specific puzzle ──
      selectPuzzle: async (index: number) => {
        const state = get();

        // Don't allow replaying completed puzzles
        if (state.completedPuzzles.includes(index)) return;

        set({ loading: true, error: null });

        try {
          const res = await fetch(`/api/puzzle/level?index=${index}`);
          if (!res.ok) throw new Error("Failed to fetch puzzle");
          const puzzle: PuzzlePublic = await res.json();

          // Check if we have in-progress state for this puzzle
          if (
            state.puzzlesInProgressIndex === index &&
            state.puzzlesInProgressLevel > 1
          ) {
            set({
              mode: "puzzles",
              puzzle,
              puzzlesGridVisible: false,
              currentPuzzleIndex: index,
              currentLevel: state.puzzlesInProgressLevel,
              results: state.puzzlesInProgressResults,
              score: state.puzzlesInProgressResults.filter((r) => r.correct).length,
              completed: false,
              loading: false,
              error: null,
            });
          } else {
            set({
              mode: "puzzles",
              puzzle,
              puzzlesGridVisible: false,
              currentPuzzleIndex: index,
              currentLevel: 1,
              results: [],
              completed: false,
              score: 0,
              loading: false,
              error: null,
              puzzlesInProgressIndex: index,
              puzzlesInProgressLevel: 1,
              puzzlesInProgressResults: [],
            });
          }
        } catch (err) {
          console.error("Error selecting puzzle:", err);
          set({
            loading: false,
            error: "Failed to load puzzle. Try again.",
          });
        }
      },

      // ── Puzzles mode: return to puzzle grid ──
      returnToPuzzleGrid: () => {
        set({
          puzzle: null,
          puzzlesGridVisible: true,
          currentPuzzleIndex: null,
          currentLevel: 1,
          results: [],
          completed: false,
          score: 0,
          loading: false,
          error: null,
        });
      },

      // ── Mark a puzzle as surveyed ──
      markSurveyed: (puzzleId: string) => {
        const state = get();
        if (!state.surveyedPuzzleIds.includes(puzzleId)) {
          set({ surveyedPuzzleIds: [...state.surveyedPuzzleIds, puzzleId] });
        }
      },
    }),
    {
      name: "reported-game-v4",
      partialize: (state) => ({
        // Daily persistence
        dailyDate: state.dailyDate,
        dailyCompleted: state.dailyCompleted,
        dailyScore: state.dailyScore,
        dailyResults: state.dailyResults,
        dailyCurrentLevel: state.dailyCurrentLevel,
        dailyPuzzleId: state.dailyPuzzleId,
        streak: state.streak,
        gamesPlayed: state.gamesPlayed,
        totalScore: state.totalScore,
        // Puzzles mode progress
        completedPuzzles: state.completedPuzzles,
        puzzleScores: state.puzzleScores,
        puzzlesInProgressIndex: state.puzzlesInProgressIndex,
        puzzlesInProgressLevel: state.puzzlesInProgressLevel,
        puzzlesInProgressResults: state.puzzlesInProgressResults,
        // Survey tracking
        surveyedPuzzleIds: state.surveyedPuzzleIds,
      }),
    },
  ),
);
