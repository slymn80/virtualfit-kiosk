"use client";

import { useEffect, useRef } from "react";

export function useIdleTimeout(onTimeout: () => void, timeoutMs = 120000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function reset() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(onTimeout, timeoutMs);
    }

    const events = ["touchstart", "touchmove", "mousedown", "mousemove", "keydown", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [onTimeout, timeoutMs]);
}
