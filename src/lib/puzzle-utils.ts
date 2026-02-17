import type { Puzzle, PuzzlePublic } from "./game-types";
import { KDA_BUCKETS, PUZZLES_TOTAL } from "./game-types";

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
 * Same date always returns same index.
 */
export function dailyPuzzleIndex(puzzleCount: number): number {
  const date = todayUTC();
  const hash = djb2Hash(`reported-daily-${date}`);
  return hash % puzzleCount;
}

/**
 * Deterministically pick puzzle indices for Puzzles mode.
 * Returns a flat array of PUZZLES_TOTAL (20) puzzle-pool indices.
 * Uses a fixed seed so every player gets the same puzzles in the same order.
 * Excludes today's daily puzzle.
 */
export function getPuzzleAssignments(puzzleCount: number): number[] {
  if (puzzleCount < PUZZLES_TOTAL + 1) {
    throw new Error(
      `Need at least ${PUZZLES_TOTAL + 1} puzzles, got ${puzzleCount}`,
    );
  }

  const dailyIdx = dailyPuzzleIndex(puzzleCount);

  // Build a pool of all indices except the daily
  const pool: number[] = [];
  for (let i = 0; i < puzzleCount; i++) {
    if (i !== dailyIdx) pool.push(i);
  }

  // Deterministic shuffle using a fixed seed (Fisher-Yates with seeded RNG)
  const seed = djb2Hash("reported-puzzles-levels-v1");
  let rng = seed;
  function nextRng(): number {
    rng = (rng * 1664525 + 1013904223) >>> 0;
    return rng / 0x100000000; // 0..1
  }

  // Shuffle pool deterministically
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(nextRng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, PUZZLES_TOTAL);
}

/**
 * Generate 4 deterministic KDA options (1 real + 3 fake) for a puzzle.
 * Uses puzzle ID as seed so options are stable across requests.
 */
function generateKdaOptions(puzzle: Puzzle): string[] {
  const real = puzzle.kdaBucket;
  const fakes: string[] = [];

  // Seeded RNG based on puzzle ID
  let rng = djb2Hash(`kda-options-${puzzle.id}`);
  function nextRng(): number {
    rng = (rng * 1664525 + 1013904223) >>> 0;
    return rng / 0x100000000;
  }

  // Pick 3 unique fake buckets
  const candidates = KDA_BUCKETS.filter((b) => b !== real);
  while (fakes.length < 3 && candidates.length > 0) {
    const idx = Math.floor(nextRng() * candidates.length);
    fakes.push(candidates.splice(idx, 1)[0]);
  }

  // Combine and shuffle deterministically
  const options = [real, ...fakes];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(nextRng() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options;
}

/** Strip answers from a puzzle before sending to the client */
export function stripAnswers(puzzle: Puzzle): PuzzlePublic {
  return {
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
}

/** Format seconds into "MM:SS" display */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Classify K/D/A into a KDA bucket string */
export function classifyKda(
  kills: number,
  deaths: number,
  assists: number,
): string {
  const k = bucketValue(kills, [0, 4, 8, 13]);
  const d = bucketValue(deaths, [0, 4, 8]);
  const a = bucketValue(assists, [0, 5, 10, 15]);
  return `${k} / ${d} / ${a}`;
}

function bucketValue(val: number, thresholds: number[]): string {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (val >= thresholds[i]) {
      if (i === thresholds.length - 1) {
        return `${thresholds[i]}+`;
      }
      return `${thresholds[i]}-${thresholds[i + 1] - 1}`;
    }
  }
  return `0-${thresholds[1] ? thresholds[1] - 1 : 0}`;
}

/** Format net worth as compact string, e.g. "12.3k" */
export function formatNetWorth(gold: number): string {
  if (gold >= 1000) {
    return `${(gold / 1000).toFixed(1)}k`;
  }
  return String(gold);
}
