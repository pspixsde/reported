/**
 * Server-side puzzle data loader.
 * Reads puzzles.json once and caches in memory.
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import type { Puzzle } from "./game-types";

let cachedPuzzles: Puzzle[] | null = null;

export function getAllPuzzles(): Puzzle[] {
  if (!cachedPuzzles) {
    const filePath = resolve(process.cwd(), "src/data/puzzles.json");
    cachedPuzzles = JSON.parse(readFileSync(filePath, "utf-8"));
  }
  return cachedPuzzles!;
}

export function getPuzzleById(id: string): Puzzle | undefined {
  return getAllPuzzles().find((p) => p.id === id);
}
