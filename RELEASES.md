# What's New

---

## v1.1.1

- Removed **Facet** support across data pipeline and app UI to align with Dota patch **7.41**
- Seeding now skips hero facet constants entirely and outputs puzzle payloads without facet fields
- Refreshed monthly **Puzzles** and **Build Clash** datasets with the updated no-facets pipeline

---

## v1.1.0

- Added **Build Clash** as a third mode: a daily two-build duel with 3 levels (winner, better KDA, rank assignment)
- Added **Facet** display across Daily, Puzzles, Hard hero options, and both Build Clash builds
- Reworked **Puzzles mode**: now shows **20 Standard + 20 Hard** puzzles on one page (no hard-mode toggle needed)
- Updated Puzzles card copy to: **"20 standard and 20 hard puzzles. Complete them all."**
- Removed **streaks** from the app to simplify progress tracking
- Replaced the puzzles monthly timer with a cleaner message: **"New puzzles every month!"**
- Fixed **Back to Menu** navigation so it consistently returns to the main menu from all pages
- Restyled **Back to Menu** controls so they look and feel like proper buttons
- Refreshed the **main menu layout**: Daily Challenge is now highlighted as a wider top card, with Puzzles and Build Clash below
- Simplified **main menu stats** to show only **Daily Challenge Stats**
- Added a **visual polish pass** with a richer background and upgraded card presentation
- Upgraded **Build Clash presentation** with a VS duel marker and animated rank swap interaction on level 3
- Improved **Build Clash wording**: players are shown as **Player 1 / Player 2** (instead of A/B), and rank-match results are now cleaner and easier to read
- Build Clash level 2 now reveals both players’ **K/D/A + KDA ratio** after you guess
- Fixed the level 3 swap animation to avoid the previous double-swap visual effect
- Build Clash rank swap now keeps **Player 1 / Player 2** labels fixed while only the medal icons animate
- Fixed missing **Aghanim’s Scepter/Shard effect badges** by improving seed detection from OpenDota’s Aghanim fields
- Simplified the **Puzzles grid info area**: removed separate Standard/Hard completion counters and separate stat blocks, replaced with one combined stats summary under the hard grid
- Tightened Build Clash pairing quality: max match duration gap is now **10 minutes** (was 15)
- Fixed missing **Facet badges** in Daily and standard Puzzles views
- Added a manual exception so **Gleipnir counts as popular on Weaver** in puzzle scoring
- Added dedicated pages/routes for **Home**, **Daily**, **Puzzles**, and **Build Clash**
- Improved search visibility and indexing
- Fixed a daily stats issue where the first player of the day could briefly see old "today" global stats
- Improved KDA option generation to reduce answer pattern exploits
- Updated README with a visible **Ko-fi** support link

---

## v1.0.1

- Fixed rank medal images not showing for some players
- Fixed a bug where the daily puzzle could show as already completed when it shouldn't
- App version now visible in the footer
- Added a website icon (browser tab and mobile bookmarks)
- Links shared on Reddit, Discord, and Twitter now show a rich preview card with image
- Improved search engine visibility — the site is now easier to find on Google

---

## v1.0.0 — Launch!

**Reported** is live at [reported-dota.org](https://reported-dota.org)!

A Wordle-inspired guessing game for Dota 2 players. You see a real ranked match with an unusual build and guess what happened.

### Game Modes

- **Daily Challenge** — one puzzle per day, same for everyone
- **Puzzles** — 30 puzzles in regular mode, 30 in hard mode — complete them all at your own pace

### Hard Mode

The hero is hidden. Guess it from the items alone, then continue with Win/Loss, KDA, and Rank — 4 levels, scored out of 4.

### Features

- Global stats: see what % of players guessed each level correctly
- "Would you report this build?" — vote and see what others think
- Share your results with friends (copy-paste or screenshot)
- Progress saved automatically — leave and come back anytime
- Colorblind mode available in Settings

### Languages

English, Russian, Spanish, and Portuguese.

---

## Earlier versions

For the full development history, see [CHANGELOG.md](./CHANGELOG.md).
