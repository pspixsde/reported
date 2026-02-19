import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SettingsProvider } from "@/components/SettingsProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reported - Dota 2 Build Guessing Game",
  description:
    "A Wordle-like game for Dota 2 players. Guess outcomes from unusual builds during queue time.",
  metadataBase: new URL("https://reported-dota.org"),
  openGraph: {
    title: "Reported - Dota 2 Build Guessing Game",
    description: "Guess the outcome of real Dota 2 matches featuring unusual, off-meta builds.",
    siteName: "Reported",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reported - Dota 2 Build Guessing Game",
    description: "Guess the outcome of real Dota 2 matches featuring unusual, off-meta builds.",
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
