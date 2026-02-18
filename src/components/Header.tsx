"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/stores/game-store";
import { useSettingsStore, type Locale } from "@/stores/settings-store";
import { useTranslation } from "@/i18n";
import { Modal } from "./Modal";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { t } = useTranslation();
  const mode = useGameStore((s) => s.mode);
  const streak = useGameStore((s) => s.streak);
  const gamesPlayed = useGameStore((s) => s.gamesPlayed);
  const resetGame = useGameStore((s) => s.resetGame);
  const easyMode = useSettingsStore((s) => s.easyMode);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const modeLabel =
    mode === "daily"
      ? t("header.daily")
      : mode === "puzzles"
        ? t("header.puzzles")
        : null;

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
          className={cn(
            "text-2xl font-bold tracking-tight transition-colors",
            easyMode
              ? "text-dota-green hover:text-dota-green/70"
              : "text-dota-gold hover:text-dota-gold-dim",
          )}
        >
          {t("app.title")}
        </button>

        <div className="flex items-center gap-3">
          {modeLabel && (
            <span className="rounded bg-dota-card px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-dota-text-dim">
              {modeLabel}
            </span>
          )}

          {gamesPlayed > 0 && (
            <div className="hidden items-center gap-2 text-sm text-dota-text-dim sm:flex">
              <span title={t("stats.played")}>
                {t("header.dailyCount", { count: gamesPlayed })}
              </span>
              {streak > 0 && (
                <span className="font-semibold text-dota-gold">
                  {t("header.streak", { count: streak })}
                </span>
              )}
            </div>
          )}

          {/* Language button */}
          <button
            onClick={() => setLangOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-dota-text-dim transition-colors hover:bg-dota-card hover:text-dota-text"
            title={t("lang.title")}
            aria-label={t("lang.title")}
          >
            <LanguageFlagIcon />
          </button>

          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-dota-text-dim transition-colors hover:bg-dota-card hover:text-dota-text"
            title={t("settings.title")}
            aria-label={t("settings.title")}
          >
            <CogIcon />
          </button>
        </div>
      </header>

      {/* Settings modal */}
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={t("settings.title")}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dota-text">
                {t("settings.easyMode")}
              </p>
              <p className="text-xs text-dota-text-dim">
                {t("settings.easyMode.desc")}
              </p>
            </div>
            <EasyModeToggle />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dota-text">
                {t("settings.colorblind")}
              </p>
              <p className="text-xs text-dota-text-dim">
                {t("settings.colorblind.desc")}
              </p>
            </div>
            <ColorblindToggle />
          </div>
        </div>
      </Modal>

      {/* Language modal */}
      <Modal
        open={langOpen}
        onClose={() => setLangOpen(false)}
        title={t("lang.title")}
      >
        <LanguageSelector onClose={() => setLangOpen(false)} />
      </Modal>
    </>
  );
}

// ── Language selector ──

function LanguageSelector({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);

  const languages: { code: Locale; label: string; flag: React.ReactNode }[] = [
    { code: "en", label: "English", flag: <EnglishFlagIcon /> },
    { code: "ru", label: "Русский", flag: <RussianFlagIcon /> },
    { code: "es", label: "Español", flag: <SpanishFlagIcon /> },
    { code: "pt", label: "Português", flag: <PortugueseFlagIcon /> },
  ];

  function handleSelect(code: Locale) {
    setLocale(code);
    onClose();
  }

  return (
    <div className="space-y-2">
      {languages.map((lang) => {
        const isSelected = locale === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
              isSelected
                ? "border-dota-gold/30 bg-dota-gold/10 text-dota-gold"
                : "border-dota-border bg-dota-card text-dota-text hover:border-dota-gold/20 hover:bg-dota-gold/5",
            )}
          >
            {lang.flag}
            {lang.label}
            {isSelected && (
              <span className="ml-auto text-xs">{t("lang.selected")}</span>
            )}
          </button>
        );
      })}
      <p className="mt-4 text-xs text-dota-text-dim">{t("lang.more")}</p>
    </div>
  );
}

// ── Icons ──

function CogIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function EasyModeToggle() {
  const easyMode = useSettingsStore((s) => s.easyMode);
  const setEasyMode = useSettingsStore((s) => s.setEasyMode);

  return (
    <button
      onClick={() => setEasyMode(!easyMode)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        easyMode ? "bg-dota-green" : "bg-dota-border",
      )}
      role="switch"
      aria-checked={easyMode}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          easyMode ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

function ColorblindToggle() {
  const colorblindMode = useSettingsStore((s) => s.colorblindMode);
  const setColorblindMode = useSettingsStore((s) => s.setColorblindMode);

  return (
    <button
      onClick={() => setColorblindMode(!colorblindMode)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        colorblindMode ? "bg-dota-gold" : "bg-dota-border",
      )}
      role="switch"
      aria-checked={colorblindMode}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          colorblindMode ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

function LanguageFlagIcon() {
  const locale = useSettingsStore((s) => s.locale);
  if (locale === "ru") return <RussianFlagIcon />;
  if (locale === "es") return <SpanishFlagIcon />;
  if (locale === "pt") return <PortugueseFlagIcon />;
  return <EnglishFlagIcon />;
}

function EnglishFlagIcon() {
  return (
    <svg className="h-5 w-5 overflow-hidden rounded-sm" viewBox="0 0 60 30">
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clipPath="url(#t)"
          stroke="#C8102E"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

function RussianFlagIcon() {
  return (
    <svg className="h-5 w-5 overflow-hidden rounded-sm" viewBox="0 0 60 30">
      <rect width="60" height="10" fill="#fff" />
      <rect y="10" width="60" height="10" fill="#0039A6" />
      <rect y="20" width="60" height="10" fill="#D52B1E" />
    </svg>
  );
}

function SpanishFlagIcon() {
  return (
    <svg className="h-5 w-5 overflow-hidden rounded-sm" viewBox="0 0 60 30">
      <rect width="60" height="7.5" fill="#AA151B" />
      <rect y="7.5" width="60" height="15" fill="#F1BF00" />
      <rect y="22.5" width="60" height="7.5" fill="#AA151B" />
    </svg>
  );
}

function PortugueseFlagIcon() {
  return (
    <svg className="h-5 w-5 overflow-hidden rounded-sm" viewBox="0 0 60 30">
      <rect width="24" height="30" fill="#006600" />
      <rect x="24" width="36" height="30" fill="#FF0000" />
      <circle cx="24" cy="15" r="7" fill="#FFCC00" />
      <circle cx="24" cy="15" r="5" fill="#003399" />
    </svg>
  );
}
