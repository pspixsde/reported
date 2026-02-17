"use client";

import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import type { LevelResult } from "@/lib/game-types";

interface ResultFeedbackProps {
  className?: string;
}

export function ResultFeedback({ className }: ResultFeedbackProps) {
  const { t } = useTranslation();
  const results = useGameStore((s) => s.results);

  if (results.length === 0) return null;

  const levelLabels = [
    t("result.winloss"),
    t("result.rank"),
    t("result.kda"),
  ];

  return (
    <div className={cn("w-full max-w-md space-y-2", className)}>
      {results.map((result, i) => (
        <ResultRow
          key={i}
          label={levelLabels[i]}
          result={result}
          index={i}
        />
      ))}
    </div>
  );
}

function ResultRow({
  label,
  result,
  index,
}: {
  label: string;
  result: LevelResult;
  index: number;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border px-4 py-3 transition-all",
        "animate-[fadeSlideIn_0.3s_ease-out_forwards]",
        result.correct
          ? "border-dota-green/30 bg-dota-green/10"
          : "border-dota-red/30 bg-dota-red/10",
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-dota-text-dim">
          {t("result.level", { n: index + 1, label })}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {result.correct ? (
            <span className="text-sm font-semibold text-dota-green">
              {result.answer}
            </span>
          ) : (
            <>
              <span className="text-sm text-dota-red line-through">
                {result.guess}
              </span>
              <span className="text-dota-text-dim">&rarr;</span>
              <span className="text-sm font-semibold text-dota-text">
                {result.answer}
              </span>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
          result.correct
            ? "bg-dota-green text-dota-bg"
            : "bg-dota-red text-white",
        )}
      >
        {result.correct ? "✓" : "✗"}
      </div>
    </div>
  );
}
