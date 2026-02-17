# Changelog

## v0.4.0 — 2026-02-17

### Fixed

- **Puzzle no longer ends when leaving early**: in-progress daily and puzzles-mode state (current guess level, results) is now persisted to localStorage; navigating to the main menu and returning restores your position
- **"Daily Challenge Stats" alignment**: title and stat boxes are now properly centered on the main menu, including in Russian
- **Win/Loss and Rank answers translated**: result feedback now shows "Победа"/"Поражение" and rank names (Герольд, Архонт, etc.) in Russian instead of raw English strings
- **"Would you report this build?" no longer repeats**: surveyed puzzle IDs are persisted; re-entering a completed daily puzzle won't re-show the survey

### Changed

- **Puzzle pool reduced from 150 to 50** with much stricter build filtering: `UNUSUAL_THRESHOLD` raised to 0.65, `POPULAR_PENALTY` raised to 0.4 per top-5 popular item, minimum player net worth of 7,000 gold; Meteor Hammer excluded from weirdness scoring (used to end games, not a weird build choice)
- **KDA guessing reworked to 4-option quiz**: instead of 20 KDA buckets, players now pick from 4 options (1 real + 3 fake, deterministically generated per puzzle); KDA is now Level 2 (easier), Rank Bracket is now Level 3 (harder)
- **Rank bracket buttons now show medal images**: Dota 2 rank medal icons from Steam CDN displayed alongside rank names
- **Puzzles mode reworked to flat grid**: replaced 4 levels of 5 puzzles with a 2×10 grid of 20 individually selectable puzzles; completed puzzles show score and are locked; users can attempt any puzzle in any order
- Server-side puzzle loader no longer caches in memory — re-seeding `puzzles.json` takes effect on next request without rebuilding
- Game store localStorage key bumped to `reported-game-v4`; all prior progress is reset on upgrade
- Seed script pulls more matches per run (`MAX_BATCHES` 120, `MATCHES_TO_DETAIL` 25) to compensate for stricter filtering

### Added

- **Hard Mode** toggle in Settings: hides net worth and creep stats on the puzzle card; "REPORTED" logo turns red in header and main menu
- `hardMode` setting in Zustand settings store, persisted to localStorage
- `translateAnswer()` helper for locale-aware display of Win/Loss and rank bracket strings
- `kdaOptions` field on `PuzzlePublic` (4 shuffled KDA bucket options generated server-side)
- `kills`, `deaths`, `assists` fields on `Puzzle` data model (stored in `puzzles.json`)
- Per-puzzle completion tracking (`completedPuzzles`, `puzzleScores`) replacing per-level tracking
- `surveyedPuzzleIds` persisted array to deduplicate the report survey
- Daily in-progress persistence fields (`dailyCurrentLevel`, `dailyPuzzleId`)
- Puzzles in-progress persistence fields (`puzzlesInProgressIndex`, `puzzlesInProgressLevel`, `puzzlesInProgressResults`)
- Translation keys for rank brackets, Win/Loss answers, hard mode, and updated puzzle grid UI

### Removed

- Old 4-level Puzzles mode (`PUZZLES_LEVEL_COUNT`, `PUZZLES_PER_LEVEL`, `getPuzzleLevelAssignments`, `completedLevels`, `levelScores`, `advanceToNextPuzzle`, `returnToLevelSelect`)
- 20-option KDA bucket grid (replaced by 4-option quiz)
- "Next Puzzle" and "Level Complete!" buttons from ScoreCard
- In-memory puzzle cache in `puzzles-server.ts`

---

## v0.3.0 — 2026-02-17

### Fixed

- Matches are now **exclusively ranked**: seed script filters by `lobby_type === 7` (Ranked Matchmaking) and excludes Turbo (`game_mode === 23`), not just by player rank medal
- **Rank bracket no longer always shows Archon**: puzzle creation now uses `avg_rank_tier` from the `/publicMatches` response (guaranteed non-null) instead of the match detail endpoint (which returned null); fallback changed from "Archon" to "Unknown"
- **Puzzles loading fixed**: added try-catch error handling to `/api/puzzle/daily` and `/api/puzzle/level` GET handlers, and hardened `puzzles-server.ts` with file existence checks and parse error logging
- **KDA buckets corrected**: `KDA_BUCKETS` constant regenerated to match actual `classifyKda()` output (20 valid bucket combinations, previously mismatched assist ranges)

### Changed

- Puzzle pool now targets **patch 7.40+** (OpenDota uses main patch IDs only, not letter sub-patches)
- **Role/lane badges replaced with net worth and creep stats**: PuzzleCard now shows final net worth (e.g. "12.3k gold") and last hits/denies (e.g. "245 / 12 CS") instead of "Core" / "Roaming" labels, which were inaccurate for most builds
- **Build uniqueness scoring improved**: replaced binary popular/not-popular item check with weighted scoring — top-5 most popular items per hero now penalize the score (-0.1 each), items outside top 20 count as unusual (+1), items ranked 6–20 are neutral; threshold raised from 0.3 to 0.4
- **Item popularity source replaced**: self-built Phase 1 sampling (200 matches) replaced with OpenDota's `GET /heroes/{id}/itemPopularity` endpoint (~125 API calls, one per hero); merges `mid_game_items` and `late_game_items`, ranks top 20 per hero; cached to `hero-item-popularity.json`
- Seed script simplified from two-phase loop to linear flow: fetch/load popularity, then collect puzzles

### Added

- **Russian language support**: lightweight i18n system with `src/i18n/en.ts` and `src/i18n/ru.ts` (~80 translation keys), `useTranslation()` hook with interpolation, all UI components translated
- **Language selector**: header flag icon opens modal with English and Russian options (with flag icons); selected language persisted to localStorage
- **Colorblind mode**: toggle in Settings modal swaps green/red to blue/orange via CSS variable overrides (`.colorblind` class on `<body>`); persisted to localStorage
- **"Would you report this build?" survey**: appears after completing all 3 guesses, yes/no buttons, non-blocking; responses saved via `POST /api/survey/report` to `src/data/survey-responses.json`
- Settings Zustand store (`settings-store.ts`) with `locale` and `colorblindMode`, persisted to localStorage
- `SettingsProvider` component applies colorblind class and `lang` attribute globally
- `formatNetWorth()` utility for compact gold display
- Russian flag SVG icon component

### Removed

- `role` and `lane` fields from `Puzzle` and `PuzzlePublic` interfaces
- `inferPosition()`, `inferRole()`, and `laneRoleName()` functions from seed script and `puzzle-utils.ts`
- Placeholder "No settings available yet" text in Settings modal
- "More languages coming soon" placeholder in Language modal

---

## v0.2.0 — 2026-02-14

### Changed

- **Puzzles mode** replaces Practice mode: 4 levels of 5 puzzles each (20 total), same puzzles and order for everyone, with per-level completion tracking
- Puzzle pool re-seeded from **ranked matches only** on **patch 7.40b**, with hero-item popularity baseline recalibrated from ranked data
- Main menu stats now track **Daily Challenge only** (labeled "Daily Challenge Stats")
- Patch version displayed in main menu instead of on individual puzzle cards
- Daily Challenge re-entry now correctly shows completed results instead of blank screen

### Added

- LevelSelect component with completion state (green checkmark + score for finished levels)
- `/api/puzzle/level` API route for serving puzzles by level and index
- Deterministic level assignment function (fixed seed, same for all players)
- Two-phase seed script: builds popularity baseline from ranked match data, then scores builds
- Match ID shown on results screen (links to OpenDota match page)
- Settings button (cog icon) in header with placeholder modal
- Language selector button (flag icon) in header — English only for now
- Footer with "About Us" and "Privacy Policy" links
- About Us modal with game description and Valve trademark disclaimer
- Privacy Policy placeholder modal
- Reusable Modal component

### Removed

- Practice mode and `/api/puzzle/random` API route
- Patch display from PuzzleCard component (moved to main menu)

---

## v0.1.0 — 2026-02-13

Initial project setup.

### Added

- Next.js 16 project with TypeScript, Tailwind CSS v4, and App Router
- OpenDota data pipeline: seed scripts for hero/item constants and puzzle data
- 150 seeded puzzles featuring unusual/off-meta builds from real public matches
- Hero item popularity cache for all 127 heroes (used to detect unusual builds)
- Daily Challenge mode: one deterministic puzzle per day (hash-based selection)
- Practice mode: unlimited random puzzles from the seeded pool
- Three-level guessing flow: Win/Loss, Rank Bracket, KDA Range
- API routes: `/api/puzzle/daily`, `/api/puzzle/random`, `/api/constants`
- Server-side guess validation with answer reveal
- Zustand game store with localStorage persistence for daily progress, streaks, and stats
- Dark Dota 2-themed UI (muted golds, reds, dark backgrounds)
- PuzzleCard component: hero portrait, items grid, role/lane badges, duration, patch
- GuessPanel component with level indicator and per-level guess UIs
- ResultFeedback component with animated correct/incorrect reveals
- ScoreCard with share-to-clipboard and daily countdown timer
- Hero and item image rendering via Steam CDN
- Responsive layout optimized for quick queue-time sessions
