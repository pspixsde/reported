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
  completedPuzzles: number[];             // indices 0-19
  puzzleScores: Record<number, number>;   // index -> score
  puzzleResults: Record<number, LevelResult[]>; // index -> results (for revisiting)
  // Puzzles in-progress persistence
  puzzlesInProgressIndex: number | null;
  puzzlesInProgressLevel: GuessLevel;
  puzzlesInProgressResults: LevelResult[];

  // Hard mode (puzzles only)
  puzzlesHardMode: boolean;
  completedHardPuzzles: number[];
  hardPuzzleScores: Record<number, number>;
  hardPuzzleResults: Record<number, LevelResult[]>;
  hardPuzzlesInProgressIndex: number | null;
  hardPuzzlesInProgressLevel: GuessLevel;
  hardPuzzlesInProgressResults: LevelResult[];

  // Puzzles mode stats (regular)
  puzzlesGamesPlayed: number;
  puzzlesTotalScore: number;
  // Puzzles mode stats (hard)
  hardPuzzlesGamesPlayed: number;
  hardPuzzlesTotalScore: number;

  // Survey tracking
  surveyedPuzzleIds: string[];

  // Global stats for current puzzle
  puzzleGlobalStats: PuzzleGlobalStats | null;

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
  togglePuzzlesHardMode: () => void;
  navigateToPuzzle: (index: number) => Promise<void>;
  // Survey actions
  markSurveyed: (puzzleId: string) => void;
  // Global stats actions
  fetchPuzzleStats: (puzzleId: string, daily?: boolean) => Promise<void>;

  // Computed helpers
  maxScore: () => number;
  isHardModeActive: () => boolean;
}

export interface PuzzleGlobalStats {
  levels: Record<string, { correct: number; total: number }>;
  totalScore: number;
  completions: number;
  survey: { yes: number; no: number };
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
      puzzleResults: {},
      puzzlesInProgressIndex: null,
      puzzlesInProgressLevel: 1,
      puzzlesInProgressResults: [],

      // Hard mode
      puzzlesHardMode: false,
      completedHardPuzzles: [],
      hardPuzzleScores: {},
      hardPuzzleResults: {},
      hardPuzzlesInProgressIndex: null,
      hardPuzzlesInProgressLevel: 1,
      hardPuzzlesInProgressResults: [],

      // Puzzles stats
      puzzlesGamesPlayed: 0,
      puzzlesTotalScore: 0,
      hardPuzzlesGamesPlayed: 0,
      hardPuzzlesTotalScore: 0,

      // Survey tracking
      surveyedPuzzleIds: [],

      // Global stats
      puzzleGlobalStats: null,

      heroes: null,
      items: null,
      constantsLoaded: false,

      // ── Computed helpers ──
      maxScore: () => get().puzzlesHardMode && get().mode === "puzzles" ? 4 : 3,
      isHardModeActive: () => get().puzzlesHardMode && get().mode === "puzzles",

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
            get().fetchPuzzleStats(puzzle.id, true);
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
            get().fetchPuzzleStats(puzzle.id, true);
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
            dailyCompleted: false,
            dailyScore: null,
            dailyCurrentLevel: 1,
            dailyResults: [],
          });
          get().fetchPuzzleStats(puzzle.id, true);
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

        const state = get();
        const hard = state.puzzlesHardMode && mode === "puzzles";
        const maxLvl = hard ? 4 : 3;

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
              runningScore: get().score,
              ...(hard ? { hard: true } : {}),
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

          if (currentLevel >= maxLvl) {
            // Game complete
            const st = get();

            // Only track stats for daily mode
            const statsUpdate =
              mode === "daily"
                ? {
                    gamesPlayed: st.gamesPlayed + 1,
                    totalScore: st.totalScore + newScore,
                    streak: newScore === maxLvl ? st.streak + 1 : 0,
                  }
                : {};

            // Puzzles mode: record score for this puzzle
            let puzzlesUpdate = {};
            if (mode === "puzzles" && st.currentPuzzleIndex !== null) {
              const idx = st.currentPuzzleIndex;
              if (hard) {
                puzzlesUpdate = {
                  completedHardPuzzles: [...new Set([...st.completedHardPuzzles, idx])],
                  hardPuzzleScores: { ...st.hardPuzzleScores, [idx]: newScore },
                  hardPuzzleResults: { ...st.hardPuzzleResults, [idx]: newResults },
                  hardPuzzlesInProgressIndex: null,
                  hardPuzzlesInProgressLevel: 1 as GuessLevel,
                  hardPuzzlesInProgressResults: [],
                  hardPuzzlesGamesPlayed: st.hardPuzzlesGamesPlayed + 1,
                  hardPuzzlesTotalScore: st.hardPuzzlesTotalScore + newScore,
                };
              } else {
                puzzlesUpdate = {
                  completedPuzzles: [...new Set([...st.completedPuzzles, idx])],
                  puzzleScores: { ...st.puzzleScores, [idx]: newScore },
                  puzzleResults: { ...st.puzzleResults, [idx]: newResults },
                  puzzlesInProgressIndex: null,
                  puzzlesInProgressLevel: 1 as GuessLevel,
                  puzzlesInProgressResults: [],
                  puzzlesGamesPlayed: st.puzzlesGamesPlayed + 1,
                  puzzlesTotalScore: st.puzzlesTotalScore + newScore,
                };
              }
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
              ...(mode === "puzzles" && !hard
                ? {
                    puzzlesInProgressIndex: get().currentPuzzleIndex,
                    puzzlesInProgressLevel: nextLevel,
                    puzzlesInProgressResults: newResults,
                  }
                : {}),
              ...(mode === "puzzles" && hard
                ? {
                    hardPuzzlesInProgressIndex: get().currentPuzzleIndex,
                    hardPuzzlesInProgressLevel: nextLevel,
                    hardPuzzlesInProgressResults: newResults,
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
          puzzleGlobalStats: null,
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

      // ── Toggle hard mode for puzzles ──
      togglePuzzlesHardMode: () => {
        set((state) => ({ puzzlesHardMode: !state.puzzlesHardMode }));
      },

      // ── Puzzles mode: start playing a specific puzzle ──
      selectPuzzle: async (index: number) => {
        const state = get();
        const hard = state.puzzlesHardMode;
        const completedList = hard ? state.completedHardPuzzles : state.completedPuzzles;
        const scoresMap = hard ? state.hardPuzzleScores : state.puzzleScores;
        const resultsMap = hard ? state.hardPuzzleResults : state.puzzleResults;

        // If puzzle is completed, open it in read-only view
        if (completedList.includes(index)) {
          set({ loading: true, error: null });
          try {
            const res = await fetch(`/api/puzzle/level?index=${index}&hard=${hard}`);
            if (!res.ok) throw new Error("Failed to fetch puzzle");
            const puzzle: PuzzlePublic = await res.json();
            set({
              mode: "puzzles",
              puzzle,
              puzzlesGridVisible: false,
              currentPuzzleIndex: index,
              completed: true,
              score: scoresMap[index] ?? 0,
              results: resultsMap[index] ?? [],
              currentLevel: 1,
              loading: false,
              error: null,
            });
            get().fetchPuzzleStats(puzzle.id);
          } catch (err) {
            console.error("Error loading completed puzzle:", err);
            set({ loading: false, error: "Failed to load puzzle." });
          }
          return;
        }

        set({ loading: true, error: null });

        try {
          const res = await fetch(`/api/puzzle/level?index=${index}&hard=${hard}`);
          if (!res.ok) throw new Error("Failed to fetch puzzle");
          const puzzle: PuzzlePublic = await res.json();

          // Check if we have in-progress state for this puzzle
          const inProgressIdx = hard
            ? state.hardPuzzlesInProgressIndex
            : state.puzzlesInProgressIndex;
          const inProgressLevel = hard
            ? state.hardPuzzlesInProgressLevel
            : state.puzzlesInProgressLevel;
          const inProgressResults = hard
            ? state.hardPuzzlesInProgressResults
            : state.puzzlesInProgressResults;

          if (inProgressIdx === index && inProgressLevel > 1) {
            set({
              mode: "puzzles",
              puzzle,
              puzzlesGridVisible: false,
              currentPuzzleIndex: index,
              currentLevel: inProgressLevel,
              results: inProgressResults,
              score: inProgressResults.filter((r) => r.correct).length,
              completed: false,
              loading: false,
              error: null,
            });
            get().fetchPuzzleStats(puzzle.id);
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
            });
            get().fetchPuzzleStats(puzzle.id);
          }
        } catch (err) {
          console.error("Error selecting puzzle:", err);
          set({
            loading: false,
            error: "Failed to load puzzle. Try again.",
          });
        }
      },

      // ── Navigate to another puzzle by index (for arrows) ──
      navigateToPuzzle: async (index: number) => {
        if (index < 0 || index >= PUZZLES_TOTAL) return;
        // Reset current game state, then select the new puzzle
        set({
          puzzle: null,
          currentLevel: 1,
          results: [],
          completed: false,
          score: 0,
        });
        await get().selectPuzzle(index);
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

      fetchPuzzleStats: async (puzzleId: string, daily?: boolean) => {
        try {
          const params = new URLSearchParams({ puzzleId });
          if (daily) params.set("date", todayUTC());
          const res = await fetch(`/api/stats/puzzle?${params}`);
          if (!res.ok) return;
          const stats = await res.json();
          set({ puzzleGlobalStats: stats });
        } catch {
          // Non-blocking — don't show errors for stats
        }
      },
    }),
    {
      name: "reported-game-v8",
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
        puzzleResults: state.puzzleResults,
        puzzlesInProgressIndex: state.puzzlesInProgressIndex,
        puzzlesInProgressLevel: state.puzzlesInProgressLevel,
        puzzlesInProgressResults: state.puzzlesInProgressResults,
        // Hard mode
        puzzlesHardMode: state.puzzlesHardMode,
        completedHardPuzzles: state.completedHardPuzzles,
        hardPuzzleScores: state.hardPuzzleScores,
        hardPuzzleResults: state.hardPuzzleResults,
        hardPuzzlesInProgressIndex: state.hardPuzzlesInProgressIndex,
        hardPuzzlesInProgressLevel: state.hardPuzzlesInProgressLevel,
        hardPuzzlesInProgressResults: state.hardPuzzlesInProgressResults,
        // Puzzles stats
        puzzlesGamesPlayed: state.puzzlesGamesPlayed,
        puzzlesTotalScore: state.puzzlesTotalScore,
        hardPuzzlesGamesPlayed: state.hardPuzzlesGamesPlayed,
        hardPuzzlesTotalScore: state.hardPuzzlesTotalScore,
        // Survey tracking
        surveyedPuzzleIds: state.surveyedPuzzleIds,
      }),
    },
  ),
);
