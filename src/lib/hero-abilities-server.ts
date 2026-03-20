import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import type { FacetInfo } from "./game-types";

const HERO_ABILITIES_FILE = resolve(process.cwd(), "src/data/hero-abilities.json");

let cachedHeroFacets: Record<string, FacetInfo[]> | null = null;

function loadHeroFacets(): Record<string, FacetInfo[]> {
  if (cachedHeroFacets) return cachedHeroFacets;
  if (!existsSync(HERO_ABILITIES_FILE)) return {};

  try {
    cachedHeroFacets = JSON.parse(
      readFileSync(HERO_ABILITIES_FILE, "utf-8"),
    ) as Record<string, FacetInfo[]>;
    return cachedHeroFacets;
  } catch {
    return {};
  }
}

export function getFacetsForHero(heroName: string): FacetInfo[] {
  const facets = loadHeroFacets();
  const key = heroName.startsWith("npc_dota_hero_")
    ? heroName
    : `npc_dota_hero_${heroName}`;
  return facets[key] ?? [];
}

export function getHeroFacetByVariant(
  heroName: string,
  heroVariant?: number,
): FacetInfo | undefined {
  const facets = getFacetsForHero(heroName);
  if (facets.length === 0) return undefined;

  if (heroVariant && heroVariant > 0) {
    const idx = heroVariant - 1;
    if (idx >= 0 && idx < facets.length) {
      return facets[idx];
    }
  }

  return facets[0];
}
