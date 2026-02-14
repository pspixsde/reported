/**
 * Fetch hero and item constants from OpenDota and cache locally.
 * Run with: npm run seed:constants
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://api.opendota.com/api";
const DATA_DIR = resolve(__dirname, "../src/data");

interface RawHero {
  id: number;
  name: string;
  localized_name: string;
  img: string;
  icon: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
}

interface RawItem {
  id: number;
  img: string;
  dname: string;
  cost: number | null;
  components: string[] | null;
}

async function main() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  console.log("Fetching heroes from OpenDota...");
  const heroesRaw = await fetch(`${BASE_URL}/constants/heroes`).then((r) =>
    r.json(),
  );

  // Transform heroes into a clean lookup: { [heroId]: { ... } }
  const heroes: Record<
    number,
    {
      id: number;
      name: string;
      localized_name: string;
      img: string;
      icon: string;
      primary_attr: string;
      attack_type: string;
      roles: string[];
    }
  > = {};

  for (const [, hero] of Object.entries(heroesRaw) as [string, RawHero][]) {
    heroes[hero.id] = {
      id: hero.id,
      name: hero.name.replace("npc_dota_hero_", ""),
      localized_name: hero.localized_name,
      img: hero.img,
      icon: hero.icon,
      primary_attr: hero.primary_attr,
      attack_type: hero.attack_type,
      roles: hero.roles,
    };
  }

  writeFileSync(
    resolve(DATA_DIR, "heroes.json"),
    JSON.stringify(heroes, null, 2),
  );
  console.log(`  Saved ${Object.keys(heroes).length} heroes.`);

  console.log("Fetching items from OpenDota...");
  const itemsRaw = await fetch(`${BASE_URL}/constants/items`).then((r) =>
    r.json(),
  );

  // Transform items: { [itemId]: { ... } }
  // Also build a name→id lookup
  const items: Record<
    number,
    { id: number; name: string; dname: string; img: string; cost: number | null }
  > = {};

  for (const [name, item] of Object.entries(itemsRaw) as [
    string,
    RawItem,
  ][]) {
    if (!item.id) continue;
    items[item.id] = {
      id: item.id,
      name,
      dname: item.dname || name,
      img: item.img,
      cost: item.cost ?? null,
    };
  }

  writeFileSync(
    resolve(DATA_DIR, "items.json"),
    JSON.stringify(items, null, 2),
  );
  console.log(`  Saved ${Object.keys(items).length} items.`);

  console.log("Done! Constants cached in src/data/");
}

main().catch((err) => {
  console.error("Error fetching constants:", err);
  process.exit(1);
});
