import { NextResponse } from "next/server";
import { recordSurvey } from "@/lib/stats-server";

/**
 * POST /api/survey/report
 * Records a "would you report this build?" survey response.
 * Body: { puzzleId, response: "yes" | "no" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { puzzleId, response } = body as {
      puzzleId: string;
      response: string;
    };

    if (!puzzleId || !response || (response !== "yes" && response !== "no")) {
      return NextResponse.json(
        { error: "Missing or invalid puzzleId/response" },
        { status: 400 },
      );
    }

    const reportPercent = await recordSurvey(puzzleId, response as "yes" | "no");

    return NextResponse.json({ ok: true, reportPercent });
  } catch {
    return NextResponse.json(
      { error: "Failed to save survey response" },
      { status: 500 },
    );
  }
}
