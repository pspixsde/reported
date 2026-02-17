"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { Modal } from "./Modal";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const mode = useGameStore((s) => s.mode);
  const streak = useGameStore((s) => s.streak);
  const gamesPlayed = useGameStore((s) => s.gamesPlayed);
  const resetGame = useGameStore((s) => s.resetGame);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const modeLabel = mode === "daily" ? "Daily" : mode === "puzzles" ? "Puzzles" : null;

  return (
    <>
      <header
        className={cn(
          "flex items-center justify-between border-b border-dota-border px-4 py-3",
          className,
        )}
      >
        <button
          onClick={resetGame}
          className="text-2xl font-bold tracking-tight text-dota-gold transition-colors hover:text-dota-gold-dim"
        >
          REPORTED
        </button>

        <div className="flex items-center gap-3">
          {modeLabel && (
            <span className="rounded bg-dota-card px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-dota-text-dim">
              {modeLabel}
            </span>
          )}

          {gamesPlayed > 0 && (
            <div className="hidden items-center gap-2 text-sm text-dota-text-dim sm:flex">
              <span title="Daily challenges played">Daily: {gamesPlayed}</span>
              {streak > 0 && (
                <span
                  className="font-semibold text-dota-gold"
                  title="Daily perfect streak"
                >
                  {streak} streak
                </span>
              )}
            </div>
          )}

          {/* Language button */}
          <button
            onClick={() => setLangOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-dota-text-dim transition-colors hover:bg-dota-card hover:text-dota-text"
            title="Language"
            aria-label="Language"
          >
            <EnglishFlagIcon />
          </button>

          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-dota-text-dim transition-colors hover:bg-dota-card hover:text-dota-text"
            title="Settings"
            aria-label="Settings"
          >
            <CogIcon />
          </button>
        </div>
      </header>

      {/* Settings modal */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Settings">
        <p className="text-sm text-dota-text-dim">
          No settings available yet. Check back later!
        </p>
      </Modal>

      {/* Language modal */}
      <Modal open={langOpen} onClose={() => setLangOpen(false)} title="Language">
        <div className="space-y-2">
          <button
            className="flex w-full items-center gap-3 rounded-lg border border-dota-gold/30 bg-dota-gold/10 px-4 py-3 text-left text-sm font-medium text-dota-gold transition-colors"
          >
            <EnglishFlagIcon />
            English
            <span className="ml-auto text-xs">Selected</span>
          </button>
        </div>
        <p className="mt-4 text-xs text-dota-text-dim">
          More languages coming soon.
        </p>
      </Modal>
    </>
  );
}

// ── Icons ──

function CogIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function EnglishFlagIcon() {
  return (
    <svg className="h-5 w-5 overflow-hidden rounded-sm" viewBox="0 0 60 30">
      {/* Union Jack simplified */}
      <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      {/* Blue background */}
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  );
}
