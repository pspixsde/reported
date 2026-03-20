"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n";
import { Modal } from "./Modal";

export function Footer() {
  const { t } = useTranslation();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="flex items-center justify-between border-t border-dota-border px-4 py-4 text-xs text-dota-text-dim">
        <span className="w-16" />
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAboutOpen(true)}
            className="transition-colors hover:text-dota-text"
          >
            {t("about.title")}
          </button>
          <span className="text-dota-border">|</span>
          <button
            onClick={() => setHelpOpen(true)}
            className="transition-colors hover:text-dota-text"
          >
            {t("help.title")}
          </button>
          <span className="text-dota-border">|</span>
          <button
            onClick={() => setPrivacyOpen(true)}
            className="transition-colors hover:text-dota-text"
          >
            {t("privacy.title")}
          </button>
        </div>
        <span className="w-16 text-right text-dota-border">v1.1.0</span>
      </footer>

      {/* About Us modal */}
      <Modal
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        title={t("about.title")}
      >
        <div className="space-y-4 text-sm text-dota-text-dim">
          <p>
            <span className="font-semibold text-dota-gold">REPORTED</span>{" "}
            {t("about.text1")
              .replace(/<gold>.*?<\/gold>\s*/g, "")
              .trim()}
          </p>
          <p>
            {t("about.text2")
              .replace(/<link[^>]*>/g, "")
              .replace(/<\/link>/g, "")
              .split("OpenDota")
              .map((part, i) =>
                i === 0 ? (
                  <span key={i}>{part}</span>
                ) : (
                  <span key={i}>
                    <a
                      href="https://www.opendota.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-dota-text underline decoration-dota-border underline-offset-2 hover:text-dota-gold hover:decoration-dota-gold"
                    >
                      OpenDota
                    </a>
                    {part}
                  </span>
                ),
              )}
          </p>
          <hr className="border-dota-border" />
          <p className="text-xs leading-relaxed">{t("about.disclaimer")}</p>
        </div>
      </Modal>

      {/* Help modal */}
      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title={t("help.title")}
      >
        <div className="space-y-3 text-sm text-dota-text-dim">
          <p className="font-semibold text-dota-text">{t("help.howToPlay")}</p>
          <p>{t("help.daily")}</p>
          <p>{t("help.puzzles")}</p>
          <p>{t("help.clash")}</p>
          <p>{t("help.levels")}</p>
          <p>{t("help.hardMode")}</p>
          <p>{t("help.facets")}</p>
          <p>{t("help.scoring")}</p>
          <p>{t("help.settings")}</p>
        </div>
      </Modal>

      {/* Privacy Policy modal */}
      <Modal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        title={t("privacy.title")}
      >
        <p className="text-sm text-dota-text-dim">{t("privacy.text")}</p>
      </Modal>
    </>
  );
}
