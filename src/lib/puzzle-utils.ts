import type { BuildClashPuzzle, BuildClashPublic, Puzzle, PuzzlePublic } from "./game-types";
import {
  PUZZLES_TOTAL,
  DAILY_POOL_SIZE,
  CLASH_POOL_SIZE,
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
 * Cycles sequentially through the daily pool (indices 40-69).
 */
export function dailyPuzzleIndex(): number {
  const today = todayUTC();
  const epochMs = new Date("2026-02-17").getTime(); // v0.5.0 launch date
  const todayMs = new Date(today).getTime();
  const dayOffset = Math.floor((todayMs - epochMs) / 86400000);
  return DAILY_POOL_START + (((dayOffset % DAILY_POOL_SIZE) + DAILY_POOL_SIZE) % DAILY_POOL_SIZE);
}

/**
 * Pick today's Build Clash index deterministically.
 * Cycles sequentially through the clash pool (indices 0-29).
 */
export function clashDailyIndex(): number {
  const today = todayUTC();
  const epochMs = new Date("2026-02-17").getTime();
  const todayMs = new Date(today).getTime();
  const dayOffset = Math.floor((todayMs - epochMs) / 86400000);
  return ((dayOffset % CLASH_POOL_SIZE) + CLASH_POOL_SIZE) % CLASH_POOL_SIZE;
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

  function totalDiff(k: number, d: number, a: number, rk: number, rd: number, ra: number): number {
    return Math.abs(k - rk) + Math.abs(d - rd) + Math.abs(a - ra);
  }

  function isOutlierEliminationExploit(options: string[]): boolean {
    const tuples = options.map((opt) => opt.split("/").map(Number) as [number, number, number]);
    const realIdx = options.indexOf(real);
    if (realIdx === -1) return false;

    const survivors = tuples
      .map((tuple, idx) => {
        for (let c = 0; c < 3; c++) {
          const values = tuples.map((t) => t[c]);
          const min = Math.min(...values);
          const max = Math.max(...values);
          if (tuple[c] === min || tuple[c] === max) return null;
        }
        return idx;
      })
      .filter((idx): idx is number => idx !== null);

    return survivors.length === 1 && survivors[0] === realIdx;
  }

  function genFakeKda(): [number, number, number] {
    const pattern = Math.floor(nextRng() * 5);
    const vary = (base: number, spread: number) =>
      Math.max(0, base + Math.floor(nextRng() * (spread * 2 + 1)) - spread);

    switch (pattern) {
      case 0:
        return [vary(puzzle.kills, 7), vary(puzzle.deaths, 7), vary(puzzle.assists, 7)];
      case 1:
        return [puzzle.kills, vary(puzzle.deaths, 6), vary(puzzle.assists, 6)];
      case 2:
        return [vary(puzzle.kills, 6), puzzle.deaths, vary(puzzle.assists, 6)];
      case 3:
        return [vary(puzzle.kills, 6), vary(puzzle.deaths, 6), puzzle.assists];
      default:
        return [vary(puzzle.kills, 4), vary(puzzle.deaths, 4), vary(puzzle.assists, 4)];
    }
  }

  for (let batch = 0; batch < 160; batch++) {
    const fakes: string[] = [];
    const seen = new Set<string>([real]);

    for (let attempt = 0; attempt < 240 && fakes.length < 3; attempt++) {
      const [k, d, a] = genFakeKda();
      const fake = `${k}/${d}/${a}`;

      if (seen.has(fake)) continue;
      if (totalDiff(k, d, a, puzzle.kills, puzzle.deaths, puzzle.assists) < 3) continue;

      const tooClose = fakes.some((f) => {
        const [fk, fd, fa] = f.split("/").map(Number);
        return totalDiff(k, d, a, fk, fd, fa) < 2;
      });
      if (tooClose) continue;

      fakes.push(fake);
      seen.add(fake);
    }

    if (fakes.length < 3) continue;

    const sharesRealComponent = fakes.some((f) => {
      const [fk, fd, fa] = f.split("/").map(Number);
      return fk === puzzle.kills || fd === puzzle.deaths || fa === puzzle.assists;
    });
    if (!sharesRealComponent) continue;

    // Combine and shuffle deterministically
    const options = [real, ...fakes];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(nextRng() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    if (!isOutlierEliminationExploit(options)) {
      return options;
    }
  }

  // Safe deterministic fallback if generation constraints fail.
  return [
    real,
    `${Math.max(0, puzzle.kills + 2)}/${Math.max(0, puzzle.deaths + 1)}/${Math.max(0, puzzle.assists - 2)}`,
    `${Math.max(0, puzzle.kills - 2)}/${Math.max(0, puzzle.deaths + 3)}/${Math.max(0, puzzle.assists + 1)}`,
    `${Math.max(0, puzzle.kills + 1)}/${Math.max(0, puzzle.deaths - 2)}/${Math.max(0, puzzle.assists + 2)}`,
  ];
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
    aghsScepter: puzzle.aghsScepter ?? false,
    aghsShard: puzzle.aghsShard ?? false,
    kdaOptions: generateKdaOptions(puzzle),
  };
  if (heroOptionIds) {
    result.heroOptions = heroOptionIds;
  }
  return result;
}

/** Strip answers from a Build Clash puzzle before sending to the client. */
export function stripClashAnswers(puzzle: BuildClashPuzzle): BuildClashPublic {
  const { win: _wa, rankBracket: _ra, kills: _ka, deaths: _da, assists: _aa, ...buildA } = puzzle.buildA;
  const { win: _wb, rankBracket: _rb, kills: _kb, deaths: _db, assists: _ab, ...buildB } = puzzle.buildB;
  const rankOptions: [BuildClashPuzzle["buildA"]["rankBracket"], BuildClashPuzzle["buildB"]["rankBracket"]] =
    puzzle.id.length % 2 === 0
      ? [puzzle.buildA.rankBracket, puzzle.buildB.rankBracket]
      : [puzzle.buildB.rankBracket, puzzle.buildA.rankBracket];
  return {
    id: puzzle.id,
    buildA,
    buildB,
    rankOptions,
  };
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
