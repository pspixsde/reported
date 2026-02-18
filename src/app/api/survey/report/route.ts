import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { recordSurvey } from "@/lib/stats-server";

const SURVEY_PATH = resolve(process.cwd(), "src/data/survey-responses.json");

interface SurveyEntry {
  puzzleId: string;
  response: "yes" | "no";
  timestamp: string;
}

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

    const entry: SurveyEntry = {
      puzzleId,
      response,
      timestamp: new Date().toISOString(),
    };

    // Read existing responses or start fresh
    let responses: SurveyEntry[] = [];
    if (existsSync(SURVEY_PATH)) {
      try {
        responses = JSON.parse(readFileSync(SURVEY_PATH, "utf-8"));
      } catch {
        responses = [];
      }
    }

    responses.push(entry);
    writeFileSync(SURVEY_PATH, JSON.stringify(responses, null, 2));

    const reportPercent = recordSurvey(puzzleId, response as "yes" | "no");

    return NextResponse.json({ ok: true, reportPercent });
  } catch {
    return NextResponse.json(
      { error: "Failed to save survey response" },
      { status: 500 },
    );
  }
}
