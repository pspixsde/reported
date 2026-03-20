import { NextResponse } from "next/server";
import { getAllClashPuzzles, getClashPuzzleById } from "@/lib/puzzles-server";
import { clashDailyIndex, stripClashAnswers, todayUTC } from "@/lib/puzzle-utils";
import { recordGuess } from "@/lib/stats-server";

function kdaValue(k: number, d: number, a: number): number {
  return (k + a) / Math.max(d, 1);
}

function formatKdaWithRatio(k: number, d: number, a: number): string {
  return `${k}/${d}/${a} (${kdaValue(k, d, a).toFixed(2)})`;
}

function normalizeBinaryGuess(guess: string): "player1" | "player2" | null {
  const value = guess.trim().toLowerCase();
  if (value === "a" || value === "player1" || value === "p1") return "player1";
  if (value === "b" || value === "player2" || value === "p2") return "player2";
  return null;
}

function normalizeRankAssignment(guess: string): string | null {
  const normalized = guess.replace(/\s+/g, "").toLowerCase();
  const parts = normalized.includes(";")
    ? normalized.split(";")
    : normalized.split(",");
  if (parts.length !== 2) return null;

  const parsed: Partial<Record<"player1" | "player2", string>> = {};
  for (const part of parts) {
    const [rawKey, rawRank] = part.split(":");
    if (!rawKey || !rawRank) return null;
    const key =
      rawKey === "a" || rawKey === "player1" || rawKey === "p1"
        ? "player1"
        : rawKey === "b" || rawKey === "player2" || rawKey === "p2"
          ? "player2"
          : null;
    if (!key) return null;
    parsed[key] = rawRank;
  }

  if (!parsed.player1 || !parsed.player2) return null;
  const toTitle = (rank: string) => rank.charAt(0).toUpperCase() + rank.slice(1);
  return `player1:${toTitle(parsed.player1)};player2:${toTitle(parsed.player2)}`;
}

/**
 * GET /api/puzzle/clash
 * Returns today's Build Clash puzzle (without answers).
 */
export async function GET() {
  try {
    const puzzles = await getAllClashPuzzles();
    if (puzzles.length === 0) {
      return NextResponse.json(
        { error: "No clash puzzles available" },
        { status: 500 },
      );
    }

    const index = clashDailyIndex() % puzzles.length;
    return NextResponse.json(stripClashAnswers(puzzles[index]));
  } catch (err) {
    console.error("Failed to load clash puzzle:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/puzzle/clash
 * Submit a guess: { puzzleId, level, guess }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { puzzleId, level, guess } = body as {
      puzzleId: string;
      level: number;
      guess: string;
      runningScore?: number;
    };

    if (!puzzleId || !level || guess === undefined) {
      return NextResponse.json(
        { error: "Missing puzzleId, level, or guess" },
        { status: 400 },
      );
    }

    const puzzle = await getClashPuzzleById(puzzleId);
    if (!puzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    let answer: string;
    let correct: boolean;

    switch (level) {
      case 1: {
        answer = puzzle.buildA.win ? "player1" : "player2";
        correct = normalizeBinaryGuess(guess) === answer;
        break;
      }
      case 2: {
        const aKda = kdaValue(
          puzzle.buildA.kills,
          puzzle.buildA.deaths,
          puzzle.buildA.assists,
        );
        const bKda = kdaValue(
          puzzle.buildB.kills,
          puzzle.buildB.deaths,
          puzzle.buildB.assists,
        );
        answer = [
          `player1 ${formatKdaWithRatio(puzzle.buildA.kills, puzzle.buildA.deaths, puzzle.buildA.assists)}`,
          `player2 ${formatKdaWithRatio(puzzle.buildB.kills, puzzle.buildB.deaths, puzzle.buildB.assists)}`,
        ].join(" | ");
        correct = normalizeBinaryGuess(guess) === (aKda >= bKda ? "player1" : "player2");
        break;
      }
      case 3: {
        answer = `player1:${puzzle.buildA.rankBracket};player2:${puzzle.buildB.rankBracket}`;
        correct = normalizeRankAssignment(guess) === answer;
        break;
      }
      default:
        return NextResponse.json(
          { error: "Invalid level (1-3)" },
          { status: 400 },
        );
    }

    const maxLevel = 3;
    const isComplete = level >= maxLevel;
    const score = isComplete
      ? (body.runningScore ?? 0) + (correct ? 1 : 0)
      : undefined;
    await recordGuess(puzzleId, level, correct, score, todayUTC());

    return NextResponse.json({ correct, answer });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
