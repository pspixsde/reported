const BASE_URL = "https://api.opendota.com/api";

const HERO_CDN =
  "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes";
const ITEM_CDN =
  "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items";

/** Rate-limited fetch — OpenDota free tier is 60 req/min */
async function odFetch<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OpenDota ${res.status}: ${url}`);
  }
  return res.json() as Promise<T>;
}

/** Tiny sleep helper for rate limiting */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Public match list ──

export interface PublicMatch {
  match_id: number;
  match_seq_num: number;
  radiant_win: boolean;
  start_time: number;
  duration: number;
  avg_rank_tier: number | null;
}

export async function getPublicMatches(
  minRank?: number,
  maxRank?: number,
): Promise<PublicMatch[]> {
  let path = "/publicMatches";
  const params: string[] = [];
  if (minRank) params.push(`min_rank=${minRank}`);
  if (maxRank) params.push(`max_rank=${maxRank}`);
  if (params.length) path += `?${params.join("&")}`;
  return odFetch<PublicMatch[]>(path);
}

// ── Match details ──

export interface MatchPlayer {
  account_id: number | null;
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
  lane_role: number;       // 1=safe, 2=mid, 3=off, 4=jungle
  is_roaming: boolean | null;
  win: number;             // 0 or 1
}

export interface MatchDetail {
  match_id: number;
  radiant_win: boolean;
  duration: number;
  start_time: number;
  patch: number;
  players: MatchPlayer[];
  avg_rank_tier: number | null;
}

export async function getMatchDetail(matchId: number): Promise<MatchDetail> {
  return odFetch<MatchDetail>(`/matches/${matchId}`);
}

// ── Hero constants ──

export async function getHeroes(): Promise<Record<string, unknown>> {
  return odFetch<Record<string, unknown>>("/constants/heroes");
}

// ── Item constants ──

export async function getItems(): Promise<Record<string, unknown>> {
  return odFetch<Record<string, unknown>>("/constants/items");
}

// ── Hero item popularity (for detecting unusual builds) ──

export interface ItemPopularity {
  start_game_items: Record<string, number>;
  early_game_items: Record<string, number>;
  mid_game_items: Record<string, number>;
  late_game_items: Record<string, number>;
}

export async function getHeroItemPopularity(
  heroId: number,
): Promise<ItemPopularity> {
  return odFetch<ItemPopularity>(`/heroes/${heroId}/itemPopularity`);
}

// ── CDN helpers ──

/** Get hero portrait URL from internal name like "pudge" */
export function heroImageUrl(heroName: string): string {
  return `${HERO_CDN}/${heroName}.png`;
}

/** Get item image URL from internal name like "blink" */
export function itemImageUrl(itemName: string): string {
  return `${ITEM_CDN}/${itemName}.png`;
}
