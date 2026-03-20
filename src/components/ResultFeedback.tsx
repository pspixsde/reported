"use client";

import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/i18n";
import { translateAnswer } from "@/lib/translate-answer";
import type { LevelResult } from "@/lib/game-types";

interface ResultFeedbackProps {
  className?: string;
}

interface ClashKdaLine {
  player: "player1" | "player2";
  text: string;
  ratio: number;
}

export function ResultFeedback({ className }: ResultFeedbackProps) {
  const { t } = useTranslation();
  const results = useGameStore((s) => s.results);
  const mode = useGameStore((s) => s.mode);
  const puzzlesHardMode = useGameStore((s) => s.puzzlesHardMode);

  if (results.length === 0) return null;

  const hard = puzzlesHardMode && mode === "puzzles";
  const levelLabels = hard
    ? [t("result.hero"), t("result.winloss"), t("result.kda"), t("result.rank")]
    : mode === "clash"
      ? [t("result.clash.winner"), t("result.clash.kda"), t("result.clash.rank")]
    : [t("result.winloss"), t("result.kda"), t("result.rank")];

  return (
    <div className={cn("w-full max-w-md space-y-2", className)}>
      {results.map((result, i) => (
        <ResultRow
          key={i}
          label={levelLabels[i]}
          result={result}
          index={i}
          mode={mode}
          isHeroLevel={hard && i === 0}
        />
      ))}
    </div>
  );
}

function ResultRow({
  label,
  result,
  index,
  mode,
  isHeroLevel,
}: {
  label: string;
  result: LevelResult;
  index: number;
  mode: "daily" | "puzzles" | "clash" | null;
  isHeroLevel?: boolean;
}) {
  const { t } = useTranslation();
  const heroes = useGameStore((s) => s.heroes);

  const formatClashPlayer = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (normalized === "a" || normalized === "player1" || normalized === "p1") {
      return t("clash.player1");
    }
    if (normalized === "b" || normalized === "player2" || normalized === "p2") {
      return t("clash.player2");
    }
    if (normalized.startsWith("player1 ")) {
      return value.replace(/^player1\s+/i, `${t("clash.player1")}: `);
    }
    if (normalized.startsWith("player2 ")) {
      return value.replace(/^player2\s+/i, `${t("clash.player2")}: `);
    }
    return value;
  };

  const parseClashKdaLines = (value: string): ClashKdaLine[] => {
    return value
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const match = part.match(
          /^(player1|player2|a|b)\s+(\d+)\/(\d+)\/(\d+)(?:\s+\(([\d.]+)\))?$/i,
        );
        if (!match) return null;
        const [, rawPlayer, killsRaw, deathsRaw, assistsRaw, ratioRaw] = match;
        const kills = Number(killsRaw);
        const deaths = Number(deathsRaw);
        const assists = Number(assistsRaw);
        const ratio =
          ratioRaw !== undefined
            ? Number(ratioRaw)
            : (kills + assists) / Math.max(deaths, 1);
        const player =
          rawPlayer.toLowerCase() === "player1" || rawPlayer.toLowerCase() === "a"
            ? "player1"
            : "player2";

        return {
          player,
          text: `${kills}/${deaths}/${assists} (${ratio.toFixed(2)})`,
          ratio,
        } satisfies ClashKdaLine;
      })
      .filter((entry): entry is ClashKdaLine => entry !== null);
  };

  // For hero guess level, resolve hero IDs to names
  let displayGuess = translateAnswer(result.guess, t);
  let displayAnswer = translateAnswer(result.answer, t);
  if (isHeroLevel && heroes) {
    const guessId = Number(result.guess);
    const answerId = Number(result.answer);
    if (!isNaN(guessId) && heroes[guessId]) {
      displayGuess = heroes[guessId].localized_name;
    }
    if (!isNaN(answerId) && heroes[answerId]) {
      displayAnswer = heroes[answerId].localized_name;
    }
  }

  if (mode === "clash") {
    const formatRankAssignment = (value: string) => {
      const compact = value.replace(/\s+/g, "").toLowerCase();
      const parts = compact.includes(";") ? compact.split(";") : compact.split(",");
      const parsed: Partial<Record<"player1" | "player2", string>> = {};
      for (const part of parts) {
        const [rawKey, rawRank] = part.split(":");
        if (!rawKey || !rawRank) continue;
        const key =
          rawKey === "a" || rawKey === "player1" || rawKey === "p1"
            ? "player1"
            : rawKey === "b" || rawKey === "player2" || rawKey === "p2"
              ? "player2"
              : null;
        if (!key) continue;
        parsed[key] = rawRank;
      }

      if (!parsed.player1 || !parsed.player2) return value;
      const toTitle = (rank: string) =>
        translateAnswer(rank.charAt(0).toUpperCase() + rank.slice(1), t);
      return `${t("clash.player1")}: ${toTitle(parsed.player1)} | ${t("clash.player2")}: ${toTitle(parsed.player2)}`;
    };

    const formatKdaReveal = (value: string) => {
      const parsed = parseClashKdaLines(value);
      if (parsed.length < 2) return value;
      return parsed
        .map((line) => `${formatClashPlayer(line.player)}: ${line.text}`)
        .join(" | ");
    };

    const rankLikeGuess =
      (displayGuess.includes(":") && !displayGuess.includes("/")) ||
      displayGuess.includes("A:");
    const rankLikeAnswer =
      (displayAnswer.includes(":") && !displayAnswer.includes("/")) ||
      displayAnswer.includes("A:");

    if (rankLikeGuess || rankLikeAnswer) {
      displayGuess = formatRankAssignment(displayGuess);
      displayAnswer = formatRankAssignment(displayAnswer);
    } else if (displayAnswer.includes("/") && displayAnswer.includes("|")) {
      displayGuess = formatClashPlayer(displayGuess);
      displayAnswer = formatKdaReveal(displayAnswer);
    } else {
      displayGuess = formatClashPlayer(displayGuess);
      displayAnswer = formatClashPlayer(displayAnswer);
    }
  }

  const isClashKdaLevel = mode === "clash" && index === 1;
  const isClashRankLevel = mode === "clash" && index === 2;
  const kdaLines = isClashKdaLevel ? parseClashKdaLines(result.answer) : [];
  const hasKdaLines = kdaLines.length >= 2;
  const player1Line = hasKdaLines
    ? kdaLines.find((line) => line.player === "player1")
    : undefined;
  const player2Line = hasKdaLines
    ? kdaLines.find((line) => line.player === "player2")
    : undefined;
  const kdaWinner = hasKdaLines && player1Line && player2Line
    ? player1Line.ratio >= player2Line.ratio
      ? t("clash.player1")
      : t("clash.player2")
    : null;

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
        {isClashKdaLevel && hasKdaLines ? (
          <div className="mt-1 space-y-2">
            <div className="flex items-center gap-2">
              {result.correct ? (
                <span className="text-sm font-semibold text-dota-green">
                  {kdaWinner ?? displayGuess}
                </span>
              ) : (
                <>
                  <span className="text-sm text-dota-red line-through">
                    {displayGuess}
                  </span>
                  <span className="text-dota-text-dim">&rarr;</span>
                  <span className="text-sm font-semibold text-dota-text">
                    {kdaWinner ?? displayAnswer}
                  </span>
                </>
              )}
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {player1Line && (
                <div className="rounded-md border border-dota-border/60 bg-dota-bg/30 px-2 py-1 text-xs text-dota-text">
                  <span className="font-semibold">{t("clash.player1")}:</span>{" "}
                  {player1Line.text}
                </div>
              )}
              {player2Line && (
                <div className="rounded-md border border-dota-border/60 bg-dota-bg/30 px-2 py-1 text-xs text-dota-text">
                  <span className="font-semibold">{t("clash.player2")}:</span>{" "}
                  {player2Line.text}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-2">
            {result.correct || (isClashRankLevel && !result.correct) ? (
              <span
                className={cn(
                  "text-sm font-semibold",
                  result.correct ? "text-dota-green" : "text-dota-text",
                )}
              >
                {displayAnswer}
              </span>
            ) : (
              <>
                <span className="text-sm text-dota-red line-through">
                  {displayGuess}
                </span>
                <span className="text-dota-text-dim">&rarr;</span>
                <span className="text-sm font-semibold text-dota-text">
                  {displayAnswer}
                </span>
              </>
            )}
          </div>
        )}
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
