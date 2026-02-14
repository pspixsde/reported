import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reported - Dota 2 Build Guessing Game",
  description:
    "A Wordle-like game for Dota 2 players. Guess outcomes from unusual builds during queue time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
