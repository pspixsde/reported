"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";

interface ReportSurveyProps {
  className?: string;
}

export function ReportSurvey({ className }: ReportSurveyProps) {
  const { t } = useTranslation();
  const puzzle = useGameStore((s) => s.puzzle);
  const completed = useGameStore((s) => s.completed);
  const surveyedPuzzleIds = useGameStore((s) => s.surveyedPuzzleIds);
  const markSurveyed = useGameStore((s) => s.markSurveyed);
  const [submitting, setSubmitting] = useState(false);
  const [justAnswered, setJustAnswered] = useState(false);

  if (!completed || !puzzle) return null;
  if (surveyedPuzzleIds.includes(puzzle.id) && !justAnswered) return null;

  if (justAnswered) {
    return (
      <div
        className={cn(
          "w-full max-w-md rounded-lg border border-dota-border bg-dota-surface p-4",
          "animate-[fadeSlideIn_0.3s_ease-out]",
          className,
        )}
      >
        <p className="text-center text-sm text-dota-text-dim">
          {t("survey.thanks")}
        </p>
      </div>
    );
  }

  async function handleVote(response: "yes" | "no") {
    setSubmitting(true);
    try {
      await fetch("/api/survey/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puzzleId: puzzle!.id, response }),
      });
    } catch {
      // Non-blocking — don't show errors for survey
    }
    markSurveyed(puzzle!.id);
    setJustAnswered(true);
    setSubmitting(false);
  }

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-lg border border-dota-border bg-dota-surface p-4",
        "animate-[fadeSlideIn_0.3s_ease-out]",
        className,
      )}
    >
      <p className="text-center text-sm font-medium text-dota-text">
        {t("survey.question")}
      </p>
      <div className="mt-3 flex justify-center gap-3">
        <button
          onClick={() => handleVote("yes")}
          disabled={submitting}
          className="rounded-lg border border-dota-red/30 bg-dota-red/10 px-5 py-2 text-sm font-medium text-dota-red transition-all hover:bg-dota-red/20 disabled:opacity-50"
        >
          {t("survey.yes")}
        </button>
        <button
          onClick={() => handleVote("no")}
          disabled={submitting}
          className="rounded-lg border border-dota-green/30 bg-dota-green/10 px-5 py-2 text-sm font-medium text-dota-green transition-all hover:bg-dota-green/20 disabled:opacity-50"
        >
          {t("survey.no")}
        </button>
      </div>
    </div>
  );
}
