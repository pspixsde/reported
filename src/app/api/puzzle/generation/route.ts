import { NextResponse } from "next/server";
import { getPuzzlesPoolGeneration } from "@/lib/puzzles-pool-generation";

/**
 * GET /api/puzzle/generation
 * Returns the current main-pool generation id (bumped on each main-pool seed).
 */
export async function GET() {
  try {
    const generation = await getPuzzlesPoolGeneration();
    return NextResponse.json({ generation });
  } catch (err) {
    console.error("Failed to load puzzle pool generation:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
