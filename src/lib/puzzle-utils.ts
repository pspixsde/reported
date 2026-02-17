import type { Puzzle, PuzzlePublic } from "./game-types";
import {
  PUZZLES_TOTAL,
  DAILY_POOL_SIZE,
  DAILY_POOL_START,
  REGULAR_POOL_START,
  HARD_POOL_START,
} from "./game-types";

/**
 * Simple string hash (djb2) — deterministic across runs.
 * Used to pick the daily puzzle from the pool.
 */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // unsigned 32-bit
}

/** Get today's date as YYYY-MM-DD (UTC) */
export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Pick today's daily puzzle index deterministically.
 * Cycles sequentially through the daily pool (indices 40-49).
 */
export function dailyPuzzleIndex(): number {
  const today = todayUTC();
  const epochMs = new Date("2026-02-17").getTime(); // v0.5.0 launch date
  const todayMs = new Date(today).getTime();
  const dayOffset = Math.floor((todayMs - epochMs) / 86400000);
  return DAILY_POOL_START + (((dayOffset % DAILY_POOL_SIZE) + DAILY_POOL_SIZE) % DAILY_POOL_SIZE);
}

/**
 * Return the puzzle-pool indices for Puzzles mode.
 * Regular mode: indices 0-19, Hard mode: indices 20-39.
 */
export function getPuzzleAssignments(hard: boolean): number[] {
  const start = hard ? HARD_POOL_START : REGULAR_POOL_START;
  return Array.from({ length: PUZZLES_TOTAL }, (_, i) => start + i);
}

/**
 * Create a seeded RNG function from a string seed.
 */
function seededRng(seedStr: string): () => number {
  let rng = djb2Hash(seedStr);
  return () => {
    rng = (rng * 1664525 + 1013904223) >>> 0;
    return rng / 0x100000000;
  };
}

/**
 * Generate 4 deterministic literal KDA options (1 real + 3 fake).
 * Format: "K/D/A" e.g. "5/1/5". Uses puzzle ID as seed.
 */
function generateKdaOptions(puzzle: Puzzle): string[] {
  const real = `${puzzle.kills}/${puzzle.deaths}/${puzzle.assists}`;
  const nextRng = seededRng(`kda-options-${puzzle.id}`);

  const fakes: string[] = [];
  const seen = new Set<string>([real]);

  while (fakes.length < 3) {
    // Vary each component by ±1..5, clamped to >= 0
    const k = Math.max(0, puzzle.kills + Math.floor(nextRng() * 9) - 4);
    const d = Math.max(0, puzzle.deaths + Math.floor(nextRng() * 9) - 4);
    const a = Math.max(0, puzzle.assists + Math.floor(nextRng() * 9) - 4);
    const fake = `${k}/${d}/${a}`;
    if (!seen.has(fake)) {
      fakes.push(fake);
      seen.add(fake);
    }
  }

  // Combine and shuffle deterministically
  const options = [real, ...fakes];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(nextRng() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options;
}

/**
 * Generate 4 deterministic hero ID options (1 real + 3 fake) for hard mode.
 * Uses puzzle ID as seed. Requires a list of all valid hero IDs.
 */
export function generateHeroOptions(puzzle: Puzzle, allHeroIds: number[]): number[] {
  const real = puzzle.heroId;
  const nextRng = seededRng(`hero-options-${puzzle.id}`);

  const fakes: number[] = [];
  const candidates = allHeroIds.filter((id) => id !== real);

  while (fakes.length < 3 && candidates.length > 0) {
    const idx = Math.floor(nextRng() * candidates.length);
    fakes.push(candidates.splice(idx, 1)[0]);
  }

  // Combine and shuffle
  const options = [real, ...fakes];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(nextRng() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options;
}

/** Strip answers from a puzzle before sending to the client.
 *  Pass heroOptionIds for hard-mode puzzles to include hero guess options. */
export function stripAnswers(puzzle: Puzzle, heroOptionIds?: number[]): PuzzlePublic {
  const result: PuzzlePublic = {
    id: puzzle.id,
    hero: puzzle.hero,
    heroId: puzzle.heroId,
    items: puzzle.items,
    netWorth: puzzle.netWorth,
    lastHits: puzzle.lastHits,
    denies: puzzle.denies,
    duration: puzzle.duration,
    patch: puzzle.patch,
    kdaOptions: generateKdaOptions(puzzle),
  };
  if (heroOptionIds) {
    result.heroOptions = heroOptionIds;
  }
  return result;
}

/** Format seconds into "MM:SS" display */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Format net worth as compact string, e.g. "12.3k" */
export function formatNetWorth(gold: number): string {
  if (gold >= 1000) {
    return `${(gold / 1000).toFixed(1)}k`;
  }
  return String(gold);
}
