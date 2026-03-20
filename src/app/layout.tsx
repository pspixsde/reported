import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SettingsProvider } from "@/components/SettingsProvider";
import "./globals.css";

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Reported",
  alternateName: ["Reported Dota", "Reported Dota 2"],
  url: "https://reported-dota.org",
};

const bingVerification = process.env.NEXT_PUBLIC_BING_VERIFICATION?.trim();

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
    ...(bingVerification
      ? { other: { "msvalidate.01": bingVerification } }
      : {}),
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
        <SettingsProvider>{children}</SettingsProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
