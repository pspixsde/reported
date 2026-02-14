# Changelog

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
