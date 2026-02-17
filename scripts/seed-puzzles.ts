/**
 * Seed puzzle data from OpenDota — ranked matches on patch 7.40b only.
 *
 * Two-phase approach:
 *   Phase 1: Fetch ranked matches on patch 7.40b, accumulate hero item usage
 *            to build a "normal items" baseline (hero-item-popularity.json)
 *   Phase 2: Continue fetching ranked matches, score builds against the
 *            baseline, and collect 150 unusual-build puzzles
 *
 * Run with: npm run seed:puzzles
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://api.opendota.com/api";
const DATA_DIR = resolve(__dirname, "../src/data");
const PUZZLES_PATH = resolve(DATA_DIR, "puzzles.json");
const HEROES_PATH = resolve(DATA_DIR, "heroes.json");
const ITEMS_PATH = resolve(DATA_DIR, "items.json");
const POPULARITY_CACHE_PATH = resolve(DATA_DIR, "hero-item-popularity.json");

// ── Config ──
const TARGET_PUZZLES = 150;
const MAX_BATCHES = 60;
const RATE_LIMIT_MS = 1100;
const MIN_ITEM_COST = 1000;
const UNUSUAL_THRESHOLD = 0.3;
const MATCHES_TO_DETAIL = 15;

// Patch filtering — only collect from ranked matches on 7.40b
const TARGET_PATCH_ID = 59;        // OpenDota numeric ID for 7.40
const TARGET_PATCH_DISPLAY = "7.40b"; // Display string

// Phase 1: How many match details to process before computing popularity
const POPULARITY_MATCH_TARGET = 200;
// Minimum ranked tier (10 = Herald star 1 — ensures ranked games only)
const MIN_RANK = 10;

// ── Types ──

interface HeroData {
  id: number;
  name: string;
  localized_name: string;
  roles: string[];
}

interface ItemData {
  id: number;
  name: string;
  dname: string;
  cost: number | null;
}

interface PublicMatch {
  match_id: number;
  radiant_win: boolean;
  duration: number;
  avg_rank_tier: number | null;
}

interface MatchPlayer {
  player_slot: number;
  hero_id: number;
  item_0: number;
  item_1: number;
  item_2: number;
  item_3: number;
  item_4: number;
  item_5: number;
  kills: number;
  deaths: number;
  assists: number;
  lane_role: number;
  win: number;
  gold_per_min: number;
  hero_damage: number;
  tower_damage: number;
  is_roaming: boolean | null;
}

interface MatchDetail {
  match_id: number;
  radiant_win: boolean;
  duration: number;
  patch: number;
  players: MatchPlayer[];
  avg_rank_tier: number | null;
}

interface Puzzle {
  id: string;
  hero: string;
  heroId: number;
  items: number[];
  role: string;
  lane: string;
  duration: number;
  patch: string;
  win: boolean;
  rankBracket: string;
  kdaBucket: string;
}

// ── Helpers ──

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    if (res.status === 429) {
      console.warn("  Rate limited, waiting 10s...");
      await sleep(10000);
      return apiFetch(path);
    }
    if (!res.ok) {
      console.warn(`  API ${res.status}: ${path}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`  Fetch error: ${path}`, err);
    return null;
  }
}

function rankTierToName(tier: number | null): string {
  if (!tier) return "Archon";
  const bracket = Math.floor(tier / 10);
  const names: Record<number, string> = {
    1: "Herald", 2: "Guardian", 3: "Crusader", 4: "Archon",
    5: "Legend", 6: "Ancient", 7: "Divine", 8: "Immortal",
  };
  return names[bracket] || "Archon";
}

function laneRoleName(role: number): string {
  switch (role) {
    case 1: return "Safe Lane";
    case 2: return "Mid Lane";
    case 3: return "Off Lane";
    case 4: return "Jungle";
    default: return "Roaming";
  }
}

function inferPosition(laneRole: number, isLikelySupport: boolean): string {
  if (isLikelySupport) {
    if (laneRole === 1) return "Hard Support (Pos 5)";
    if (laneRole === 3) return "Soft Support (Pos 4)";
    return "Support (Pos 4/5)";
  }
  switch (laneRole) {
    case 1: return "Carry (Pos 1)";
    case 2: return "Mid (Pos 2)";
    case 3: return "Offlane (Pos 3)";
    default: return "Core";
  }
}

function classifyKda(k: number, d: number, a: number): string {
  return `${bv(k, [0, 4, 8, 13])} / ${bv(d, [0, 4, 8])} / ${bv(a, [0, 5, 10, 15])}`;
}

function bv(val: number, t: number[]): string {
  for (let i = t.length - 1; i >= 0; i--) {
    if (val >= t[i]) {
      return i === t.length - 1 ? `${t[i]}+` : `${t[i]}-${t[i + 1] - 1}`;
    }
  }
  return `0-${(t[1] ?? 1) - 1}`;
}

// ── Hero item popularity (built from ranked match data) ──

type PopularityMap = Record<number, Set<string>>;
type ItemCountMap = Record<number, Record<string, number>>;

/**
 * Accumulate item usage from a match detail into the counts map.
 * Only counts significant items (cost >= MIN_ITEM_COST).
 */
function accumulateItemUsage(
  detail: MatchDetail,
  items: Record<number, ItemData>,
  counts: ItemCountMap,
): void {
  for (const player of detail.players) {
    const heroId = player.hero_id;
    if (!counts[heroId]) counts[heroId] = {};

    const playerItems = [
      player.item_0, player.item_1, player.item_2,
      player.item_3, player.item_4, player.item_5,
    ];

    for (const itemId of playerItems) {
      if (itemId === 0) continue;
      const item = items[itemId];
      if (!item || (item.cost !== null && item.cost < MIN_ITEM_COST)) continue;
      const key = String(itemId);
      counts[heroId][key] = (counts[heroId][key] || 0) + 1;
    }
  }
}

/**
 * Convert accumulated item counts into a popularity map.
 * Top 20 items per hero are considered "popular".
 */
function buildPopularityFromCounts(counts: ItemCountMap): PopularityMap {
  const map: PopularityMap = {};
  for (const [heroIdStr, itemCounts] of Object.entries(counts)) {
    const heroId = Number(heroIdStr);
    const sorted = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
    const popular = new Set<string>();
    for (const [itemId] of sorted.slice(0, 20)) {
      popular.add(itemId);
    }
    map[heroId] = popular;
  }
  return map;
}

/**
 * Save popularity map to disk.
 */
function savePopularity(map: PopularityMap): void {
  const serializable: Record<string, string[]> = {};
  for (const [heroId, items] of Object.entries(map)) {
    serializable[heroId] = [...(items as unknown as Set<string>)];
  }
  writeFileSync(POPULARITY_CACHE_PATH, JSON.stringify(serializable, null, 2));
}

/**
 * Load popularity map from disk cache.
 */
function loadPopularityCache(): PopularityMap | null {
  if (!existsSync(POPULARITY_CACHE_PATH)) return null;
  console.log("Loading cached hero item popularity...");
  const raw: Record<string, string[]> = JSON.parse(
    readFileSync(POPULARITY_CACHE_PATH, "utf-8"),
  );
  const map: PopularityMap = {};
  for (const [heroId, itemIds] of Object.entries(raw)) {
    map[Number(heroId)] = new Set(itemIds);
  }
  console.log(`  Loaded popularity data for ${Object.keys(map).length} heroes.`);
  return map;
}

// ── Unusual build scoring ──

function unusualScore(
  heroId: number,
  playerItems: number[],
  items: Record<number, ItemData>,
  popularity: PopularityMap,
): number {
  const popular = popularity[heroId];
  if (!popular) return 0;

  let unusual = 0;
  let significant = 0;

  for (const itemId of playerItems) {
    if (itemId === 0) continue;
    const item = items[itemId];
    if (!item || (item.cost !== null && item.cost < MIN_ITEM_COST)) continue;

    significant++;
    if (!popular.has(String(itemId))) {
      unusual++;
    }
  }

  return significant > 0 ? unusual / significant : 0;
}

// ── Fetch ranked public matches ──

async function fetchRankedMatches(
  lastMatchId?: number,
): Promise<PublicMatch[] | null> {
  let path = `/publicMatches?min_rank=${MIN_RANK}`;
  if (lastMatchId) {
    path += `&less_than_match_id=${lastMatchId}`;
  }
  return apiFetch<PublicMatch[]>(path);
}

// ── Main ──

async function main() {
  if (!existsSync(HEROES_PATH) || !existsSync(ITEMS_PATH)) {
    console.error("Run `npm run seed:constants` first.");
    process.exit(1);
  }

  const heroes: Record<number, HeroData> = JSON.parse(
    readFileSync(HEROES_PATH, "utf-8"),
  );
  const items: Record<number, ItemData> = JSON.parse(
    readFileSync(ITEMS_PATH, "utf-8"),
  );

  // Try loading cached popularity
  let popularity = loadPopularityCache();
  const itemCounts: ItemCountMap = {};
  let popularityMatchesProcessed = 0;
  let popularityReady = popularity !== null;

  // Puzzles collection
  const puzzles: Puzzle[] = [];
  const existingIds = new Set<string>();
  let batches = 0;
  let lastMatchId: number | undefined;

  console.log(`\nTarget: ${TARGET_PUZZLES} puzzles from ranked matches on patch ${TARGET_PATCH_DISPLAY}`);
  console.log(`Popularity ready: ${popularityReady ? "yes (cached)" : "no (will build from matches)"}\n`);

  while (
    (puzzles.length < TARGET_PUZZLES || !popularityReady) &&
    batches < MAX_BATCHES
  ) {
    batches++;
    await sleep(RATE_LIMIT_MS);

    const publicMatches = await fetchRankedMatches(lastMatchId);
    if (!publicMatches || publicMatches.length === 0) {
      console.warn("  No matches, retrying...");
      await sleep(3000);
      continue;
    }

    lastMatchId = publicMatches[publicMatches.length - 1].match_id;

    const phase = popularityReady ? "Phase 2 (puzzles)" : "Phase 1 (popularity)";
    console.log(
      `Batch ${batches} [${phase}]: ${publicMatches.length} matches ` +
      `(puzzles: ${puzzles.length}/${TARGET_PUZZLES}, popularity matches: ${popularityMatchesProcessed})`,
    );

    // Fetch details for a subset of matches
    for (const pm of publicMatches.slice(0, MATCHES_TO_DETAIL)) {
      if (popularityReady && puzzles.length >= TARGET_PUZZLES) break;

      await sleep(RATE_LIMIT_MS);
      const detail = await apiFetch<MatchDetail>(`/matches/${pm.match_id}`);
      if (!detail?.players) continue;

      // Filter: must be on target patch
      if (detail.patch !== TARGET_PATCH_ID) {
        continue;
      }

      // Filter: skip very short matches
      if (detail.duration < 900) continue;

      // Phase 1: accumulate item usage for popularity baseline
      if (!popularityReady) {
        accumulateItemUsage(detail, items, itemCounts);
        popularityMatchesProcessed++;

        if (popularityMatchesProcessed >= POPULARITY_MATCH_TARGET) {
          console.log(
            `\n  Popularity baseline built from ${popularityMatchesProcessed} matches.`,
          );
          popularity = buildPopularityFromCounts(itemCounts);
          savePopularity(popularity);
          console.log(`  Saved to ${POPULARITY_CACHE_PATH}\n`);
          popularityReady = true;
        }
        continue;
      }

      // Phase 2: score builds and collect puzzles
      for (const player of detail.players) {
        if (puzzles.length >= TARGET_PUZZLES) break;

        const hero = heroes[player.hero_id];
        if (!hero) continue;

        const playerItems = [
          player.item_0, player.item_1, player.item_2,
          player.item_3, player.item_4, player.item_5,
        ].filter((id) => id !== 0);

        if (playerItems.length < 3) continue;

        const score = unusualScore(
          player.hero_id,
          playerItems,
          items,
          popularity!,
        );
        if (score < UNUSUAL_THRESHOLD) continue;

        const puzzleId = `${detail.match_id}-${player.hero_id}`;
        if (existingIds.has(puzzleId)) continue;

        const isLikelySupport = player.gold_per_min < 350;

        puzzles.push({
          id: puzzleId,
          hero: hero.name,
          heroId: hero.id,
          items: [
            player.item_0, player.item_1, player.item_2,
            player.item_3, player.item_4, player.item_5,
          ],
          role: inferPosition(player.lane_role, isLikelySupport),
          lane: laneRoleName(player.lane_role),
          duration: detail.duration,
          patch: TARGET_PATCH_DISPLAY,
          win: player.win === 1,
          rankBracket: rankTierToName(detail.avg_rank_tier),
          kdaBucket: classifyKda(player.kills, player.deaths, player.assists),
        });

        existingIds.add(puzzleId);
        console.log(
          `  [${puzzles.length}] ${hero.localized_name} (${puzzles[puzzles.length - 1].role}) score=${score.toFixed(2)}`,
        );
      }
    }
  }

  if (!popularityReady) {
    // If we didn't reach the target, save what we have
    console.warn(
      `\n  Warning: Only processed ${popularityMatchesProcessed} matches for popularity (target: ${POPULARITY_MATCH_TARGET}).`,
    );
    if (popularityMatchesProcessed > 0) {
      popularity = buildPopularityFromCounts(itemCounts);
      savePopularity(popularity);
      console.log(`  Saved partial popularity data.`);
    }
  }

  writeFileSync(PUZZLES_PATH, JSON.stringify(puzzles, null, 2));
  console.log(
    `\nDone! Saved ${puzzles.length} puzzles to src/data/puzzles.json`,
  );

  if (puzzles.length < TARGET_PUZZLES) {
    console.warn(
      `  Warning: Only found ${puzzles.length}/${TARGET_PUZZLES} puzzles. ` +
      `Try increasing MAX_BATCHES or lowering UNUSUAL_THRESHOLD.`,
    );
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
