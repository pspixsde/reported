# Reported

A Wordle-like web game for Dota 2 players. Guess the outcome of real matches featuring unusual, off-meta builds.

## How to Play

You're shown a real ranked match with an unusual build — the hero, their items, role, lane, and match duration. Then you guess:

1. **Win or Loss** — did this player win?
2. **Rank Bracket** — Herald through Immortal
3. **KDA Range** — kills / deaths / assists bucket

Score 0–3 based on correct guesses. Share your results with friends.

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

## Game Modes

- **Daily Challenge** — one puzzle per day, same for everyone (stats tracked here)
- **Puzzles** — 4 levels of 5 puzzles each, same for everyone, complete them all

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Zustand** (client state)
- **OpenDota API** (match data, hero/item assets)

## Project Structure

```
src/
  app/           — pages and API routes
  components/    — React UI components
  data/          — cached JSON (heroes, items, puzzles)
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
