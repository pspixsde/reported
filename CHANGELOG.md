# Changelog

## v1.0.1 — 2026-02-18

### Fixed

- **Rank medal images now self-hosted**: replaced unreliable Fandom wiki hotlinks with locally served PNGs in `public/ranks/`, fixing images not loading for some users
- Removed stale `static.wikia.nocookie.net` remote pattern from `next.config.ts`

### Changed

- **Version number shown in footer**: app version displayed in the bottom-right corner
- **README** updated with link to GitHub Issues for bug reports and feedback

### Added

- **Favicon and apple-touch-icon**: gold "R" on dark navy, appears in browser tabs and iOS bookmarks
- **Open Graph metadata**: proper title, description, and site name for social media link previews (Discord, Twitter, etc.)
- **Vercel Web Analytics** integrated for anonymous page view tracking

### Removed

- Unused `/play` redirect route
- `zod` dependency (was never imported)

---

## v1.0.0 — 2026-02-18

First public release — live at [reported-dota.org](https://reported-dota.org).

### Highlights

- Deployed to **Vercel** with custom domain
- Puzzle data and global stats powered by **Upstash Redis** (no sensitive data in the public repo)
- All puzzle answers removed from version control for security
- Zero personal data collected — fully privacy-respecting

### Infrastructure

- Production storage migrated from local JSON files to Upstash Redis (KV)
- Seed script uploads puzzles to KV automatically when credentials are available
- Local development falls back to file-based storage seamlessly
- `.env.example` added for easy onboarding

---

## v0.6.1 — 2026-02-18

### Fixed

- **Hard mode hero reveal**: hero portrait and name are now revealed immediately after completing level 1 (hero guess), rather than staying hidden until the entire puzzle is finished
- **Puzzle in-progress resume**: leaving a puzzle mid-level and returning now correctly resumes from where you stopped; opening a different puzzle no longer silently discards the previous puzzle's progress
- **"Copy Results" link** updated to `reported-dota.org`

### Changed

- **Hidden hero text** in hard mode simplified from "??? (Guess the hero!)" to "???"
- **"Hero: name"** line removed from the results/score card
- **"Average score"** label renamed to **"Average Global Score"** in results
- **"Completed today"** in the daily challenge card no longer shows the score
- **Language selector** now always displays language names in their native language (e.g. "Русский" instead of "Russian")
- **Puzzle counts extended**: 30 puzzles per mode (up from 20), daily pool expanded to 30 (up from 10), 90 total collected (up from 50)
- **MIN_NET_WORTH** raised from 7,000 to 7,500 in `seed-puzzles.ts`
- **UNUSUAL_THRESHOLD** raised from 0.65 to 0.7 in `seed-puzzles.ts`
- **Seed script team limit**: at most one unusual build per team per match is collected, preventing two puzzles from the same side of a game
- **Seed script progress reset** is now opt-in: the localStorage persist key bump only happens when `--reset-progress` is passed, so re-running the script no longer auto-resets all user progress
- **README** rewritten for the public repository
- In-progress puzzles now show a visual indicator on the puzzle grid

### Added

- **Upstash Redis (KV) storage**: global stats, survey data, and puzzle data are now stored in Upstash Redis for production (Vercel); local development falls back to file-based storage automatically
- **Puzzle data secured**: `puzzles.json` (containing answers), stats, survey, and popularity files are gitignored — puzzle solutions are no longer exposed in the public repository
- **Seed script uploads to KV**: `seed-puzzles` now uploads puzzles to Redis when KV credentials are available, so production reads from KV instead of the filesystem
- **Portuguese language support**: full translation of all UI strings, Portuguese flag in language selector
- **"Ranked Only" badge** on the main menu alongside "Patch 7.40+"
- **Social links** (GitHub + Ko-fi) on the main menu and below puzzle results
- Puzzle grid highlights the in-progress puzzle with a gold indicator
- `.env.example` documenting required environment variables

## v0.6.0 — 2026-02-18

### Fixed

- **Hard mode level indicator no longer overflows**: the "1 Hero — 2 Win/Loss — 3 KDA — 4 Rank" progress line in hard mode now uses tighter spacing (reduced gap, padding, and separator width) so it stays within the box; normal 3-level mode spacing is unchanged

### Changed

- **"Easy Mode" renamed to "More Stats"** in Settings; description no longer mentions "Green logo." (EN, RU, ES)
- **KDA options are more distinct**: fake KDA values now vary by ±2–7 per component (up from ±1–4) with a minimum-distance check (at least 3 total absolute difference) between all options, preventing near-identical choices
- **Seed script (`seed-puzzles.ts`) tuning**:
  - Minimum match duration raised from 15 to 20 minutes
  - `MIN_ITEM_COST` raised from 1,000 to 1,200 gold
  - Hero item popularity now stores the top 30 items per hero (up from 20)
  - Unusual build scoring updated: top 10 items penalized (was top 5), items ranked 11–30 neutral (was 6–20), items outside top 30 unusual (was top 20)
- **Hard mode score messages reworked** for the 0–4 system: added "Not great, but could be worse." at score 1 and shifted existing messages; normal 0–3 messages unchanged
- **Seed script now auto-resets user progress**: running `seed-puzzles` bumps the game store localStorage version key (e.g. `v6` → `v7`) and clears `puzzle-global-stats.json`, ensuring all users start fresh with the new puzzle set
- Game store localStorage key bumped to `reported-game-v6`; all prior progress is reset on upgrade

### Added

- **Global puzzle stats**: server-tracked statistics visible to all users
  - While guessing each level, a small stat shows what % of players guessed it right (with "today" suffix for daily puzzles)
  - After completing a puzzle, the average user score is shown below the player's score
  - After voting in "Would you report this build?", the report percentage is now shown alongside the thank-you message
  - New `puzzle-global-stats.json` data file with per-puzzle, per-level, and daily-partitioned stats
  - New `GET /api/stats/puzzle` endpoint; guess and survey endpoints now record stats server-side
  - `stats-server.ts` shared helper library for reading/writing global stats
  - `puzzleGlobalStats` state and `fetchPuzzleStats` action in game store
- **Spanish language support**: full translation of all UI strings (~150 keys), Spanish flag icon in language selector
- `score.hard.0`–`score.hard.4` translation keys for 4-level hard mode scoring (EN, RU, ES)
- `lang.es` translation key in all locale files
- `survey.reportPercent`, `stats.levelCorrect`, `stats.levelCorrect.daily`, `stats.avgScore` i18n keys (EN, RU, ES)

---

## v0.5.0 — 2026-02-17

### Fixed

- **Rank medal images now display correctly**: replaced broken Steam CDN URLs (returning 404) with Dota 2 wiki emoticon images for all 8 rank brackets; added `static.wikia.nocookie.net` to Next.js `remotePatterns`
- **"Copy Results" missing in Puzzles mode**: share button now appears for both Daily and Puzzles modes; "Back to Puzzles" remains as a secondary action below it

### Changed

- **Net worth and creep stats hidden by default**: previously shown unless Hard Mode was on; now hidden for all modes unless Easy Mode is enabled in Settings
- **KDA guessing uses literal values**: instead of KDA range buckets (e.g., "0-3 / 8+ / 0-4"), players now see actual KDA strings (e.g., "5/1/5"); 3 fake KDAs generated by varying each component ±1–4 from the real values
- **Hard Mode completely reworked**: no longer a setting — now a toggle on the Puzzles grid page; enables 20 alternate hard puzzles with hero hidden and a 4-level guessing flow (Guess Hero → Win/Loss → KDA → Rank, scored /4); red-themed grid buttons; does not affect Daily Challenge
- **Easy Mode replaces old Hard Mode in Settings**: reveals net worth and creep stats for all modes; turns REPORTED logo green in header and main menu
- **Puzzle pool partitioned into 3 fixed pools**: 50 puzzles split by index — regular (0–19), hard (20–39), daily buffer (40–49); no more shuffle-based assignment
- **Daily puzzle selection is now sequential**: cycles through the 10-puzzle daily pool (one per day, repeating after 10 days) instead of hash-based selection from the entire pool
- **Weirdness scoring amplified for expensive items**: unusual items costing more than 4,000 gold now score 1.5× weirdness weight in the seed script
- **Completed puzzles are now revisitable**: clicking a completed puzzle in the grid opens it in read-only mode showing the original results; grid buttons no longer disabled for completed puzzles
- Game store localStorage key bumped to `reported-game-v5`; all prior progress is reset on upgrade
- Score display adapts to mode: shows `/3` for normal/daily, `/4` for hard mode; share text reflects the correct max

### Added

- **Puzzle navigation arrows**: when playing a puzzle, left/right chevron buttons navigate to the previous/next puzzle without returning to the grid; a "Grid" button provides quick return to level selection
- **Puzzles mode stats**: games played and accuracy percentage displayed below the puzzle grid, with separate tracking for regular and hard mode
- **Hero Guess level** (Hard Mode only): 4 hero portrait options (1 real + 3 fake, deterministically generated); hidden hero shown as "???" placeholder in PuzzleCard
- `PuzzleNavigation` component with prev/next arrows, puzzle counter, and grid button
- `heroOptions` field on `PuzzlePublic` for hard-mode hero guessing (generated server-side via `generateHeroOptions()`)
- `getAllHeroIds()` helper in `puzzles-server.ts` for hero option generation
- `easyMode` setting in Zustand settings store, persisted to localStorage
- `puzzlesHardMode` toggle in game store (persisted, controls hard mode in Puzzles grid)
- Hard mode state tracking: `completedHardPuzzles`, `hardPuzzleScores`, `hardPuzzleResults`, hard in-progress persistence fields
- `puzzleResults` / `hardPuzzleResults` persisted per-puzzle result arrays (enables revisiting completed puzzles)
- Puzzles mode stats fields: `puzzlesGamesPlayed`, `puzzlesTotalScore`, `hardPuzzlesGamesPlayed`, `hardPuzzlesTotalScore`
- Pool partitioning constants: `REGULAR_POOL_START`, `HARD_POOL_START`, `DAILY_POOL_START`, `DAILY_POOL_SIZE`, `HARD_PUZZLES_TOTAL`
- `RANK_MEDAL_URLS` constant mapping all 8 rank brackets to Dota 2 wiki emoticon image URLs
- `GuessLevel` type expanded to `1 | 2 | 3 | 4` for hard mode support
- `/api/puzzle/level` now accepts `hard=true` query param and `hard` field in POST body
- Translation keys for Easy Mode, hero guess, hard mode toggle, puzzle stats, navigation, updated KDA prompt (EN + RU)

### Removed

- `hardMode` from settings store (replaced by `easyMode` in settings and `puzzlesHardMode` in game store)
- `KDA_BUCKETS` constant and `KdaBucket` type from `game-types.ts`
- `classifyKda()` and `bucketValue()` functions from `puzzle-utils.ts`
- Hash-based daily puzzle selection (`djb2Hash("reported-daily-...")` approach)
- Shuffle-based puzzle assignment (`getPuzzleAssignments` with Fisher-Yates)
- `rankNameToNumber` usage in rank medal image URL construction (replaced by direct URL lookup)
- Old `settings.hardMode` / `settings.hardMode.desc` translation keys

---

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
