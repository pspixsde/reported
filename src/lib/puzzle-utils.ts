import type { Puzzle, PuzzlePublic } from "./game-types";

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
 * Pick a random puzzle index, excluding the daily.
 */
export function randomPuzzleIndex(
  puzzleCount: number,
  excludeIndex: number,
): number {
  if (puzzleCount <= 1) return 0;
  let idx: number;
  do {
    idx = Math.floor(Math.random() * puzzleCount);
  } while (idx === excludeIndex);
  return idx;
}

/** Strip answers from a puzzle before sending to the client */
export function stripAnswers(puzzle: Puzzle): PuzzlePublic {
  return {
    id: puzzle.id,
    hero: puzzle.hero,
    heroId: puzzle.heroId,
    items: puzzle.items,
    role: puzzle.role,
    lane: puzzle.lane,
    duration: puzzle.duration,
    patch: puzzle.patch,
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

/** Map OpenDota lane_role number to display string */
export function laneRoleName(laneRole: number): string {
  switch (laneRole) {
    case 1:
      return "Safe Lane";
    case 2:
      return "Mid Lane";
    case 3:
      return "Off Lane";
    case 4:
      return "Jungle";
    default:
      return "Roaming";
  }
}

/**
 * Infer position label from lane + hero meta expectations.
 * Simplified: uses lane_role + player_slot ordering.
 */
export function inferRole(
  laneRole: number,
  isSupport: boolean,
): string {
  if (isSupport) {
    if (laneRole === 1) return "Hard Support (Pos 5)";
    if (laneRole === 3) return "Soft Support (Pos 4)";
    return "Support";
  }
  switch (laneRole) {
    case 1:
      return "Carry (Pos 1)";
    case 2:
      return "Mid (Pos 2)";
    case 3:
      return "Offlane (Pos 3)";
    default:
      return "Core";
  }
}
