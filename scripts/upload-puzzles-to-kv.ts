/**
 * Push src/data/puzzles.json to Upstash (same key the app uses: puzzles:all).
 * Loads KV_* from .env.local like the seed script.
 *
 * Run: npx tsx scripts/upload-puzzles-to-kv.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { Redis } from "@upstash/redis";

const ENV_PATH = resolve(__dirname, "../.env.local");
if (existsSync(ENV_PATH)) {
  for (const line of readFileSync(ENV_PATH, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const PUZZLES_PATH = resolve(__dirname, "../src/data/puzzles.json");
const KV_KEY = "puzzles:all";

async function main() {
  if (!existsSync(PUZZLES_PATH)) {
    console.error(`Missing ${PUZZLES_PATH}`);
    process.exit(1);
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.error("Set KV_REST_API_URL and KV_REST_API_TOKEN in .env.local (or environment).");
    process.exit(1);
  }

  const raw = readFileSync(PUZZLES_PATH, "utf-8");
  const puzzles = JSON.parse(raw) as unknown;
  if (!Array.isArray(puzzles) || puzzles.length === 0) {
    console.error("puzzles.json is empty or not an array.");
    process.exit(1);
  }

  const redis = new Redis({ url, token });
  await redis.set(KV_KEY, puzzles);
  console.log(`Uploaded ${puzzles.length} puzzles to Upstash (key: ${KV_KEY})`);
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
