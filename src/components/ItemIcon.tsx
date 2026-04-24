"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";

/**
 * Item art lives on Steam's CDN. Valve serves from both `cdn.steamstatic.com` and
 * `cdn.cloudflare.steamstatic.com`; the former is the host users often get after
 * redirects. We use a single primary base, then on failure try cache-bust-free paths
 * and the Cloudflare mirror.
 */
const STEAM_DOTA_CDN = "https://cdn.steamstatic.com";
const STEAM_DOTA_CDN_ALT = "https://cdn.cloudflare.steamstatic.com";

function buildCandidateUrls(
  item: { name?: string; img?: string } | undefined,
  nId: number,
  itemName: string,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  const add = (u: string) => {
    if (seen.has(u)) return;
    seen.add(u);
    out.push(u);
  };

  if (item?.img) {
    const path = item.img.startsWith("/") ? item.img : `/${item.img}`;
    const noQuery = path.split("?")[0]!;

    add(`${STEAM_DOTA_CDN}${path}`);
    if (noQuery !== path) {
      add(`${STEAM_DOTA_CDN}${noQuery}`);
    }
    add(`${STEAM_DOTA_CDN_ALT}${noQuery}`);
  } else if (itemName) {
    const p = `/apps/dota2/images/dota_react/items/${itemName}.png`;
    add(`${STEAM_DOTA_CDN}${p}`);
    add(`${STEAM_DOTA_CDN_ALT}${p}`);
  } else {
    // Weak fallback — filenames are not numeric on Steam, but this may work for
    // legacy or debug entries
    const p = `/apps/dota2/images/dota_react/items/${nId}.png`;
    add(`${STEAM_DOTA_CDN}${p}`);
    add(`${STEAM_DOTA_CDN_ALT}${p}`);
  }

  return out;
}

interface ItemIconProps {
  itemId: number | string;
  className?: string;
}

export function ItemIcon({ itemId, className }: ItemIconProps) {
  const items = useGameStore((s) => s.items);
  const nId = typeof itemId === "string" ? parseInt(itemId, 10) : itemId;
  const validId = !Number.isNaN(nId) && nId > 0;
  const item = validId && items != null ? items[nId] : undefined;
  const displayName = item?.dname || (validId ? `Item ${nId}` : "Item");
  const itemName = item?.name || "";

  const candidates = useMemo(
    () => (validId ? buildCandidateUrls(item, nId, itemName) : []),
    [item, nId, itemName, validId],
  );

  const [urlIndex, setUrlIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const src = candidates[urlIndex];

  useEffect(() => {
    setUrlIndex(0);
    setImageFailed(false);
  }, [candidates, nId, items, item?.id]);

  const onError = useCallback(() => {
    setUrlIndex((i) => {
      if (i + 1 < candidates.length) return i + 1;
      setImageFailed(true);
      return i;
    });
  }, [candidates.length]);

  if (nId === 0) {
    return (
      <div
        className={cn(
          "h-[34px] w-[46px] rounded border border-dota-border/50 bg-dota-bg/30",
          className,
        )}
      />
    );
  }

  if (!validId) {
    return (
      <div
        className={cn(
          "h-[34px] w-[46px] rounded border border-dota-border/50 bg-dota-bg/30",
          className,
        )}
        title="Invalid item"
      />
    );
  }

  if (items == null) {
    return (
      <div
        className={cn(
          "h-[34px] w-[46px] animate-pulse rounded border border-dota-border/30 bg-dota-bg/50",
          className,
        )}
        title={displayName}
        aria-hidden
      />
    );
  }

  if (candidates.length === 0 || !src || imageFailed) {
    return (
      <div
        className={cn(
          "h-[34px] w-[46px] rounded border border-dota-border/50 bg-dota-bg/30",
          className,
        )}
        title={displayName}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded border border-dota-border/30",
        className,
      )}
      title={displayName}
    >
      <img
        key={src}
        src={src}
        alt={displayName}
        width={46}
        height={34}
        className="h-[34px] w-[46px] object-cover"
        loading="lazy"
        decoding="async"
        onError={onError}
      />
    </div>
  );
}
