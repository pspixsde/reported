import type { Metadata } from "next";
import { PuzzlesPageClient } from "@/components/pages/PuzzlesPageClient";

export const metadata: Metadata = {
  title: "Puzzles Mode | Reported",
  description: "Play Reported puzzle sets with standard and hard challenges at your own pace.",
};

export default function PuzzlesPage() {
  return <PuzzlesPageClient />;
}
