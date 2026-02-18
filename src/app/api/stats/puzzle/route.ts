import { NextResponse } from "next/server";
import { getPuzzleStats } from "@/lib/stats-server";

/**
 * GET /api/stats/puzzle?puzzleId=X&date=YYYY-MM-DD
 * Returns global stats for a puzzle.
 * If `date` is provided, returns the daily-partitioned stats for that date.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const puzzleId = searchParams.get("puzzleId");
    const date = searchParams.get("date") ?? undefined;

    if (!puzzleId) {
      return NextResponse.json(
        { error: "Missing puzzleId query parameter" },
        { status: 400 },
      );
    }

    const stats = getPuzzleStats(puzzleId, date);

    if (!stats) {
      return NextResponse.json({
        levels: {},
        totalScore: 0,
        completions: 0,
        survey: { yes: 0, no: 0 },
      });
    }

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 },
    );
  }
}
