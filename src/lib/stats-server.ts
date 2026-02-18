import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { getRedis } from "./redis";

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

// ── File-based fallback (local dev) ──

function loadStatsFile(): StatsMap {
  if (!existsSync(STATS_PATH)) return {};
  try {
    return JSON.parse(readFileSync(STATS_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function saveStatsFile(stats: StatsMap): void {
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

// ── KV key helpers ──

function statsKey(puzzleId: string): string {
  return `stats:${puzzleId}`;
}

// ── Default empty stats ──

function emptyStats(): PuzzleStats {
  return { levels: {}, totalScore: 0, completions: 0, survey: { yes: 0, no: 0 } };
}

// ── Public API (async, works with KV or file fallback) ──

export async function recordGuess(
  puzzleId: string,
  level: number,
  correct: boolean,
  score?: number,
  date?: string,
): Promise<void> {
  const redis = getRedis();

  if (!redis) {
    // File fallback
    const stats = loadStatsFile();
    const ps = ensurePuzzle(stats, puzzleId);
    const ls = ensureLevel(ps, String(level));
    ls.total++;
    if (correct) ls.correct++;
    if (score !== undefined) { ps.totalScore += score; ps.completions++; }
    if (date) {
      if (!ps.daily) ps.daily = {};
      if (!ps.daily[date]) ps.daily[date] = { levels: {}, totalScore: 0, completions: 0 };
      const day = ps.daily[date];
      if (!day.levels[String(level)]) day.levels[String(level)] = { correct: 0, total: 0 };
      const dls = day.levels[String(level)];
      dls.total++;
      if (correct) dls.correct++;
      if (score !== undefined) { day.totalScore += score; day.completions++; }
    }
    saveStatsFile(stats);
    return;
  }

  // KV path
  const key = statsKey(puzzleId);
  const ps: PuzzleStats = (await redis.get(key)) ?? emptyStats();

  if (!ps.levels[String(level)]) ps.levels[String(level)] = { correct: 0, total: 0 };
  const ls = ps.levels[String(level)];
  ls.total++;
  if (correct) ls.correct++;
  if (score !== undefined) { ps.totalScore += score; ps.completions++; }

  if (date) {
    if (!ps.daily) ps.daily = {};
    if (!ps.daily[date]) ps.daily[date] = { levels: {}, totalScore: 0, completions: 0 };
    const day = ps.daily[date];
    if (!day.levels[String(level)]) day.levels[String(level)] = { correct: 0, total: 0 };
    const dls = day.levels[String(level)];
    dls.total++;
    if (correct) dls.correct++;
    if (score !== undefined) { day.totalScore += score; day.completions++; }
  }

  await redis.set(key, ps);
}

export async function recordSurvey(
  puzzleId: string,
  response: "yes" | "no",
): Promise<number> {
  const redis = getRedis();

  if (!redis) {
    const stats = loadStatsFile();
    const ps = ensurePuzzle(stats, puzzleId);
    if (response === "yes") ps.survey.yes++; else ps.survey.no++;
    saveStatsFile(stats);
    const total = ps.survey.yes + ps.survey.no;
    return total > 0 ? Math.round((ps.survey.yes / total) * 100) : 0;
  }

  const key = statsKey(puzzleId);
  const ps: PuzzleStats = (await redis.get(key)) ?? emptyStats();
  if (!ps.survey) ps.survey = { yes: 0, no: 0 };
  if (response === "yes") ps.survey.yes++; else ps.survey.no++;
  await redis.set(key, ps);

  const total = ps.survey.yes + ps.survey.no;
  return total > 0 ? Math.round((ps.survey.yes / total) * 100) : 0;
}

export async function getPuzzleStats(
  puzzleId: string,
  date?: string,
): Promise<{
  levels: Record<string, LevelStat>;
  totalScore: number;
  completions: number;
  survey: { yes: number; no: number };
} | null> {
  const redis = getRedis();

  if (!redis) {
    const stats = loadStatsFile();
    const ps = stats[puzzleId];
    if (!ps) return null;
    if (date && ps.daily?.[date]) {
      const day = ps.daily[date];
      return { levels: day.levels, totalScore: day.totalScore, completions: day.completions, survey: ps.survey };
    }
    return { levels: ps.levels, totalScore: ps.totalScore, completions: ps.completions, survey: ps.survey };
  }

  const ps: PuzzleStats | null = await redis.get(statsKey(puzzleId));
  if (!ps) return null;

  if (date && ps.daily?.[date]) {
    const day = ps.daily[date];
    return { levels: day.levels, totalScore: day.totalScore, completions: day.completions, survey: ps.survey };
  }

  return { levels: ps.levels, totalScore: ps.totalScore, completions: ps.completions, survey: ps.survey };
}
