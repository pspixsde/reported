"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";

interface CountdownTimerProps {
  className?: string;
}

export function CountdownTimer({ className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnightUTC());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilMidnightUTC());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={cn("text-center", className)}>
      <p className="text-xs font-medium uppercase tracking-wider text-dota-text-dim">
        Next daily puzzle in
      </p>
      <p className="mt-1 font-mono text-2xl font-bold text-dota-gold tabular-nums">
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </p>
    </div>
  );
}

function getTimeUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCDate(midnight.getUTCDate() + 1);
  midnight.setUTCHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
