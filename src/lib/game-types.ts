// ── Puzzle data model ──

export interface Puzzle {
  id: string;
  hero: string;          // internal name, e.g. "pudge"
  heroId: number;        // OpenDota hero_id
  items: number[];       // item IDs (final 6 inventory slots)
  netWorth: number;      // final net worth in gold
  lastHits: number;      // creeps killed
  denies: number;        // creeps denied
  duration: number;      // match duration in seconds
  patch: string;         // e.g. "7.40c"
  // Answers — only sent after guessing / revealing
  win: boolean;
  rankBracket: RankBracket;
  kdaBucket: string;     // e.g. "4-7 / 0-3 / 5-9"
  kills: number;
  deaths: number;
  assists: number;
  aghsScepter: boolean;
  aghsShard: boolean;
  facet?: FacetInfo;
}

/** Puzzle data sent to the client (answers stripped) */
export interface PuzzlePublic {
  id: string;
  hero: string;
  heroId: number;
  items: number[];
  netWorth: number;
  lastHits: number;
  denies: number;
  duration: number;
  patch: string;
  kdaOptions: string[];   // 4 shuffled literal KDA options (1 real + 3 fake)
  heroOptions?: number[]; // 4 shuffled hero IDs for hard mode (1 real + 3 fake)
  aghsScepter: boolean;
  aghsShard: boolean;
  facet?: FacetInfo;
  facetOptions?: (FacetInfo | null)[];
}

export interface FacetInfo {
  name: string;
  title: string;
  icon: string;
  color: string;
}

export interface ClashBuild {
  id: string; // "matchId-heroId"
  hero: string;
  heroId: number;
  items: number[];
  netWorth: number;
  lastHits: number;
  denies: number;
  duration: number;
  patch: string;
  win: boolean;
  rankBracket: RankBracket;
  kills: number;
  deaths: number;
  assists: number;
  aghsScepter: boolean;
  aghsShard: boolean;
  facet?: FacetInfo;
}

export interface BuildClashPuzzle {
  id: string;
  buildA: ClashBuild;
  buildB: ClashBuild;
}

export interface BuildClashPublic {
  id: string;
  buildA: Omit<ClashBuild, "win" | "rankBracket" | "kills" | "deaths" | "assists">;
  buildB: Omit<ClashBuild, "win" | "rankBracket" | "kills" | "deaths" | "assists">;
  rankOptions: [RankBracket, RankBracket];
}

// ── Rank brackets ──

export const RANK_BRACKETS = [
  "Herald",
  "Guardian",
  "Crusader",
  "Archon",
  "Legend",
  "Ancient",
  "Divine",
  "Immortal",
] as const;

export type RankBracket = (typeof RANK_BRACKETS)[number];

/** OpenDota uses 1-8 for rank tiers */
export const rankNumberToName: Record<number, RankBracket> = {
  1: "Herald",
  2: "Guardian",
  3: "Crusader",
  4: "Archon",
  5: "Legend",
  6: "Ancient",
  7: "Divine",
  8: "Immortal",
};

export const rankNameToNumber: Record<RankBracket, number> = {
  Herald: 1,
  Guardian: 2,
  Crusader: 3,
  Archon: 4,
  Legend: 5,
  Ancient: 6,
  Divine: 7,
  Immortal: 8,
};

/** Rank medal images (self-hosted in public/ranks/) */
export const RANK_MEDAL_URLS: Record<RankBracket, string> = {
  Herald: "/ranks/herald.png",
  Guardian: "/ranks/guardian.png",
  Crusader: "/ranks/crusader.png",
  Archon: "/ranks/archon.png",
  Legend: "/ranks/legend.png",
  Ancient: "/ranks/ancient.png",
  Divine: "/ranks/divine.png",
  Immortal: "/ranks/immortal.png",
};

// ── Game state ──

export type GameMode = "daily" | "puzzles" | "clash";

// ── Puzzles mode ──

/** Total puzzles per mode grid (regular or hard) */
export const PUZZLES_TOTAL = 20;
/** Total hard-mode puzzles */
export const HARD_PUZZLES_TOTAL = 20;
/** Daily challenge puzzle buffer size */
export const DAILY_POOL_SIZE = 30;
/** Build Clash daily pool size */
export const CLASH_POOL_SIZE = 30;

/** Index offsets into puzzles.json (70 puzzles: 0-19 regular, 20-39 hard, 40-69 daily) */
export const REGULAR_POOL_START = 0;
export const HARD_POOL_START = 20;
export const DAILY_POOL_START = 40;

/** Grid layout for Puzzles mode */
export const PUZZLES_GRID_COLS = 10;
export const PUZZLES_GRID_ROWS = 2;

export type GuessLevel = 1 | 2 | 3 | 4;

export interface LevelResult {
  guess: string;
  correct: boolean;
  answer: string;
}

export interface GameState {
  mode: GameMode;
  puzzleId: string;
  currentLevel: GuessLevel;
  results: LevelResult[];
  completed: boolean;
  score: number; // 0-3
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  gameState: GameState;
}

// ── API types ──

export interface GuessRequest {
  puzzleId: string;
  level: GuessLevel;
  guess: string;
}

export interface GuessResponse {
  correct: boolean;
  answer: string;
}

// ── Hero & Item constants ──

export interface HeroConstant {
  id: number;
  name: string;          // internal name, e.g. "npc_dota_hero_pudge"
  localized_name: string; // display name, e.g. "Pudge"
  img: string;           // image path fragment
  icon: string;          // icon path fragment
  primary_attr: string;
  attack_type: string;
  roles: string[];
}

export interface ItemConstant {
  id: number;
  name: string;          // internal name, e.g. "blink"
  img: string;
  dname: string;         // display name
  cost: number | null;
}
