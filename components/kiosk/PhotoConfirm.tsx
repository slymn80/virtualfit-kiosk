"use client";

import { useTranslations } from "next-intl";

interface PhotoConfirmProps {
  imageDataUrl: string;
  onConfirm: () => void;
  onRetake: () => void;
  uploading?: boolean;
}

export function PhotoConfirm({
  imageDataUrl,
  onConfirm,
  onRetake,
  uploading = false,
}: PhotoConfirmProps) {
  const t = useTranslations("camera");

  return (
    <div className="relative w-full h-screen bg-black flex flex-col overflow-hidden">

      {/* Full-screen photo */}
      <div className="flex-1 relative">
        <img
          src={imageDataUrl}
          alt="Captured"
          className="absolute inset-0 w-full h-full object-contain"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)" }}
        />
      </div>

      {/* Action bar */}
      <div
        className="relative"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)" }}
      >
        <div className="max-w-lg mx-auto px-6 sm:px-10 py-7 sm:py-10 flex flex-col gap-4 sm:gap-5">

          <h2 className="text-center text-white text-xl sm:text-3xl font-extralight tracking-[0.1em]">
            {t("usePhoto")}
          </h2>

          <div className="flex gap-3">
            <button
              onClick={onRetake}
              disabled={uploading}
              className="flex-1 h-14 sm:h-16 rounded-xl sm:rounded-2xl border border-white/20 text-white text-base sm:text-xl font-light active:scale-95 transition-transform disabled:opacity-40"
            >
              {t("retake")}
            </button>
            <button
              onClick={onConfirm}
              disabled={uploading}
              className="flex-[2] h-14 sm:h-16 rounded-xl sm:rounded-2xl bg-white text-black text-base sm:text-xl font-semibold active:scale-95 transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Uploading...</span>
                </>
              ) : (
                t("confirm")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
