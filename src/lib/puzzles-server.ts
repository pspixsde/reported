/**
 * Server-side puzzle data loader.
 * Uses Upstash Redis (KV) in production, falls back to local file for development.
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { Puzzle } from "./game-types";
import { getRedis } from "./redis";

const PUZZLES_FILE = resolve(process.cwd(), "src/data/puzzles.json");
const HEROES_FILE = resolve(process.cwd(), "src/data/heroes.json");

const KV_PUZZLES_KEY = "puzzles:all";

// ── In-memory cache (avoids re-fetching on every request within the same lambda) ──
let cachedPuzzles: Puzzle[] | null = null;

export async function getAllPuzzles(): Promise<Puzzle[]> {
  if (cachedPuzzles) return cachedPuzzles;

  const redis = getRedis();

  if (redis) {
    const data = await redis.get<Puzzle[]>(KV_PUZZLES_KEY);
    if (data && data.length > 0) {
      cachedPuzzles = data;
      return data;
    }
  }

  // File fallback (local development)
  if (!existsSync(PUZZLES_FILE)) {
    throw new Error(`Puzzles not found in KV or at ${PUZZLES_FILE}. Run seed:puzzles first.`);
  }

  const puzzles: Puzzle[] = JSON.parse(readFileSync(PUZZLES_FILE, "utf-8"));
  cachedPuzzles = puzzles;
  return puzzles;
}

export async function getPuzzleById(id: string): Promise<Puzzle | undefined> {
  const puzzles = await getAllPuzzles();
  return puzzles.find((p) => p.id === id);
}

/** Return all hero IDs from the heroes.json constants file. */
export function getAllHeroIds(): number[] {
  if (!existsSync(HEROES_FILE)) return [];
  try {
    const heroes = JSON.parse(readFileSync(HEROES_FILE, "utf-8"));
    return Object.keys(heroes).map(Number);
  } catch {
    return [];
  }
}
