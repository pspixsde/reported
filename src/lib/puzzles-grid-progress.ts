import type { GuessLevel, LevelResult } from "./game-types";

/** Grid completion / in-progress fields cleared when the main pool generation changes. */
export interface PuzzlesGridProgressState {
  completedPuzzles: number[];
  puzzleScores: Record<number, number>;
  puzzleResults: Record<number, LevelResult[]>;
  puzzlesInProgressIndex: number | null;
  puzzlesInProgressLevel: GuessLevel;
  puzzlesInProgressResults: LevelResult[];
  completedHardPuzzles: number[];
  hardPuzzleScores: Record<number, number>;
  hardPuzzleResults: Record<number, LevelResult[]>;
  hardPuzzlesInProgressIndex: number | null;
  hardPuzzlesInProgressLevel: GuessLevel;
  hardPuzzlesInProgressResults: LevelResult[];
}

export function emptyPuzzlesGridProgress(): PuzzlesGridProgressState {
  return {
    completedPuzzles: [],
    puzzleScores: {},
    puzzleResults: {},
    puzzlesInProgressIndex: null,
    puzzlesInProgressLevel: 1,
    puzzlesInProgressResults: [],
    completedHardPuzzles: [],
    hardPuzzleScores: {},
    hardPuzzleResults: {},
    hardPuzzlesInProgressIndex: null,
    hardPuzzlesInProgressLevel: 1,
    hardPuzzlesInProgressResults: [],
  };
}
