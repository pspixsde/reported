"use client";

import { useGameStore } from "@/stores/game-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useTranslation } from "@/i18n";
import { HeroIcon } from "./HeroIcon";
import { ItemIcon } from "./ItemIcon";
import { FacetBadge } from "./FacetBadge";
import { AghsIndicator } from "./AghsIndicator";
import { formatDuration, formatNetWorth } from "@/lib/puzzle-utils";

export function ClashPuzzleCard() {
  const { t } = useTranslation();
  const clashPuzzle = useGameStore((s) => s.clashPuzzle);
  const heroes = useGameStore((s) => s.heroes);
  const easyMode = useSettingsStore((s) => s.easyMode);

  if (!clashPuzzle) return null;

  const builds = [
    { key: "A", title: t("clash.player1"), build: clashPuzzle.buildA },
    { key: "B", title: t("clash.player2"), build: clashPuzzle.buildB },
  ] as const;

  return (
    <div className="relative w-full max-w-4xl">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[calc(100%-2.5rem)] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-dota-border to-transparent sm:hidden" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[calc(100%-2rem)] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-dota-border to-transparent sm:block" />
      <div className="clash-vs-badge pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dota-red/50 bg-dota-red/85 text-lg font-black tracking-widest text-white shadow-[0_0_24px_rgba(233,69,96,0.35)]">
        VS
      </div>

      <div className="grid w-full gap-8 sm:grid-cols-2 sm:gap-6">
        {builds.map(({ key, title, build }) => {
          const hero = heroes?.[build.heroId];
          const heroDisplayName = hero?.localized_name || build.hero;

          return (
            <div
              key={key}
              className="rounded-xl border border-dota-border bg-dota-surface/85 p-4 backdrop-blur-sm"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-dota-text-dim">
                {title}
              </p>

              <div className="flex items-center gap-3">
                <HeroIcon
                  heroName={build.hero}
                  localizedName={heroDisplayName}
                  size="md"
                />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-dota-text">
                    {heroDisplayName}
                  </h2>
                  <FacetBadge facet={build.facet} className="mt-1" />
                </div>
              </div>

              <div className="mt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-dota-text-dim">
                  {t("puzzle.items")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {build.items.map((itemId, i) => (
                    <ItemIcon key={`${key}-${itemId}-${i}`} itemId={itemId} />
                  ))}
                </div>
                <AghsIndicator
                  className="mt-2"
                  aghsScepter={build.aghsScepter}
                  aghsShard={build.aghsShard}
                />
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm text-dota-text-dim">
                <span>{formatDuration(build.duration)}</span>
                {easyMode && (
                  <span>{t("puzzle.gold", { value: formatNetWorth(build.netWorth) })}</span>
                )}
                {easyMode && (
                  <span>{t("puzzle.cs", { lastHits: build.lastHits, denies: build.denies })}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
