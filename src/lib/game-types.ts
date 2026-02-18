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
  kdaOptions: string[];   // 4 shuffled literal KDA options (1 real + 3 fake)
  heroOptions?: number[]; // 4 shuffled hero IDs for hard mode (1 real + 3 fake)
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

/** Rank medal emoticon images from the Dota 2 wiki */
export const RANK_MEDAL_URLS: Record<RankBracket, string> = {
  Herald: "https://static.wikia.nocookie.net/dota2_gamepedia/images/8/87/Emoticon_Ranked_Herald.png/revision/latest?cb=20190212051846",
  Guardian: "https://static.wikia.nocookie.net/dota2_gamepedia/images/4/43/Emoticon_Ranked_Guardian.png/revision/latest?cb=20190212051853",
  Crusader: "https://static.wikia.nocookie.net/dota2_gamepedia/images/2/2d/Emoticon_Ranked_Crusader.png/revision/latest?cb=20190212051853",
  Archon: "https://static.wikia.nocookie.net/dota2_gamepedia/images/1/13/Emoticon_Ranked_Archon.png/revision/latest?cb=20190212051853",
  Legend: "https://static.wikia.nocookie.net/dota2_gamepedia/images/1/18/Emoticon_Ranked_Legend.png/revision/latest?cb=20190212051853",
  Ancient: "https://static.wikia.nocookie.net/dota2_gamepedia/images/d/d8/Emoticon_Ranked_Ancient.png/revision/latest?cb=20190212051853",
  Divine: "https://static.wikia.nocookie.net/dota2_gamepedia/images/6/6d/Emoticon_Ranked_Divine.png/revision/latest?cb=20190212051853",
  Immortal: "https://static.wikia.nocookie.net/dota2_gamepedia/images/3/3e/Emoticon_Ranked_Immortal.png/revision/latest?cb=20190212051853",
};

// ── Game state ──

export type GameMode = "daily" | "puzzles";

// ── Puzzles mode ──

/** Total puzzles per mode grid (regular or hard) */
export const PUZZLES_TOTAL = 30;
/** Total hard-mode puzzles */
export const HARD_PUZZLES_TOTAL = 30;
/** Daily challenge puzzle buffer size */
export const DAILY_POOL_SIZE = 30;

/** Index offsets into puzzles.json (90 puzzles: 0-29 regular, 30-59 hard, 60-89 daily) */
export const REGULAR_POOL_START = 0;
export const HARD_POOL_START = 30;
export const DAILY_POOL_START = 60;

/** Grid layout for Puzzles mode */
export const PUZZLES_GRID_COLS = 10;
export const PUZZLES_GRID_ROWS = 3;

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
