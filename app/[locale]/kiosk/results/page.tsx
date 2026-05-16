"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { DeleteSessionButton } from "@/components/ui/DeleteSessionButton";
import { HomeButton } from "@/components/ui/HomeButton";

export default function ResultsPage() {
  const t = useTranslations("results");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const { results, customerName } = useKioskStore();
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [swipeStart, setSwipeStart] = useState<number | null>(null);
  const handleTimeout = useCallback(() => router.push(`/${locale}/kiosk`), [router, locale]);
  useIdleTimeout(handleTimeout, 180000);

  const displayResults = results;
  const poseLabels = ["pose1", "pose2", "pose3", "pose4"] as const;

  // Redirect if arrived here without results
  if (displayResults.length === 0) {
    return (
      <div className="kiosk-screen items-center justify-center gap-6">
        <p className="text-white/40 text-lg font-light">{t("noResults")}</p>
        <button
          onClick={() => router.push(`/${locale}/kiosk/products`)}
          className="h-12 px-6 border border-white/15 text-white/70 rounded-xl text-sm active:scale-95 transition-transform"
        >
          ← {t("tryAnother")}
        </button>
      </div>
    );
  }

  const gridClass =
    displayResults.length === 1 ? "grid-cols-1 max-w-xs mx-auto" :
    displayResults.length === 2 ? "grid-cols-2" :
    "grid-cols-3";

  return (
    <div className="kiosk-screen">

      {/* Header */}
      <div className="px-5 sm:px-10 py-3 sm:py-5 border-b border-white/8 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => router.push(`/${locale}/kiosk/products`)}
          className="text-white/30 text-sm sm:text-base tracking-wider active:opacity-60"
        >
          ← {t("tryAnother")}
        </button>
        <h1 className="text-white font-light text-sm sm:text-lg tracking-[0.08em]">
          {t("title", { name: customerName })}
        </h1>
        <HomeButton />
      </div>

      {/* Gallery */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3">
        <div className={`grid gap-2 sm:gap-3 h-full ${gridClass}`}>
          {displayResults.slice(0, 4).map((result, i) => (
            <button
              key={i}
              onClick={() => setFullscreenIndex(i)}
              className="relative bg-white/[0.04] rounded-xl sm:rounded-2xl overflow-hidden active:scale-[0.98] transition-transform group border border-white/8"
            >
              <img
                src={result.imageUrl}
                alt={`Pose ${i + 1}`}
                className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300"
                style={{ aspectRatio: "3/4" }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 px-3 py-3"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}
              >
                <span className="text-white/70 text-xs sm:text-sm font-light tracking-wide">
                  {t(poseLabels[i])}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 border-t border-white/8 flex gap-2 sm:gap-3 flex-shrink-0">
        <button
          onClick={() => router.push(`/${locale}/kiosk/share`)}
          className="flex-[2] h-12 sm:h-14 bg-white text-black rounded-xl font-semibold text-sm sm:text-base tracking-wide active:scale-95 transition-transform"
        >
          {t("share")}
        </button>
        <button
          onClick={() => router.push(`/${locale}/kiosk/products`)}
          className="flex-1 h-12 sm:h-14 border border-white/15 text-white/80 rounded-xl font-light text-xs sm:text-sm active:scale-95 transition-transform"
        >
          {t("tryAnother")}
        </button>
        <button
          onClick={() => router.push(`/${locale}/kiosk/end`)}
          className="h-12 sm:h-14 px-3 sm:px-4 border border-white/8 text-white/30 rounded-xl text-xs sm:text-sm active:scale-95 transition-transform"
        >
          {t("finish")}
        </button>
      </div>

      {/* Fullscreen viewer */}
      {fullscreenIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">

          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
            <button
              onClick={() => setFullscreenIndex(null)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 border border-white/15 text-white text-xl sm:text-2xl flex items-center justify-center active:scale-95"
            >
              ×
            </button>
          </div>

          <div
            className="flex-1 relative overflow-hidden"
            onTouchStart={(e) => setSwipeStart(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (swipeStart === null) return;
              const dx = e.changedTouches[0].clientX - swipeStart;
              if (dx > 50 && fullscreenIndex > 0) setFullscreenIndex(fullscreenIndex - 1);
              if (dx < -50 && fullscreenIndex < displayResults.length - 1)
                setFullscreenIndex(fullscreenIndex + 1);
              setSwipeStart(null);
            }}
          >
            <img
              key={fullscreenIndex}
              src={displayResults[fullscreenIndex].imageUrl}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-3 py-5">
            {displayResults.slice(0, 4).map((_, i) => (
              <button
                key={i}
                onClick={() => setFullscreenIndex(i)}
                className={`rounded-full transition-all ${
                  i === fullscreenIndex ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/25"
                }`}
              />
            ))}
          </div>

          <div className="pb-7 text-center">
            <p className="text-white/35 text-xs sm:text-sm font-light tracking-widest uppercase">
              {t(poseLabels[fullscreenIndex])}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
