/**
 * Server-side puzzle data loader.
 * Always reads puzzles.json from disk so re-seeding takes effect
 * without needing to rebuild.
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { Puzzle } from "./game-types";

const PUZZLES_FILE = resolve(process.cwd(), "src/data/puzzles.json");
const HEROES_FILE = resolve(process.cwd(), "src/data/heroes.json");

export function getAllPuzzles(): Puzzle[] {
  if (!existsSync(PUZZLES_FILE)) {
    console.error(`Puzzles file not found at: ${PUZZLES_FILE} (cwd: ${process.cwd()})`);
    throw new Error(`Puzzles file not found: ${PUZZLES_FILE}`);
  }
  try {
    return JSON.parse(readFileSync(PUZZLES_FILE, "utf-8"));
  } catch (err) {
    console.error(`Failed to parse puzzles file at: ${PUZZLES_FILE}`, err);
    throw new Error(`Failed to parse puzzles file: ${PUZZLES_FILE}`);
  }
}

export function getPuzzleById(id: string): Puzzle | undefined {
  return getAllPuzzles().find((p) => p.id === id);
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
