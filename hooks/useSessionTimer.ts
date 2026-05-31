"use client";

import { useState, useEffect } from "react";

/**
 * Hook: Session Duration Timer.
 * Calculates and updates the elapsed time since a given start date.
 */
export function useSessionTimer(startedAt?: string | null) {
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    if (!startedAt) {
      setElapsed("00:00:00");
      return;
    }

    const startTime = new Date(startedAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, now - startTime);

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      const formatted = [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
      ].join(":");

      setElapsed(formatted);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return elapsed;
}
