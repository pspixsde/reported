"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/i18n";

interface AghsIndicatorProps {
  aghsScepter?: boolean;
  aghsShard?: boolean;
  className?: string;
}

export function AghsIndicator({
  aghsScepter = false,
  aghsShard = false,
  className,
}: AghsIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <AghsStatusIcon
        src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/ultimate_scepter.png"
        alt={t("puzzle.aghs")}
        active={aghsScepter}
        title={t("puzzle.aghs")}
      />
      <AghsStatusIcon
        src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/aghanims_shard.png"
        alt={t("puzzle.shard")}
        active={aghsShard}
        title={t("puzzle.shard")}
      />
    </div>
  );
}

function AghsStatusIcon({
  src,
  alt,
  active,
  title,
}: {
  src: string;
  alt: string;
  active: boolean;
  title: string;
}) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border transition-all",
        active
          ? "border-dota-gold/60 bg-dota-gold/10 shadow-[0_0_10px_rgba(201,168,76,0.28)]"
          : "border-dota-border/60 bg-dota-bg/30",
      )}
      title={title}
    >
      <Image
        src={src}
        alt={alt}
        width={28}
        height={28}
        className={cn(
          "h-7 w-7 object-contain transition-all",
          active ? "opacity-100 saturate-110" : "opacity-35 grayscale saturate-0",
        )}
        unoptimized
      />
    </div>
  );
}
