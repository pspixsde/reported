import { NextResponse } from "next/server";
import { getAllPuzzles } from "@/lib/puzzles-server";
import {
  dailyPuzzleIndex,
  randomPuzzleIndex,
  stripAnswers,
} from "@/lib/puzzle-utils";

/**
 * GET /api/puzzle/random
 * Returns a random puzzle (excluding today's daily), without answers.
 */
export async function GET() {
  const puzzles = getAllPuzzles();
  if (puzzles.length === 0) {
    return NextResponse.json({ error: "No puzzles available" }, { status: 500 });
  }

  const dailyIdx = dailyPuzzleIndex(puzzles.length);
  const idx = randomPuzzleIndex(puzzles.length, dailyIdx);
  const puzzle = puzzles[idx];

  return NextResponse.json(stripAnswers(puzzle));
}

/**
 * POST /api/puzzle/random
 * Submit a guess for a practice puzzle.
 * Same shape as the daily guess endpoint.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { puzzleId, level, guess } = body as {
      puzzleId: string;
      level: number;
      guess: string;
    };

    if (!puzzleId || !level || guess === undefined) {
      return NextResponse.json(
        { error: "Missing puzzleId, level, or guess" },
        { status: 400 },
      );
    }

    const allPuzzles = getAllPuzzles();
    const puzzle = allPuzzles.find((p) => p.id === puzzleId);
    if (!puzzle) {
      return NextResponse.json(
        { error: "Puzzle not found" },
        { status: 404 },
      );
    }

    let answer: string;
    let correct: boolean;

    switch (level) {
      case 1:
        answer = puzzle.win ? "Win" : "Loss";
        correct = guess === answer;
        break;
      case 2:
        answer = puzzle.rankBracket;
        correct = guess === answer;
        break;
      case 3:
        answer = puzzle.kdaBucket;
        correct = guess === answer;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid level (1-3)" },
          { status: 400 },
        );
    }

    return NextResponse.json({ correct, answer });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
