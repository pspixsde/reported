import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const STATS_PATH = resolve(process.cwd(), "src/data/puzzle-global-stats.json");

interface LevelStat {
  correct: number;
  total: number;
}

interface DailyStats {
  levels: Record<string, LevelStat>;
  totalScore: number;
  completions: number;
}

interface PuzzleStats {
  levels: Record<string, LevelStat>;
  totalScore: number;
  completions: number;
  survey: { yes: number; no: number };
  daily?: Record<string, DailyStats>;
}

type StatsMap = Record<string, PuzzleStats>;

function loadStats(): StatsMap {
  if (!existsSync(STATS_PATH)) return {};
  try {
    return JSON.parse(readFileSync(STATS_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function saveStats(stats: StatsMap): void {
  writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2));
}

function ensurePuzzle(stats: StatsMap, puzzleId: string): PuzzleStats {
  if (!stats[puzzleId]) {
    stats[puzzleId] = {
      levels: {},
      totalScore: 0,
      completions: 0,
      survey: { yes: 0, no: 0 },
    };
  }
  return stats[puzzleId];
}

function ensureLevel(ps: PuzzleStats, level: string): LevelStat {
  if (!ps.levels[level]) {
    ps.levels[level] = { correct: 0, total: 0 };
  }
  return ps.levels[level];
}

/**
 * Record a single level guess result.
 * If `score` is provided, also record a puzzle completion.
 * If `date` is provided, also record into the daily partition.
 */
export function recordGuess(
  puzzleId: string,
  level: number,
  correct: boolean,
  score?: number,
  date?: string,
): void {
  const stats = loadStats();
  const ps = ensurePuzzle(stats, puzzleId);
  const ls = ensureLevel(ps, String(level));

  ls.total++;
  if (correct) ls.correct++;

  if (score !== undefined) {
    ps.totalScore += score;
    ps.completions++;
  }

  if (date) {
    if (!ps.daily) ps.daily = {};
    if (!ps.daily[date]) {
      ps.daily[date] = { levels: {}, totalScore: 0, completions: 0 };
    }
    const day = ps.daily[date];
    if (!day.levels[String(level)]) {
      day.levels[String(level)] = { correct: 0, total: 0 };
    }
    const dls = day.levels[String(level)];
    dls.total++;
    if (correct) dls.correct++;

    if (score !== undefined) {
      day.totalScore += score;
      day.completions++;
    }
  }

  saveStats(stats);
}

/**
 * Record a survey response and return the report percentage.
 */
export function recordSurvey(
  puzzleId: string,
  response: "yes" | "no",
): number {
  const stats = loadStats();
  const ps = ensurePuzzle(stats, puzzleId);

  if (response === "yes") ps.survey.yes++;
  else ps.survey.no++;

  saveStats(stats);

  const total = ps.survey.yes + ps.survey.no;
  return total > 0 ? Math.round((ps.survey.yes / total) * 100) : 0;
}

/**
 * Get stats for a puzzle. If `date` is provided, return daily-partitioned stats.
 */
export function getPuzzleStats(
  puzzleId: string,
  date?: string,
): {
  levels: Record<string, LevelStat>;
  totalScore: number;
  completions: number;
  survey: { yes: number; no: number };
} | null {
  const stats = loadStats();
  const ps = stats[puzzleId];
  if (!ps) return null;

  if (date && ps.daily?.[date]) {
    const day = ps.daily[date];
    return {
      levels: day.levels,
      totalScore: day.totalScore,
      completions: day.completions,
      survey: ps.survey,
    };
  }

  return {
    levels: ps.levels,
    totalScore: ps.totalScore,
    completions: ps.completions,
    survey: ps.survey,
  };
}
