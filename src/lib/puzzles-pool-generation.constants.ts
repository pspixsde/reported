/** Client-safe constants for main puzzle pool generation (no Node built-ins). */

export const KV_PUZZLES_GENERATION_KEY = "puzzles:generation";

/** Used when no generation has been written yet (pre-migration / fresh clone). */
export const LEGACY_PUZZLES_GENERATION = "legacy";

export function newPuzzlesPoolGeneration(): string {
  return new Date().toISOString();
}
