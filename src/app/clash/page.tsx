import type { Metadata } from "next";
import { ClashPageClient } from "@/components/pages/ClashPageClient";

export const metadata: Metadata = {
  title: "Build Clash | Reported",
  description:
    "Play today's Build Clash and compare two weird Dota 2 builds across win/loss, KDA, and rank.",
};

export default function ClashPage() {
  return <ClashPageClient />;
}
