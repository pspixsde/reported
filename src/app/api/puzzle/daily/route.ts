import { NextResponse } from "next/server";
import { getAllPuzzles, getPuzzleById } from "@/lib/puzzles-server";
import { dailyPuzzleIndex, stripAnswers, todayUTC } from "@/lib/puzzle-utils";
import { recordGuess } from "@/lib/stats-server";

/**
 * GET /api/puzzle/daily
 * Returns today's puzzle (without answers).
 */
export async function GET() {
  try {
    const puzzles = getAllPuzzles();
    if (puzzles.length === 0) {
      return NextResponse.json({ error: "No puzzles available" }, { status: 500 });
    }

    const index = dailyPuzzleIndex();
    const puzzle = puzzles[index];
    return NextResponse.json(stripAnswers(puzzle));
  } catch (err) {
    console.error("Failed to load daily puzzle:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/puzzle/daily
 * Submit a guess: { puzzleId, level, guess }
 * Returns: { correct, answer }
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
        answer = `${puzzle.kills}/${puzzle.deaths}/${puzzle.assists}`;
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

    const today = todayUTC();
    const maxLevel = 3;
    const isComplete = level >= maxLevel;
    const score = isComplete ? (body.runningScore ?? 0) + (correct ? 1 : 0) : undefined;
    recordGuess(puzzleId, level, correct, score, today);

    return NextResponse.json({ correct, answer });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
