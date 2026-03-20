"use client";

import { cn } from "@/lib/cn";
import type { FacetInfo } from "@/lib/game-types";

interface FacetBadgeProps {
  facet?: FacetInfo | null;
  className?: string;
}

function facetColorClasses(color: string): string {
  switch (color) {
    case "Red":
      return "border-red-700/40 bg-red-900/30 text-red-300";
    case "Blue":
      return "border-blue-700/40 bg-blue-900/30 text-blue-300";
    case "Green":
      return "border-green-700/40 bg-green-900/30 text-green-300";
    case "Purple":
      return "border-purple-700/40 bg-purple-900/30 text-purple-300";
    case "Gray":
      return "border-gray-600/40 bg-gray-800/30 text-gray-300";
    case "Yellow":
      return "border-yellow-700/40 bg-yellow-900/30 text-yellow-300";
    default:
      return "border-dota-border bg-dota-card text-dota-text-dim";
  }
}

export function FacetBadge({ facet, className }: FacetBadgeProps) {
  if (!facet) return null;

  const iconUrl = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/facets/${facet.icon}.png`;

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
        facetColorClasses(facet.color),
        className,
      )}
      title={facet.title}
    >
      <img src={iconUrl} alt={facet.title} className="h-4 w-4 rounded-sm" />
      <span className="truncate">{facet.title}</span>
    </div>
  );
}
