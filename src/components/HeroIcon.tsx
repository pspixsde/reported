"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";

interface HeroIconProps {
  heroName: string;
  localizedName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { width: 48, height: 27 },
  md: { width: 128, height: 72 },
  lg: { width: 256, height: 144 },
};

export function HeroIcon({
  heroName,
  localizedName,
  size = "md",
  className,
}: HeroIconProps) {
  const { width, height } = sizes[size];

  return (
    <div className={cn("relative overflow-hidden rounded", className)}>
      <Image
        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png`}
        alt={localizedName || heroName}
        width={width}
        height={height}
        className="object-cover"
        unoptimized
      />
    </div>
  );
}
