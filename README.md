# REPORTED

A Wordle-inspired guessing game for Dota 2 players. You're shown a real ranked match featuring an unusual, off-meta build and challenged to guess the outcome.

**Live at [reported-dota.org](https://reported-dota.org)**

## How to Play

You see real match data — items, match duration, and more — from a ranked game with an unusual build. Then you guess:

1. **Win or Loss** — did this player win?
2. **KDA** — what was their kills/deaths/assists?
3. **Rank Bracket** — Herald through Immortal

Score 0–3 based on correct guesses, then share your results with friends.

### Hard Mode

In Hard Mode, there's an extra first level: **Guess the Hero** from the items alone. The hero is hidden until you answer, giving you 4 levels and a 0–4 score.

## Game Modes

- **Daily Challenge** — one puzzle per day, same for everyone
- **Puzzles** — 30 puzzles per mode (regular + hard), complete them all
  - Progress is saved if you leave mid-puzzle and resume later
  - Global stats show how other players scored on each puzzle

## Languages

English, Russian (Русский), Spanish (Español), and Portuguese (Português).

## Getting Started

```bash
# Install dependencies
npm install

# Fetch hero & item data from OpenDota
npm run seed:constants

# Seed puzzle data from ranked matches (takes ~7 min due to API rate limits)
npm run seed:puzzles

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Zustand** (client state with localStorage persistence)
- **OpenDota API** (match data, hero/item assets)

## Project Structure

```
src/
  app/           — pages and API routes
  components/    — React UI components
  data/          — cached JSON (heroes, items, puzzles)
  i18n/          — translation files (en, ru, es, pt)
  lib/           — utilities, types, API helpers
  stores/        — Zustand game state
scripts/         — data seeding scripts
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run seed:constants` | Fetch hero/item data from OpenDota |
| `npm run seed:puzzles` | Fetch ranked puzzles from latest patch |

## Credits

All match data comes from the [OpenDota](https://www.opendota.com) API.

Dota 2 is a registered trademark of Valve Corporation. Valve Corporation does not endorse or sponsor this project.
