import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { resolve } from "path";

let cachedHeroes: Record<string, unknown> | null = null;
let cachedItems: Record<string, unknown> | null = null;

function loadConstants() {
  if (!cachedHeroes) {
    cachedHeroes = JSON.parse(
      readFileSync(resolve(process.cwd(), "src/data/heroes.json"), "utf-8"),
    );
  }
  if (!cachedItems) {
    cachedItems = JSON.parse(
      readFileSync(resolve(process.cwd(), "src/data/items.json"), "utf-8"),
    );
  }
}

/**
 * GET /api/constants
 * Returns hero and item lookup data for the client.
 */
export async function GET() {
  loadConstants();

  return NextResponse.json(
    {
      heroes: cachedHeroes,
      items: cachedItems,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=86400", // cache for 1 day
      },
    },
  );
}
