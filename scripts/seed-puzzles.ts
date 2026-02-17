/**
 * Seed puzzle data from OpenDota — ranked matches on patch 7.40+ only.
 *
 * Approach:
 *   1. Fetch hero item popularity from OpenDota's /heroes/{id}/itemPopularity
 *      endpoint (aggregated data from millions of matches) and build a
 *      per-hero "normal items" baseline (hero-item-popularity.json)
 *   2. Fetch ranked match details, score builds against the baseline,
 *      and collect 150 unusual-build puzzles
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
const UNUSUAL_THRESHOLD = 0.4;
const MATCHES_TO_DETAIL = 15;
// Penalty subtracted per top-5 popular item in a build
const POPULAR_PENALTY = 0.1;

// Patch filtering — only collect from ranked matches on 7.40+
const TARGET_PATCH_ID = 59;        // OpenDota numeric ID for 7.40
const TARGET_PATCH_DISPLAY = "7.40+"; // Display string

// Minimum ranked tier (10 = Herald star 1 — ensures ranked games only)
const MIN_RANK = 10;
// Lobby type 7 = Ranked Matchmaking
const RANKED_LOBBY_TYPE = 7;
// Game mode 23 = Turbo (excluded even if lobby_type matches)
const TURBO_GAME_MODE = 23;

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
  net_worth: number;
  last_hits: number;
  denies: number;
}

interface MatchDetail {
  match_id: number;
  radiant_win: boolean;
  duration: number;
  patch: number;
  lobby_type: number;
  game_mode: number;
  players: MatchPlayer[];
  avg_rank_tier: number | null;
}

interface ItemPopularity {
  start_game_items: Record<string, number>;
  early_game_items: Record<string, number>;
  mid_game_items: Record<string, number>;
  late_game_items: Record<string, number>;
}

interface Puzzle {
  id: string;
  hero: string;
  heroId: number;
  items: number[];
  netWorth: number;
  lastHits: number;
  denies: number;
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
  if (!tier) return "Unknown";
  const bracket = Math.floor(tier / 10);
  const names: Record<number, string> = {
    1: "Herald", 2: "Guardian", 3: "Crusader", 4: "Archon",
    5: "Legend", 6: "Ancient", 7: "Divine", 8: "Immortal",
  };
  return names[bracket] || "Unknown";
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

// ── Hero item popularity (from OpenDota API) ──

/** Maps heroId -> itemId -> popularity rank (1 = most popular) */
type PopularityRankMap = Record<number, Record<string, number>>;

/**
 * Fetch item popularity for every hero from OpenDota's
 * /heroes/{id}/itemPopularity endpoint.
 *
 * Merges mid_game_items and late_game_items (most relevant for
 * final inventory), ranks the top 20 per hero.
 */
async function fetchPopularityFromAPI(
  heroes: Record<number, HeroData>,
  items: Record<number, ItemData>,
): Promise<PopularityRankMap> {
  const heroIds = Object.keys(heroes).map(Number);
  const map: PopularityRankMap = {};
  let fetched = 0;

  console.log(`Fetching item popularity for ${heroIds.length} heroes from OpenDota API...`);

  for (const heroId of heroIds) {
    await sleep(RATE_LIMIT_MS);
    const data = await apiFetch<ItemPopularity>(`/heroes/${heroId}/itemPopularity`);
    fetched++;

    if (!data) {
      console.warn(`  Skipped hero ${heroId} (no data)`);
      continue;
    }

    // Merge mid-game and late-game item counts (most relevant for final inventory)
    const merged: Record<string, number> = {};
    for (const phase of [data.mid_game_items, data.late_game_items]) {
      if (!phase) continue;
      for (const [itemId, count] of Object.entries(phase)) {
        // Only count significant items (cost >= MIN_ITEM_COST)
        const item = items[Number(itemId)];
        if (!item || (item.cost !== null && item.cost < MIN_ITEM_COST)) continue;
        merged[itemId] = (merged[itemId] || 0) + count;
      }
    }

    // Rank top 20 items by total count
    const sorted = Object.entries(merged).sort((a, b) => b[1] - a[1]);
    const ranks: Record<string, number> = {};
    for (let i = 0; i < Math.min(sorted.length, 20); i++) {
      ranks[sorted[i][0]] = i + 1;
    }
    map[heroId] = ranks;

    if (fetched % 20 === 0 || fetched === heroIds.length) {
      console.log(`  ${fetched}/${heroIds.length} heroes processed`);
    }
  }

  return map;
}

/**
 * Save popularity rank map to disk.
 */
function savePopularity(map: PopularityRankMap): void {
  writeFileSync(POPULARITY_CACHE_PATH, JSON.stringify(map, null, 2));
}

/**
 * Load popularity rank map from disk cache.
 */
function loadPopularityCache(): PopularityRankMap | null {
  if (!existsSync(POPULARITY_CACHE_PATH)) return null;
  console.log("Loading cached hero item popularity...");
  const raw = JSON.parse(readFileSync(POPULARITY_CACHE_PATH, "utf-8"));

  // Handle legacy format (arrays instead of rank objects)
  const firstValue = Object.values(raw)[0];
  if (Array.isArray(firstValue)) {
    console.log("  Legacy format detected, will rebuild...");
    return null;
  }

  const map: PopularityRankMap = raw as PopularityRankMap;
  console.log(`  Loaded popularity data for ${Object.keys(map).length} heroes.`);
  return map;
}

// ── Unusual build scoring ──

/**
 * Weighted unusual score:
 *   - Items NOT in the top 20 for the hero: +1 (unusual)
 *   - Items ranked 6-20: 0 (neutral)
 *   - Items ranked 1-5 (most popular): -POPULAR_PENALTY each (penalized)
 *
 * score = (unusual_points - popular_penalty) / significant_items
 */
function unusualScore(
  heroId: number,
  playerItems: number[],
  items: Record<number, ItemData>,
  popularity: PopularityRankMap,
): number {
  const heroRanks = popularity[heroId];
  if (!heroRanks) return 0;

  let unusualPoints = 0;
  let significant = 0;

  for (const itemId of playerItems) {
    if (itemId === 0) continue;
    const item = items[itemId];
    if (!item || (item.cost !== null && item.cost < MIN_ITEM_COST)) continue;

    significant++;
    const rank = heroRanks[String(itemId)];
    if (rank === undefined) {
      // Not in top 20 — unusual
      unusualPoints += 1;
    } else if (rank <= 5) {
      // Top 5 most popular — penalize
      unusualPoints -= POPULAR_PENALTY;
    }
    // Rank 6-20: neutral (0)
  }

  return significant > 0 ? unusualPoints / significant : 0;
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

  // ── Step 1: Build or load hero item popularity ──
  let popularity = loadPopularityCache();

  if (!popularity) {
    popularity = await fetchPopularityFromAPI(heroes, items);
    savePopularity(popularity);
    console.log(`  Saved popularity data to ${POPULARITY_CACHE_PATH}\n`);
  }

  // ── Step 2: Fetch matches and collect unusual-build puzzles ──
  const puzzles: Puzzle[] = [];
  const existingIds = new Set<string>();
  let batches = 0;
  let lastMatchId: number | undefined;

  console.log(`\nTarget: ${TARGET_PUZZLES} puzzles from ranked matches on patch ${TARGET_PATCH_DISPLAY}\n`);

  while (puzzles.length < TARGET_PUZZLES && batches < MAX_BATCHES) {
    batches++;
    await sleep(RATE_LIMIT_MS);

    const publicMatches = await fetchRankedMatches(lastMatchId);
    if (!publicMatches || publicMatches.length === 0) {
      console.warn("  No matches, retrying...");
      await sleep(3000);
      continue;
    }

    lastMatchId = publicMatches[publicMatches.length - 1].match_id;

    console.log(
      `Batch ${batches}: ${publicMatches.length} matches ` +
      `(puzzles: ${puzzles.length}/${TARGET_PUZZLES})`,
    );

    // Fetch details for a subset of matches
    for (const pm of publicMatches.slice(0, MATCHES_TO_DETAIL)) {
      if (puzzles.length >= TARGET_PUZZLES) break;

      await sleep(RATE_LIMIT_MS);
      const detail = await apiFetch<MatchDetail>(`/matches/${pm.match_id}`);
      if (!detail?.players) continue;

      // Filter: must be on target patch
      if (detail.patch !== TARGET_PATCH_ID) continue;

      // Filter: must be ranked matchmaking (not Turbo, normal, etc.)
      if (detail.lobby_type !== RANKED_LOBBY_TYPE) continue;
      if (detail.game_mode === TURBO_GAME_MODE) continue;

      // Filter: skip very short matches
      if (detail.duration < 900) continue;

      // Use avg_rank_tier from the publicMatches response (more reliable than detail)
      const pmAvgRankTier = pm.avg_rank_tier;

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
          popularity,
        );
        if (score < UNUSUAL_THRESHOLD) continue;

        const puzzleId = `${detail.match_id}-${player.hero_id}`;
        if (existingIds.has(puzzleId)) continue;

        puzzles.push({
          id: puzzleId,
          hero: hero.name,
          heroId: hero.id,
          items: [
            player.item_0, player.item_1, player.item_2,
            player.item_3, player.item_4, player.item_5,
          ],
          netWorth: player.net_worth || 0,
          lastHits: player.last_hits || 0,
          denies: player.denies || 0,
          duration: detail.duration,
          patch: TARGET_PATCH_DISPLAY,
          win: player.win === 1,
          rankBracket: rankTierToName(pmAvgRankTier),
          kdaBucket: classifyKda(player.kills, player.deaths, player.assists),
        });

        existingIds.add(puzzleId);
        console.log(
          `  [${puzzles.length}] ${hero.localized_name} (NW: ${player.net_worth}) score=${score.toFixed(2)}`,
        );
      }
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
