# Changelog

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
