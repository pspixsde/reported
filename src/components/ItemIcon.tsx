"use client";

import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";

/**
 * Item art lives on Steam's CDN. Valve serves from both `cdn.steamstatic.com` and
 * `cdn.cloudflare.steamstatic.com`; the former is the host users often get after
 * redirects and matches the in-game / Web API paths. We use a single base so URLs
 * match what works in a normal browser tab.
 */
const STEAM_DOTA_CDN = "https://cdn.steamstatic.com";

function itemImageUrl(
  item: { name?: string; img?: string } | undefined,
  itemId: number,
  itemName: string,
): string {
  if (item?.img) {
    const path = item.img.startsWith("/") ? item.img : `/${item.img}`;
    return `${STEAM_DOTA_CDN}${path}`;
  }
  if (itemName) {
    return `${STEAM_DOTA_CDN}/apps/dota2/images/dota_react/items/${itemName}.png`;
  }
  return `${STEAM_DOTA_CDN}/apps/dota2/images/dota_react/items/${itemId}.png`;
}

interface ItemIconProps {
  itemId: number;
  className?: string;
}

export function ItemIcon({ itemId, className }: ItemIconProps) {
  const items = useGameStore((s) => s.items);

  if (itemId === 0) {
    return (
      <div
        className={cn(
          "h-[34px] w-[46px] rounded border border-dota-border/50 bg-dota-bg/30",
          className,
        )}
      />
    );
  }

  const item = items?.[itemId];
  const displayName = item?.dname || `Item ${itemId}`;
  const itemName = item?.name || "";
  const imgSrc = itemImageUrl(item, itemId, itemName);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded border border-dota-border/30",
        className,
      )}
      title={displayName}
    >
      <img
        src={imgSrc}
        alt={displayName}
        width={46}
        height={34}
        className="h-[34px] w-[46px] object-cover"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
