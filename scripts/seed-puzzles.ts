/**
 * Seed puzzle data from OpenDota — ranked matches on the configured target patch.
 *
 * Approach:
 *   1. Fetch hero item popularity from OpenDota's /heroes/{id}/itemPopularity
 *      endpoint (aggregated data from millions of matches) and build a
 *      per-hero "normal items" baseline (hero-item-popularity.json)
 *   2. Fetch ranked match details, score builds against the baseline,
 *      and collect unusual-build puzzles
 *   3. Upload puzzles to Upstash Redis (KV) for production use
 *
 * Run with: npm run seed:puzzles
 *   --clash-only  Skip main 70-puzzle fetch; load existing src/data/puzzles.json
 *                 for ID dedup, then only collect clash data + upload clash KV.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { Redis } from "@upstash/redis";

// Load .env.local for KV credentials (not auto-loaded outside Next.js)
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

const BASE_URL = "https://api.opendota.com/api";
const DATA_DIR = resolve(__dirname, "../src/data");
const PUZZLES_PATH = resolve(DATA_DIR, "puzzles.json");
const CLASH_PUZZLES_PATH = resolve(DATA_DIR, "clash-puzzles.json");
const HEROES_PATH = resolve(DATA_DIR, "heroes.json");
const ITEMS_PATH = resolve(DATA_DIR, "items.json");
const POPULARITY_CACHE_PATH = resolve(DATA_DIR, "hero-item-popularity.json");
const GAME_STORE_PATH = resolve(__dirname, "../src/stores/game-store.ts");
const GLOBAL_STATS_PATH = resolve(DATA_DIR, "puzzle-global-stats.json");

// ── Config ──
const TARGET_PUZZLES = 70;
const MAX_BATCHES = 120;
const RATE_LIMIT_MS = 1100;
const MIN_ITEM_COST = 1200;
const UNUSUAL_THRESHOLD = 0.7;
const MATCHES_TO_DETAIL = 25;
const EXPLORER_MATCHES_TO_DETAIL = 90;
// Penalty subtracted per top-10 popular item in a build
const POPULAR_PENALTY = 0.4;
// Items above this cost get amplified weirdness weight
const EXPENSIVE_ITEM_COST = 4000;
// Multiplier for unusual items costing more than EXPENSIVE_ITEM_COST
const EXPENSIVE_MULTIPLIER = 1.5;
// Minimum final net worth for a player to be considered as a puzzle
const MIN_NET_WORTH = 7500;
const CLASH_MIN_NET_WORTH = 9000;
const TARGET_CLASH_PUZZLES = 30;
const TARGET_CLASH_CANDIDATES = 130;
const CLASH_MAX_NET_WORTH_DIFF = 4000;
const CLASH_MAX_DURATION_DIFF = 10 * 60;
const CLASH_MIN_RANK_GAP = 2;
// Items excluded from weirdness scoring (e.g. Meteor Hammer — used to end
// games when the enemy gives up, not an indicator of a weird build)
const EXCLUDED_ITEM_IDS = new Set([223]); // 223 = Meteor Hammer

// Patch filtering — only collect from ranked matches on 7.41+
const TARGET_PATCH_ID = 60;        // OpenDota numeric ID for 7.41
const TARGET_PATCH_DISPLAY = "7.41+"; // Display string

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
  aghanims_scepter?: number;
  aghanims_shard?: number;
  permanent_buffs?: Array<{
    permanent_buff: number;
    stack_count?: number;
  }>;
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
  kills: number;
  deaths: number;
  assists: number;
  aghsScepter: boolean;
  aghsShard: boolean;
}

interface ClashCandidate {
  id: string;
  matchId: number;
  heroId: number;
  heroName: string;
  items: number[];
  netWorth: number;
  lastHits: number;
  denies: number;
  duration: number;
  patch: string;
  win: boolean;
  rankBracket: string;
  rankNumber: number;
  kills: number;
  deaths: number;
  assists: number;
  aghsScepter: boolean;
  aghsShard: boolean;
}

interface ClashBuild {
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
  kills: number;
  deaths: number;
  assists: number;
  aghsScepter: boolean;
  aghsShard: boolean;
}

interface BuildClashPuzzle {
  id: string;
  buildA: ClashBuild;
  buildB: ClashBuild;
}

interface ExplorerRow {
  match_id: number | string;
  avg_rank_tier: number | string | null;
  duration: number | string;
}

interface ExplorerResponse {
  rows?: ExplorerRow[];
  data?: ExplorerRow[];
  result?: {
    rows?: ExplorerRow[];
  };
}

// ── Helpers ──

/** When OpenDota returns 429, wait this long before retry. */
const RATE_LIMIT_BACKOFF_MS = 20000;
/** Exit if we get only 429s for this long (no other HTTP response). */
const RATE_LIMIT_STALL_MAX_MS = 5 * 60 * 1000;

let lastNon429ResponseAt = Date.now();

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    if (res.status === 429) {
      if (Date.now() - lastNon429ResponseAt > RATE_LIMIT_STALL_MAX_MS) {
        console.error(
          "  OpenDota rate limit stall exceeded 5 minutes (no non-429 responses) — aborting seed.",
        );
        process.exit(1);
      }
      console.warn("  Rate limited, waiting 20s...");
      await sleep(RATE_LIMIT_BACKOFF_MS);
      return apiFetch(path);
    }
    lastNon429ResponseAt = Date.now();
    if (!res.ok) {
      console.warn(`  API ${res.status}: ${path}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    // Not a 429 stall — don't let repeated network errors look like a rate-limit loop.
    lastNon429ResponseAt = Date.now();
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

function rankTierToNumber(tier: number | null): number {
  if (!tier) return 0;
  const bracket = Math.floor(tier / 10);
  return bracket >= 1 && bracket <= 8 ? bracket : 0;
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

function hasPermanentBuff(
  player: MatchPlayer,
  permanentBuffId: number,
): boolean {
  if (!player.permanent_buffs || player.permanent_buffs.length === 0) {
    return false;
  }
  return player.permanent_buffs.some(
    (buff) => buff.permanent_buff === permanentBuffId,
  );
}

function hasItemInMainInventory(player: MatchPlayer, itemId: number): boolean {
  return (
    player.item_0 === itemId ||
    player.item_1 === itemId ||
    player.item_2 === itemId ||
    player.item_3 === itemId ||
    player.item_4 === itemId ||
    player.item_5 === itemId
  );
}

function hasAghsScepterEffect(player: MatchPlayer): boolean {
  // Sources in descending trust:
  // 1) explicit aghanims_scepter field
  // 2) permanent buff data
  // 3) carried scepter in final 6 slots
  return (
    player.aghanims_scepter === 1 ||
    hasPermanentBuff(player, 2) ||
    hasItemInMainInventory(player, 108)
  );
}

function hasAghsShardEffect(player: MatchPlayer): boolean {
  // Shard is primarily represented as a consumed upgrade effect.
  return player.aghanims_shard === 1 || hasPermanentBuff(player, 12);
}

// ── Hero item popularity (from OpenDota API) ──

/** Maps heroId -> itemId -> popularity rank (1 = most popular) */
type PopularityRankMap = Record<number, Record<string, number>>;

/**
 * Fetch item popularity for every hero from OpenDota's
 * /heroes/{id}/itemPopularity endpoint.
 *
 * Merges mid_game_items and late_game_items (most relevant for
 * final inventory), ranks the top 30 per hero.
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

    // Rank top 30 items by total count
    const sorted = Object.entries(merged).sort((a, b) => b[1] - a[1]);
    const ranks: Record<string, number> = {};
    for (let i = 0; i < Math.min(sorted.length, 30); i++) {
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
 *   - Items NOT in the top 30 for the hero: +1 (unusual)
 *   - Items ranked 11-30: 0 (neutral)
 *   - Items ranked 1-10 (most popular): -POPULAR_PENALTY each (penalized)
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
    if (EXCLUDED_ITEM_IDS.has(itemId)) continue; // skip excluded items entirely
    const item = items[itemId];
    if (!item || (item.cost !== null && item.cost < MIN_ITEM_COST)) continue;

    significant++;
    const rank = heroRanks[String(itemId)];
    const cost = item.cost ?? 0;
    const expensiveWeight = cost > EXPENSIVE_ITEM_COST ? EXPENSIVE_MULTIPLIER : 1.0;

    if (rank === undefined) {
      // Not in top 30 — unusual; expensive unusual items matter more
      unusualPoints += 1 * expensiveWeight;
    } else if (rank <= 10) {
      // Top 10 most popular — penalize
      unusualPoints -= POPULAR_PENALTY;
    }
    // Rank 11-30: neutral (0)
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

let explorerDisabled = false;

async function fetchMatchIdsFromExplorer(
  lastMatchId?: number,
): Promise<PublicMatch[] | null> {
  const where: string[] = [
    `avg_rank_tier >= ${MIN_RANK}`,
    `duration >= 1200`,
  ];
  if (lastMatchId) {
    where.push(`match_id < ${lastMatchId}`);
  }

  const sql = [
    "SELECT match_id, avg_rank_tier, duration",
    "FROM public_matches",
    `WHERE ${where.join(" AND ")}`,
    "ORDER BY match_id DESC",
    "LIMIT 500",
  ].join(" ");

  const res = await apiFetch<ExplorerResponse>(
    `/explorer?sql=${encodeURIComponent(sql)}`,
  );
  if (!res) return null;

  const rawRows = res.rows ?? res.data ?? res.result?.rows ?? [];
  return rawRows
    .map((row) => ({
      match_id: Number(row.match_id),
      avg_rank_tier:
        row.avg_rank_tier === null ? null : Number(row.avg_rank_tier),
      duration: Number(row.duration),
      radiant_win: false,
    }))
    .filter(
      (row) =>
        Number.isFinite(row.match_id) &&
        row.match_id > 0 &&
        Number.isFinite(row.duration),
    );
}

async function fetchRankedMatchBatch(
  lastMatchId?: number,
): Promise<{ matches: PublicMatch[]; source: "explorer" | "public" } | null> {
  if (!explorerDisabled) {
    const explorerMatches = await fetchMatchIdsFromExplorer(lastMatchId);
    if (explorerMatches === null) {
      explorerDisabled = true;
      console.warn("  Explorer unavailable, falling back to /publicMatches.");
    } else if (explorerMatches.length > 0) {
      return { matches: explorerMatches, source: "explorer" };
    }
  }

  const publicMatches = await fetchRankedMatches(lastMatchId);
  if (!publicMatches) return null;
  return { matches: publicMatches, source: "public" };
}

function toClashBuild(c: ClashCandidate): ClashBuild {
  return {
    id: c.id,
    hero: c.heroName,
    heroId: c.heroId,
    items: c.items,
    netWorth: c.netWorth,
    lastHits: c.lastHits,
    denies: c.denies,
    duration: c.duration,
    patch: c.patch,
    win: c.win,
    rankBracket: c.rankBracket,
    kills: c.kills,
    deaths: c.deaths,
    assists: c.assists,
    aghsScepter: c.aghsScepter,
    aghsShard: c.aghsShard,
  };
}

function pairClashCandidates(
  candidates: ClashCandidate[],
  targetPairs: number,
): BuildClashPuzzle[] {
  const sorted = [...candidates].sort((a, b) => a.duration - b.duration);
  const used = new Set<string>();
  const pairs: BuildClashPuzzle[] = [];

  for (let i = 0; i < sorted.length && pairs.length < targetPairs; i++) {
    const a = sorted[i];
    if (used.has(a.id)) continue;

    let bestIdx = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let j = i + 1; j < sorted.length; j++) {
      const b = sorted[j];
      if (used.has(b.id)) continue;
      if (a.matchId === b.matchId) continue;
      if (a.win === b.win) continue;
      if (Math.abs(a.netWorth - b.netWorth) > CLASH_MAX_NET_WORTH_DIFF) continue;
      if (Math.abs(a.duration - b.duration) > CLASH_MAX_DURATION_DIFF) continue;
      if (Math.abs(a.rankNumber - b.rankNumber) < CLASH_MIN_RANK_GAP) continue;

      const score = Math.abs(a.netWorth - b.netWorth) + Math.abs(a.duration - b.duration);
      if (score < bestScore) {
        bestScore = score;
        bestIdx = j;
      }
    }

    if (bestIdx === -1) continue;

    const b = sorted[bestIdx];
    used.add(a.id);
    used.add(b.id);
    pairs.push({
      id: `clash-${pairs.length + 1}`,
      buildA: toClashBuild(a),
      buildB: toClashBuild(b),
    });
  }

  return pairs;
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

  const clashOnly = process.argv.includes("--clash-only");

  // ── Step 2: Fetch matches and collect unusual-build puzzles ──
  const puzzles: Puzzle[] = [];
  const existingIds = new Set<string>();
  const clashCandidates: ClashCandidate[] = [];
  const clashCandidateIds = new Set<string>();
  let batches = 0;
  let lastMatchId: number | undefined;

  if (clashOnly) {
    if (!existsSync(PUZZLES_PATH)) {
      console.error(
        "Clash-only: src/data/puzzles.json is missing. Run a full `npm run seed:puzzles` first.",
      );
      process.exit(1);
    }
    const loaded = JSON.parse(readFileSync(PUZZLES_PATH, "utf-8")) as unknown;
    if (!Array.isArray(loaded) || loaded.length === 0) {
      console.error("Clash-only: puzzles.json is empty or not a puzzle array.");
      process.exit(1);
    }
    for (const row of loaded) {
      const p = row as Puzzle;
      if (p?.id) {
        existingIds.add(p.id);
        puzzles.push(p);
      }
    }
    if (puzzles.length === 0) {
      console.error("Clash-only: no valid puzzle id entries in puzzles.json.");
      process.exit(1);
    }
    console.log(
      `\n--clash-only: using ${puzzles.length} puzzle ids from src/data/puzzles.json (main pool and puzzles KV left unchanged).\n`,
    );
  } else {
  console.log(`\nTarget: ${TARGET_PUZZLES} puzzles from ranked matches on patch ${TARGET_PATCH_DISPLAY}\n`);

  while (puzzles.length < TARGET_PUZZLES && batches < MAX_BATCHES) {
    batches++;
    await sleep(RATE_LIMIT_MS);

    const batch = await fetchRankedMatchBatch(lastMatchId);
    if (!batch || batch.matches.length === 0) {
      console.warn("  No matches, retrying...");
      await sleep(3000);
      continue;
    }
    const batchMatches = batch.matches;
    const source = batch.source;

    lastMatchId = batchMatches[batchMatches.length - 1].match_id;

    console.log(
      `Batch ${batches}: ${batchMatches.length} matches from ${source} ` +
      `(puzzles: ${puzzles.length}/${TARGET_PUZZLES})`,
    );

    // Fetch details for a subset of matches
    const matchesToDetail =
      source === "explorer" ? EXPLORER_MATCHES_TO_DETAIL : MATCHES_TO_DETAIL;
    for (const pm of batchMatches.slice(0, matchesToDetail)) {
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
      if (detail.duration < 1200) continue;

      // Use avg_rank_tier from the publicMatches response (more reliable than detail)
      const pmAvgRankTier = pm.avg_rank_tier;

      // Track which teams already contributed a puzzle in this match
      // (player_slot 0-127 = Radiant, 128-255 = Dire)
      const matchTeamCollected = new Set<"radiant" | "dire">();

      for (const player of detail.players) {
        if (puzzles.length >= TARGET_PUZZLES) break;

        const hero = heroes[player.hero_id];
        if (!hero) continue;

        const team: "radiant" | "dire" = player.player_slot < 128 ? "radiant" : "dire";
        if (matchTeamCollected.has(team)) continue;

        const playerItems = [
          player.item_0, player.item_1, player.item_2,
          player.item_3, player.item_4, player.item_5,
        ].filter((id) => id !== 0);

        if (playerItems.length < 3) continue;

        // Filter: minimum net worth
        if ((player.net_worth || 0) < MIN_NET_WORTH) continue;

        const score = unusualScore(
          player.hero_id,
          playerItems,
          items,
          popularity,
        );
        if (score < UNUSUAL_THRESHOLD) continue;
        const aghsScepter = hasAghsScepterEffect(player);
        const aghsShard = hasAghsShardEffect(player);

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
          kills: player.kills || 0,
          deaths: player.deaths || 0,
          assists: player.assists || 0,
          aghsScepter,
          aghsShard,
        });

        existingIds.add(puzzleId);
        matchTeamCollected.add(team);
        console.log(
          `  [${puzzles.length}] ${hero.localized_name} (NW: ${player.net_worth}) score=${score.toFixed(2)}`,
        );
      }

      // Collect Build Clash candidates from the same fetched match to reduce extra API calls.
      for (const player of detail.players) {
        const hero = heroes[player.hero_id];
        if (!hero) continue;

        const playerItems = [
          player.item_0, player.item_1, player.item_2,
          player.item_3, player.item_4, player.item_5,
        ].filter((id) => id !== 0);
        if (playerItems.length < 3) continue;
        if ((player.net_worth || 0) < CLASH_MIN_NET_WORTH) continue;

        const score = unusualScore(player.hero_id, playerItems, items, popularity);
        if (score < UNUSUAL_THRESHOLD) continue;
        const aghsScepter = hasAghsScepterEffect(player);
        const aghsShard = hasAghsShardEffect(player);

        const candidateId = `${detail.match_id}-${player.hero_id}`;
        if (existingIds.has(candidateId) || clashCandidateIds.has(candidateId)) continue;

        const rankNumber = rankTierToNumber(pmAvgRankTier);
        if (rankNumber === 0) continue;

        clashCandidates.push({
          id: candidateId,
          matchId: detail.match_id,
          heroId: hero.id,
          heroName: hero.name,
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
          rankNumber,
          kills: player.kills || 0,
          deaths: player.deaths || 0,
          assists: player.assists || 0,
          aghsScepter,
          aghsShard,
        });
        clashCandidateIds.add(candidateId);
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

  } // !clashOnly

  // ── Step 3: Ensure enough Build Clash candidates ──
  let clashBatches = 0;
  while (clashCandidates.length < TARGET_CLASH_CANDIDATES && clashBatches < MAX_BATCHES) {
    clashBatches++;
    await sleep(RATE_LIMIT_MS);

    const batch = await fetchRankedMatchBatch(lastMatchId);
    if (!batch || batch.matches.length === 0) {
      console.warn("  No matches for clash candidates, retrying...");
      await sleep(3000);
      continue;
    }
    const batchMatches = batch.matches;
    const source = batch.source;

    lastMatchId = batchMatches[batchMatches.length - 1].match_id;
    console.log(
      `Clash batch ${clashBatches}: ${batchMatches.length} matches from ${source} ` +
      `(candidates: ${clashCandidates.length}/${TARGET_CLASH_CANDIDATES})`,
    );

    const matchesToDetail =
      source === "explorer" ? EXPLORER_MATCHES_TO_DETAIL : MATCHES_TO_DETAIL;
    for (const pm of batchMatches.slice(0, matchesToDetail)) {
      if (clashCandidates.length >= TARGET_CLASH_CANDIDATES) break;
      await sleep(RATE_LIMIT_MS);
      const detail = await apiFetch<MatchDetail>(`/matches/${pm.match_id}`);
      if (!detail?.players) continue;
      if (detail.patch !== TARGET_PATCH_ID) continue;
      if (detail.lobby_type !== RANKED_LOBBY_TYPE) continue;
      if (detail.game_mode === TURBO_GAME_MODE) continue;
      if (detail.duration < 1200) continue;

      const rankNumber = rankTierToNumber(pm.avg_rank_tier);
      if (rankNumber === 0) continue;

      for (const player of detail.players) {
        if (clashCandidates.length >= TARGET_CLASH_CANDIDATES) break;
        const hero = heroes[player.hero_id];
        if (!hero) continue;

        const playerItems = [
          player.item_0, player.item_1, player.item_2,
          player.item_3, player.item_4, player.item_5,
        ].filter((id) => id !== 0);
        if (playerItems.length < 3) continue;
        if ((player.net_worth || 0) < CLASH_MIN_NET_WORTH) continue;

        const score = unusualScore(player.hero_id, playerItems, items, popularity);
        if (score < UNUSUAL_THRESHOLD) continue;
        const aghsScepter = hasAghsScepterEffect(player);
        const aghsShard = hasAghsShardEffect(player);

        const candidateId = `${detail.match_id}-${player.hero_id}`;
        if (existingIds.has(candidateId) || clashCandidateIds.has(candidateId)) continue;

        clashCandidates.push({
          id: candidateId,
          matchId: detail.match_id,
          heroId: hero.id,
          heroName: hero.name,
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
          rankBracket: rankTierToName(pm.avg_rank_tier),
          rankNumber,
          kills: player.kills || 0,
          deaths: player.deaths || 0,
          assists: player.assists || 0,
          aghsScepter,
          aghsShard,
        });
        clashCandidateIds.add(candidateId);
      }
    }
  }

  // ── Step 4: Build clash puzzle pairs ──
  const clashPuzzles = pairClashCandidates(clashCandidates, TARGET_CLASH_PUZZLES);
  writeFileSync(CLASH_PUZZLES_PATH, JSON.stringify(clashPuzzles, null, 2));
  console.log(`Saved ${clashPuzzles.length} clash puzzles to src/data/clash-puzzles.json`);
  if (clashPuzzles.length < TARGET_CLASH_PUZZLES) {
    console.warn(
      `  Warning: Only found ${clashPuzzles.length}/${TARGET_CLASH_PUZZLES} clash pairs. ` +
      "Try increasing MAX_BATCHES or lowering UNUSUAL_THRESHOLD.",
    );
  }

  // Upload to KV for production
  if (clashOnly) {
    console.log("  Skipped puzzles:all KV upload (--clash-only).");
  } else {
    await uploadPuzzlesToKV(puzzles);
  }
  await uploadClashPuzzlesToKV(clashPuzzles);

  // Reset local stats file (for dev fallback)
  if (clashOnly) {
    console.log("  Skipped puzzle-global-stats.json reset (--clash-only).");
  } else {
    writeFileSync(GLOBAL_STATS_PATH, "{}");
    console.log("  Reset local puzzle-global-stats.json");
  }

  // Only bump the localStorage persist key when explicitly requested
  if (process.argv.includes("--reset-progress")) {
    bumpGameStoreVersion();
  } else {
    console.log("  Skipped persist key bump (pass --reset-progress to reset user progress)");
  }
}

/**
 * Upload all puzzles to Upstash Redis (KV) so the production app
 * can read them without needing puzzles.json in the repo.
 */
async function uploadPuzzlesToKV(puzzles: Puzzle[]): Promise<void> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.log("  No KV credentials found — skipped KV upload (local file only)");
    return;
  }

  const redis = new Redis({ url, token });
  await redis.set("puzzles:all", puzzles);
  console.log(`  Uploaded ${puzzles.length} puzzles to KV (key: puzzles:all)`);
}

async function uploadClashPuzzlesToKV(puzzles: BuildClashPuzzle[]): Promise<void> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.log("  No KV credentials found — skipped clash KV upload (local file only)");
    return;
  }

  const redis = new Redis({ url, token });
  await redis.set("puzzles:clash-all", puzzles);
  console.log(`  Uploaded ${puzzles.length} clash puzzles to KV (key: puzzles:clash-all)`);
}

/**
 * Increment the version number in the game store persist key
 * (e.g. "reported-game-v6" -> "reported-game-v7") so that all
 * users' localStorage progress is automatically discarded on
 * next visit after new puzzles are seeded.
 */
function bumpGameStoreVersion(): void {
  const src = readFileSync(GAME_STORE_PATH, "utf-8");
  const match = src.match(/name:\s*"reported-game-v(\d+)"/);
  if (!match) {
    console.warn("  Could not find persist key in game-store.ts — skipping version bump.");
    return;
  }
  const oldVersion = parseInt(match[1], 10);
  const newVersion = oldVersion + 1;
  const updated = src.replace(
    `name: "reported-game-v${oldVersion}"`,
    `name: "reported-game-v${newVersion}"`,
  );
  writeFileSync(GAME_STORE_PATH, updated);
  console.log(`  Bumped persist key: reported-game-v${oldVersion} -> reported-game-v${newVersion} (user progress will reset)`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
