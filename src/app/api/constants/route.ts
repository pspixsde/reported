import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { resolve } from "path";

function readConstants() {
  const heroes = JSON.parse(
    readFileSync(resolve(process.cwd(), "src/data/heroes.json"), "utf-8"),
  );
  const items = JSON.parse(
    readFileSync(resolve(process.cwd(), "src/data/items.json"), "utf-8"),
  );
  return { heroes, items };
}

/**
 * GET /api/constants
 * Returns hero and item lookup data for the client.
 */
export async function GET() {
  const { heroes, items } = readConstants();

  return NextResponse.json(
    { heroes, items },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    },
  );
}
