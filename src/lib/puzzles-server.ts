/**
 * Server-side puzzle data loader.
 * Reads puzzles.json once and caches in memory.
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { Puzzle } from "./game-types";

let cachedPuzzles: Puzzle[] | null = null;

export function getAllPuzzles(): Puzzle[] {
  if (!cachedPuzzles) {
    const filePath = resolve(process.cwd(), "src/data/puzzles.json");
    if (!existsSync(filePath)) {
      console.error(`Puzzles file not found at: ${filePath} (cwd: ${process.cwd()})`);
      throw new Error(`Puzzles file not found: ${filePath}`);
    }
    try {
      cachedPuzzles = JSON.parse(readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.error(`Failed to parse puzzles file at: ${filePath}`, err);
      throw new Error(`Failed to parse puzzles file: ${filePath}`);
    }
  }
  return cachedPuzzles!;
}

export function getPuzzleById(id: string): Puzzle | undefined {
  return getAllPuzzles().find((p) => p.id === id);
}
