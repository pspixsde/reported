/**
 * Seed puzzle data from OpenDota.
 *
 * Two-phase approach:
 *   Phase 1: Fetch item popularity for all heroes (cached to disk)
 *   Phase 2: Fetch public matches and score builds against cached popularity
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
const MAX_BATCHES = 30;
const RATE_LIMIT_MS = 1100;
const MIN_ITEM_COST = 1000;
// Lower threshold: 30% of significant items being unusual is enough
const UNUSUAL_THRESHOLD = 0.3;
// Process more matches per batch
const MATCHES_TO_DETAIL = 15;

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

function patchDisplay(p: number): string {
  if (p >= 60) return "7.37";
  if (p >= 59) return "7.36";
  if (p >= 58) return "7.35d";
  if (p >= 57) return "7.35c";
  if (p >= 56) return "7.35b";
  if (p >= 55) return "7.35";
  if (p >= 54) return "7.34e";
  return `7.${Math.max(30, p - 20)}`;
}

// ── Phase 1: Hero popularity ──

type PopularityMap = Record<number, Set<string>>;

async function fetchAllHeroPopularity(
  heroes: Record<number, HeroData>,
): Promise<PopularityMap> {
  // Check cache
  if (existsSync(POPULARITY_CACHE_PATH)) {
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

  console.log("Fetching item popularity for all heroes (this takes ~3 min)...");
  const map: PopularityMap = {};
  const heroIds = Object.keys(heroes).map(Number);
  let fetched = 0;

  for (const heroId of heroIds) {
    await sleep(RATE_LIMIT_MS);
    const pop = await apiFetch<Record<string, Record<string, number>>>(
      `/heroes/${heroId}/itemPopularity`,
    );

    const popular = new Set<string>();
    if (pop) {
      for (const phase of Object.values(pop)) {
        if (!phase || typeof phase !== "object") continue;
        const sorted = Object.entries(phase).sort((a, b) => b[1] - a[1]);
        // Top 15 items per phase considered "normal"
        for (const [itemId] of sorted.slice(0, 15)) {
          popular.add(itemId);
        }
      }
    }
    map[heroId] = popular;
    fetched++;
    if (fetched % 20 === 0) {
      console.log(`  ${fetched}/${heroIds.length} heroes processed...`);
    }
  }

  // Cache to disk
  const serializable: Record<string, string[]> = {};
  for (const [heroId, items] of Object.entries(map)) {
    serializable[heroId] = [...(items as unknown as Set<string>)];
  }
  writeFileSync(POPULARITY_CACHE_PATH, JSON.stringify(serializable, null, 2));
  console.log(`  Cached popularity data for ${heroIds.length} heroes.`);

  return map;
}

// ── Phase 2: Match processing ──

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

  // Phase 1
  const popularity = await fetchAllHeroPopularity(heroes);

  // Phase 2
  let puzzles: Puzzle[] = [];
  if (existsSync(PUZZLES_PATH)) {
    puzzles = JSON.parse(readFileSync(PUZZLES_PATH, "utf-8"));
    console.log(`\nLoaded ${puzzles.length} existing puzzles.`);
  }

  const existingIds = new Set(puzzles.map((p) => p.id));
  let batches = 0;
  let lastMatchId: number | undefined;

  console.log(`\nTarget: ${TARGET_PUZZLES} puzzles. Starting match scan...`);

  while (puzzles.length < TARGET_PUZZLES && batches < MAX_BATCHES) {
    batches++;
    const suffix = lastMatchId ? `?less_than_match_id=${lastMatchId}` : "";
    await sleep(RATE_LIMIT_MS);
    const publicMatches = await apiFetch<PublicMatch[]>(
      `/publicMatches${suffix}`,
    );
    if (!publicMatches || publicMatches.length === 0) {
      console.warn("  No matches, retrying...");
      await sleep(3000);
      continue;
    }

    // Track last match_id for pagination
    lastMatchId = publicMatches[publicMatches.length - 1].match_id;

    console.log(
      `Batch ${batches}: ${publicMatches.length} matches (${puzzles.length}/${TARGET_PUZZLES} puzzles)`,
    );

    // Fetch details for a subset of matches
    for (const pm of publicMatches.slice(0, MATCHES_TO_DETAIL)) {
      if (puzzles.length >= TARGET_PUZZLES) break;

      await sleep(RATE_LIMIT_MS);
      const detail = await apiFetch<MatchDetail>(`/matches/${pm.match_id}`);
      if (!detail?.players) continue;

      // Skip very short matches
      if (detail.duration < 900) continue; // less than 15 min

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
          patch: patchDisplay(detail.patch),
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

  writeFileSync(PUZZLES_PATH, JSON.stringify(puzzles, null, 2));
  console.log(
    `\nDone! Saved ${puzzles.length} puzzles to src/data/puzzles.json`,
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
