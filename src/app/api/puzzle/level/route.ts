import { NextResponse } from "next/server";
import { getAllPuzzles, getPuzzleById, getAllHeroIds } from "@/lib/puzzles-server";
import { getPuzzleAssignments, stripAnswers, generateHeroOptions } from "@/lib/puzzle-utils";
import { PUZZLES_TOTAL } from "@/lib/game-types";
import { recordGuess } from "@/lib/stats-server";

/**
 * GET /api/puzzle/level?index=0&hard=false
 * Returns a specific puzzle from the Puzzles mode grid (without answers).
 * Pass hard=true for hard-mode pool (indices 20-39 with heroOptions).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const indexParam = searchParams.get("index");
    const hard = searchParams.get("hard") === "true";

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

    const assignments = getPuzzleAssignments(hard);
    const puzzlePoolIndex = assignments[index];
    const puzzle = puzzles[puzzlePoolIndex];

    if (hard) {
      const allHeroIds = getAllHeroIds();
      const heroOpts = generateHeroOptions(puzzle, allHeroIds);
      return NextResponse.json(stripAnswers(puzzle, heroOpts));
    }

    return NextResponse.json(stripAnswers(puzzle));
  } catch (err) {
    console.error("Failed to load level puzzle:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/puzzle/level
 * Submit a guess for a Puzzles-mode puzzle.
 * Body: { puzzleId, level (1-4), guess, hard? }
 *
 * Normal mode levels: 1=Win/Loss, 2=KDA, 3=Rank
 * Hard mode levels:   1=Hero, 2=Win/Loss, 3=KDA, 4=Rank
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { puzzleId, level, guess, hard } = body as {
      puzzleId: string;
      level: number;
      guess: string;
      hard?: boolean;
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

    if (hard) {
      // Hard mode: 4 levels — Hero, Win/Loss, KDA, Rank
      switch (level) {
        case 1:
          answer = String(puzzle.heroId);
          correct = guess === answer;
          break;
        case 2:
          answer = puzzle.win ? "Win" : "Loss";
          correct = guess === answer;
          break;
        case 3:
          answer = `${puzzle.kills}/${puzzle.deaths}/${puzzle.assists}`;
          correct = guess === answer;
          break;
        case 4:
          answer = puzzle.rankBracket;
          correct = guess === answer;
          break;
        default:
          return NextResponse.json(
            { error: "Invalid level (1-4)" },
            { status: 400 },
          );
      }
    } else {
      // Normal mode: 3 levels — Win/Loss, KDA, Rank
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
    }

    const maxLevel = hard ? 4 : 3;
    const isComplete = level >= maxLevel;
    const score = isComplete ? (body.runningScore ?? 0) + (correct ? 1 : 0) : undefined;
    recordGuess(puzzleId, level, correct, score);

    return NextResponse.json({ correct, answer });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
