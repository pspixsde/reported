import type { Metadata } from "next";
import { DailyPageClient } from "@/components/pages/DailyPageClient";

export const metadata: Metadata = {
  title: "Daily Challenge | Reported",
  description: "Play today's Reported daily challenge and guess win/loss, KDA, and rank.",
};

export default function DailyPage() {
  return <DailyPageClient />;
}
