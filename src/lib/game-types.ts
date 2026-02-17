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
  kdaOptions: string[];  // 4 shuffled KDA bucket options (1 real + 3 fake)
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

// ── KDA Buckets ──

export const KDA_BUCKETS = [
  "0-3 / 0-3 / 0-4",
  "0-3 / 0-3 / 5-9",
  "0-3 / 4-7 / 0-4",
  "0-3 / 4-7 / 5-9",
  "0-3 / 8+ / 0-4",
  "0-3 / 8+ / 5-9",
  "4-7 / 0-3 / 5-9",
  "4-7 / 0-3 / 10-14",
  "4-7 / 4-7 / 5-9",
  "4-7 / 4-7 / 10-14",
  "4-7 / 8+ / 5-9",
  "4-7 / 8+ / 10-14",
  "8-12 / 0-3 / 10-14",
  "8-12 / 0-3 / 15+",
  "8-12 / 4-7 / 10-14",
  "8-12 / 4-7 / 15+",
  "8-12 / 8+ / 10-14",
  "8-12 / 8+ / 15+",
  "13+ / 0-3 / 15+",
  "13+ / 4-7 / 15+",
] as const;

export type KdaBucket = (typeof KDA_BUCKETS)[number];

// ── Game state ──

export type GameMode = "daily" | "puzzles";

// ── Puzzles mode ──

/** Total puzzles in the Puzzles mode grid */
export const PUZZLES_TOTAL = 20;

/** Grid layout for Puzzles mode */
export const PUZZLES_GRID_COLS = 10;
export const PUZZLES_GRID_ROWS = 2;

export type GuessLevel = 1 | 2 | 3;

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
