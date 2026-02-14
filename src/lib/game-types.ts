// ── Puzzle data model ──

export interface Puzzle {
  id: string;
  hero: string;          // internal name, e.g. "pudge"
  heroId: number;        // OpenDota hero_id
  items: number[];       // item IDs (final 6 inventory slots)
  role: string;          // e.g. "Hard Support (Pos 5)"
  lane: string;          // e.g. "Safe Lane"
  duration: number;      // match duration in seconds
  patch: string;         // e.g. "7.35d"
  // Answers — only sent after guessing / revealing
  win: boolean;
  rankBracket: RankBracket;
  kdaBucket: string;     // e.g. "5-10 / 0-5 / 10-15"
}

/** Puzzle data sent to the client (answers stripped) */
export interface PuzzlePublic {
  id: string;
  hero: string;
  heroId: number;
  items: number[];
  role: string;
  lane: string;
  duration: number;
  patch: string;
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
  "0-3 / 0-3 / 0-5",
  "4-7 / 0-3 / 5-10",
  "4-7 / 4-7 / 5-10",
  "8-12 / 0-3 / 10-20",
  "8-12 / 4-7 / 10-20",
  "13+ / 0-3 / 15+",
  "13+ / 4-7 / 15+",
  "0-3 / 8+ / 0-10",
  "4-7 / 8+ / 5-15",
  "8+ / 8+ / 10+",
] as const;

export type KdaBucket = (typeof KDA_BUCKETS)[number];

// ── Game state ──

export type GameMode = "daily" | "practice";

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
