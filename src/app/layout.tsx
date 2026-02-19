import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SettingsProvider } from "@/components/SettingsProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reported — Dota 2 Daily Puzzle & Rank Guessing Game",
  description:
    "A daily Dota 2 guessing game. Can you guess the rank, KDA, and outcome from real off-meta builds? New puzzle every day — play during queue time.",
  metadataBase: new URL("https://reported-dota.org"),
  keywords: [
    "dota 2",
    "dota guessing game",
    "dota 2 daily puzzle",
    "dota rank guessing",
    "off meta builds dota",
    "dota 2 game",
    "wordle dota",
  ],
  openGraph: {
    title: "Reported — Guess the Outcome of Off-Meta Dota 2 Builds",
    description: "A daily Dota 2 guessing game. Guess the rank, KDA, and outcome from real off-meta builds.",
    siteName: "Reported",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reported — Guess the Outcome of Off-Meta Dota 2 Builds",
    description: "A daily Dota 2 guessing game. Guess the rank, KDA, and outcome from real off-meta builds.",
  },
  verification: {
    google: "rCIk9Eon855LvgPnx3lDI0pna4B7jS7umYx0UzXQZUs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <SettingsProvider>{children}</SettingsProvider>
        <Analytics />
      </body>
    </html>
  );
}
