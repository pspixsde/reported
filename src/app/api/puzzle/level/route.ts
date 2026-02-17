import { NextResponse } from "next/server";
import { getAllPuzzles, getPuzzleById } from "@/lib/puzzles-server";
import { getPuzzleAssignments, stripAnswers } from "@/lib/puzzle-utils";
import { PUZZLES_TOTAL } from "@/lib/game-types";

/**
 * GET /api/puzzle/level?index=0
 * Returns a specific puzzle from the Puzzles mode grid (without answers).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const indexParam = searchParams.get("index");

    if (indexParam === null) {
      return NextResponse.json(
        { error: "Missing index query parameter" },
        { status: 400 },
      );
    }

    const index = parseInt(indexParam, 10);

    if (isNaN(index) || index < 0 || index >= PUZZLES_TOTAL) {
      return NextResponse.json(
        { error: `Invalid index (0-${PUZZLES_TOTAL - 1})` },
        { status: 400 },
      );
    }

    const puzzles = getAllPuzzles();
    if (puzzles.length === 0) {
      return NextResponse.json(
        { error: "No puzzles available" },
        { status: 500 },
      );
    }

    const assignments = getPuzzleAssignments(puzzles.length);
    const puzzlePoolIndex = assignments[index];
    const puzzle = puzzles[puzzlePoolIndex];

    return NextResponse.json(stripAnswers(puzzle));
  } catch (err) {
    console.error("Failed to load level puzzle:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/puzzle/level
 * Submit a guess for a Puzzles-mode puzzle.
 * Body: { puzzleId, level (guess level 1-3), guess }
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

    const puzzle = getPuzzleById(puzzleId);
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
        answer = puzzle.kdaBucket;
        correct = guess === answer;
        break;
      case 3:
        answer = puzzle.rankBracket;
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
