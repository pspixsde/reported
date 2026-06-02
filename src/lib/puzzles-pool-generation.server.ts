import "server-only";

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { getRedis } from "./redis";
import {
  KV_PUZZLES_GENERATION_KEY,
  LEGACY_PUZZLES_GENERATION,
} from "./puzzles-pool-generation.constants";

const GENERATION_FILE = resolve(
  process.cwd(),
  "src/data/puzzles-pool-generation.json",
);

export async function getPuzzlesPoolGeneration(): Promise<string> {
  const redis = getRedis();
  if (redis) {
    const value = await redis.get<string>(KV_PUZZLES_GENERATION_KEY);
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  if (existsSync(GENERATION_FILE)) {
    try {
      const raw = JSON.parse(readFileSync(GENERATION_FILE, "utf-8")) as {
        generation?: string;
      };
      if (raw.generation) return raw.generation;
    } catch {
      // fall through
    }
  }

  return LEGACY_PUZZLES_GENERATION;
}

/** Write generation to KV (if configured) and local file for dev fallback. */
export async function setPuzzlesPoolGeneration(generation: string): Promise<void> {
  const dir = dirname(GENERATION_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(
    GENERATION_FILE,
    JSON.stringify({ generation }, null, 2),
    "utf-8",
  );

  const redis = getRedis();
  if (redis) {
    await redis.set(KV_PUZZLES_GENERATION_KEY, generation);
  }
}
