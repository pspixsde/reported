# Puzzle data maintenance manual

This guide covers the **monthly** workflow for refreshing REPORTED’s puzzle pools (Daily, Puzzles, Build Clash) and what to do when a seed step fails.

Production reads puzzle data from **Upstash Redis** (`puzzles:all`, `puzzles:clash-all`). Local dev can use the same JSON files under `src/data/`.

---

## Before you start

1. **Repo & deps**
   ```bash
   git pull origin main
   npm install
   ```

2. **Environment** — copy `.env.example` → `.env.local` and set:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`  
   Without these, seeds still write local JSON but **skip KV upload** (fine for testing, not for production).

3. **Time** — plan **~10–15 minutes** for a full refresh (`seed:puzzles`), longer if you delete the popularity cache (~2+ extra minutes for ~120 hero API calls).

4. **OpenDota** — scripts rate-limit (~1.1s between calls). Occasional `429` backoffs are normal; sustained failures are covered below.

---

## Monthly checklist (recommended order)

Use this once per month (or after a Dota patch you care about) to keep pools fresh.

| Step | Command | What it updates |
|------|---------|-----------------|
| 1 | `npm run seed:constants` | `src/data/heroes.json`, `src/data/items.json` |
| 2 | *(optional)* Delete `src/data/hero-item-popularity.json` | Forces rebuild of “normal build” baseline on next seed |
| 3 | `npm run seed:puzzles` | Main pool + Clash + KV upload |
| 4 | Verify output (see [Verify](#verify-success)) |
| 5 | Commit `src/data/clash-puzzles.json` + any constant changes; push `main` |
| 6 | Confirm Vercel deploy; spot-check [reported-dota.org](https://reported-dota.org) |

### Split workflow (faster iteration)

If you only need one pool:

| Goal | Command |
|------|---------|
| Daily + Puzzles only (~70 builds, `puzzles:all` KV) | `npm run seed:pool` |
| Build Clash only (`puzzles:clash-all` KV) | `npm run seed:clash` *(requires existing `src/data/puzzles.json` for ID dedup)* |
| KV upload only (no OpenDota fetch) | `npm run upload:puzzles-kv` *(main pool file only)* |

`seed:clash` does **not** upload the main pool. Full monthly refresh is still easiest with `npm run seed:puzzles`.

### After a new Dota patch

1. Look up the new patch’s OpenDota numeric ID (e.g. on [OpenDota patches](https://docs.opendota.com/#tag/patches)).
2. In `scripts/seed-puzzles.ts`, update:
   - `TARGET_PATCH_ID`
   - `TARGET_PATCH_DISPLAY` (label shown in puzzles)
3. Run `npm run seed:constants`, then the full seed from step 3 above.

Until the patch ID is updated, seeds only pull matches tagged with the old patch.

### Resetting user progress (rare)

Only when you intentionally want everyone’s **saved game state** cleared (new persist key):

```bash
npm run seed:puzzles -- --reset-progress
```

Same flag works with `seed:pool` or `seed:clash`. This bumps `reported-game-vN` in `src/stores/game-store.ts` and commits that change. Do **not** use for routine monthly updates.

---

## What each script produces

| Output | Path / KV key | Git |
|--------|----------------|-----|
| Main pool (70 puzzles) | `src/data/puzzles.json` → `puzzles:all` | **gitignored** (answers stay private) |
| Build Clash (30 pairs) | `src/data/clash-puzzles.json` → `puzzles:clash-all` | **committed** |
| Popularity baseline | `src/data/hero-item-popularity.json` | gitignored |
| Heroes / items | `src/data/heroes.json`, `items.json` | committed |

**Pool layout** (`puzzles.json`): indices 0–19 standard Puzzles, 20–39 hard, 40–69 Daily rotation source.

---

## Verify success

After seeding, confirm:

1. **Console**
   - Main: `Done! Saved 70 puzzles` (warnings if fewer are OK but investigate if &lt; 60).
   - Clash: `Saved 30 clash puzzles` (warn if &lt; 30).
   - KV: `Uploaded N puzzles to KV` / `Uploaded N clash puzzles to KV` — if you see “skipped KV upload”, fix `.env.local`.

2. **Files**
   - `src/data/puzzles.json` exists locally (not in git).
   - `src/data/clash-puzzles.json` updated (diff should show new match/hero IDs).

3. **Production**
   - Redeploy or wait for Vercel after push — serverless functions cache puzzle arrays in memory until cold start.
   - Hit Daily, a Puzzles card, and Build Clash; confirm items/heroes render.

---

## Troubleshooting by stage

### `npm run seed:constants` fails

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| `OpenDota /constants/heroes failed` | API down or network | Retry in a few minutes; check https://api.opendota.com/api/constants/heroes |
| Non-200 / parse error | Transient API | Re-run `seed:constants` |
| Missing `src/data` | First run | Script creates the folder; ensure write permissions |

### “Run seed:constants first” (seed puzzles)

| Symptom | Fix |
|---------|-----|
| Missing `heroes.json` or `items.json` | Run `npm run seed:constants` |

### Popularity cache (Step 1 inside `seed-puzzles`)

| Symptom | Fix |
|---------|-----|
| Many `Skipped hero N (no data)` | Normal for a few heroes; if most fail, OpenDota may be degraded — retry later |
| `Legacy format detected, will rebuild` | Automatic; wait for full hero loop |
| Stale weirdness after meta shift | Delete `src/data/hero-item-popularity.json` and re-run seed |

### Main pool fetch (batches / match details)

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| `No matches, retrying...` | Explorer/public list empty for cursor | Let it retry; increase patience |
| `Explorer unavailable, falling back to /publicMatches` | Explorer SQL endpoint down | **Expected** — script continues on public matches |
| `Rate limited, waiting 20s...` | OpenDota 429 | Wait; script retries |
| `Rate limit stall exceeded 5 minutes — aborting` | Too many 429s in a row | Wait 15–30 min; re-run `seed:pool` or `seed:puzzles` |
| `Warning: Only found X/70 puzzles` | Thresholds too strict or patch has few ranked games | See [Tuning](#tuning-thresholds) |
| `API 4xx/5xx` on `/matches/{id}` | Bad match id or API blip | Usually skipped; if constant, check OpenDota status |

### Build Clash (candidates + pairing)

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| `Clash-only: puzzles.json is missing` | No main pool file | Run `npm run seed:pool` or full `seed:puzzles` first |
| `Warning: Only found X/30 clash pairs` | Not enough candidates or pairing rules too tight | Re-run `seed:clash` with more batches, or lower thresholds (see Tuning) |
| Long clash phase after main pool | Extra batches until 130 candidates | Normal; or run `seed:clash` separately later |

Clash pairing requires (per pair): different matches, **opposite** win/loss, net worth within **4000**, duration within **10 minutes**, rank gap ≥ **2**.

### KV upload

| Symptom | Fix |
|---------|-----|
| `No KV credentials found — skipped KV upload` | Add `KV_REST_API_URL` and `KV_REST_API_TOKEN` to `.env.local`; re-run seed or `upload:puzzles-kv` |
| `upload:puzzles-kv` — missing file | Run `seed:pool` / `seed:puzzles` first |
| Production still shows old puzzles after KV update | Trigger Vercel redeploy (push to `main` or manual redeploy) to clear in-memory cache |

### `--clash-only` and `--puzzles-only`

Cannot pass both flags together. Use:

- **`seed:pool`** — main pool + `puzzles:all` only  
- **`seed:clash`** — clash file + `puzzles:clash-all` only (needs local `puzzles.json` for dedup)

---

## Tuning thresholds

Edit constants at the top of `scripts/seed-puzzles.ts` only when you understand the tradeoff (weirder vs. enough volume):

| Constant | Default | Effect if lowered |
|----------|---------|-------------------|
| `UNUSUAL_THRESHOLD` | `0.7` | More builds qualify as “weird” |
| `MIN_NET_WORTH` | `7500` | More main-pool candidates |
| `CLASH_MIN_NET_WORTH` | `9000` | More clash candidates |
| `MAX_BATCHES` | `120` | Script stops earlier (may yield fewer puzzles) |
| `TARGET_PATCH_ID` | `60` (7.41+) | Must match current ranked patch |

After tuning, re-run the appropriate seed command and verify counts.

---

## Quick reference

```bash
# Full monthly refresh (recommended)
npm run seed:constants
npm run seed:puzzles

# Partial
npm run seed:pool          # Daily + Puzzles only
npm run seed:clash         # Build Clash only
npm run upload:puzzles-kv  # Push existing puzzles.json to KV

# Production deploy
git add src/data/clash-puzzles.json src/data/heroes.json src/data/items.json
git commit -m "chore: refresh puzzle data for <month/patch>"
git push origin main
```

See also [README.md](./README.md) (scripts table) and [RELEASES.md](./RELEASES.md) (version history).
