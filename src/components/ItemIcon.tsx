"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";

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

  const imgSrc = itemName
    ? `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${itemName}.png`
    : `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${itemId}.png`;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded border border-dota-border/30",
        className,
      )}
      title={displayName}
    >
      <Image
        src={imgSrc}
        alt={displayName}
        width={46}
        height={34}
        className="object-cover"
        unoptimized
      />
    </div>
  );
}
