"use client";

import { useState } from "react";
import { Modal } from "./Modal";

export function Footer() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="flex items-center justify-center gap-4 border-t border-dota-border px-4 py-4 text-xs text-dota-text-dim">
        <button
          onClick={() => setAboutOpen(true)}
          className="transition-colors hover:text-dota-text"
        >
          About Us
        </button>
        <span className="text-dota-border">|</span>
        <button
          onClick={() => setPrivacyOpen(true)}
          className="transition-colors hover:text-dota-text"
        >
          Privacy Policy
        </button>
      </footer>

      {/* About Us modal */}
      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About Us">
        <div className="space-y-4 text-sm text-dota-text-dim">
          <p>
            <span className="font-semibold text-dota-gold">REPORTED</span> is
            a Wordle-inspired guessing game for Dota 2 players. You&apos;re
            shown a real ranked match featuring an unusual, off-meta build and
            challenged to guess the outcome&nbsp;&mdash; did they win? What rank
            bracket? What was their KDA?
          </p>
          <p>
            All match data comes from the{" "}
            <a
              href="https://www.opendota.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-dota-text underline decoration-dota-border underline-offset-2 hover:text-dota-gold hover:decoration-dota-gold"
            >
              OpenDota
            </a>{" "}
            API. New puzzles are sourced exclusively from ranked matches on the
            latest patch.
          </p>
          <hr className="border-dota-border" />
          <p className="text-xs leading-relaxed">
            Dota 2 is a registered trademark of Valve Corporation. Valve
            Corporation does not endorse or sponsor this project.
          </p>
        </div>
      </Modal>

      {/* Privacy Policy modal */}
      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Privacy Policy">
        <p className="text-sm text-dota-text-dim">
          We don&apos;t collect personal data or run ads. Your game progress is
          stored locally in your browser. A full privacy policy will be
          published here if that ever changes.
        </p>
      </Modal>
    </>
  );
}
