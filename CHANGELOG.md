# Changelog

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
