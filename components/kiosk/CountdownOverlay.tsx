"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface CountdownOverlayProps {
  onCapture: () => void;
  onCancel: () => void;
  initialCount?: number;
}

export function CountdownOverlay({
  onCapture,
  onCancel,
  initialCount = 10,
}: CountdownOverlayProps) {
  const t = useTranslations("camera");
  const [count, setCount] = useState(initialCount);
  const [animKey, setAnimKey] = useState(0);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = (count / initialCount) * circumference;

  useEffect(() => {
    if (count <= 0) {
      onCapture();
      return;
    }

    if (count <= 3) {
      try {
        const AudioCtx =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = count === 1 ? 880 : 660;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } catch {
        // Audio unavailable
      }
    }

    const timer = setTimeout(() => {
      setCount((c) => c - 1);
      setAnimKey((k) => k + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onCapture]);

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]">

      {/* Ring + number */}
      <div className="relative flex items-center justify-center">
        {/* Responsive SVG ring: 240px mobile, 320px tablet */}
        <svg
          className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px]"
          viewBox="0 0 280 280"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="140" cy="140" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="4"
          />
          <circle
            cx="140" cy="140" r={radius}
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{ transition: "stroke-dashoffset 0.9s linear" }}
          />
        </svg>

        {/* Number */}
        <div
          key={animKey}
          className="text-[7rem] sm:text-[9rem] font-black text-white leading-none select-none"
          style={{
            textShadow: "0 0 60px rgba(255,255,255,0.3), 0 4px 30px rgba(0,0,0,0.8)",
            animation: "countIn 0.25s ease-out",
          }}
        >
          {count}
        </div>
      </div>

      <style>{`
        @keyframes countIn {
          from { transform: scale(1.3); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Stay still */}
      <p
        className="mt-8 sm:mt-10 text-white/65 text-xl sm:text-2xl font-light tracking-[0.25em] uppercase"
        style={{ animation: "pulse 1.5s ease-in-out infinite" }}
      >
        {t("stayStill")}
      </p>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="mt-8 sm:mt-10 h-12 sm:h-14 px-8 sm:px-10 rounded-full border border-white/25 text-white/60 text-sm sm:text-base font-light backdrop-blur-sm active:scale-95 transition-transform tracking-wider"
      >
        {t("cancel")}
      </button>
    </div>
  );
}
