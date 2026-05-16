"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { HomeButton } from "@/components/ui/HomeButton";

const POINTS = ["point1", "point2", "point3", "point4"] as const;

export default function ConsentPage() {
  const t = useTranslations("consent");
  const tc = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { setConsent, setSessionId, customerName, storeId, language } = useKioskStore();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAgree() {
    setCreating(true);
    setError(null);
    setConsent(true);

    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, storeId, language }),
      });
      const data = await res.json();
      if (!res.ok || !data.sessionId) throw new Error(data.error ?? "Session creation failed");
      setSessionId(data.sessionId);
      router.push(`/${locale}/kiosk/camera`);
    } catch {
      setError(tc("error"));
      setCreating(false);
    }
  }

  return (
    <div className="kiosk-screen relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      <div className="absolute top-5 left-5 sm:top-8 sm:left-8 right-5 sm:right-8 z-30 flex items-center justify-between">
        <button
          onClick={() => router.push(`/${locale}/kiosk/name`)}
          className="text-white/30 text-sm sm:text-base tracking-wider active:opacity-60 transition-opacity"
        >
          ← {t("back")}
        </button>
        <HomeButton />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 relative z-10">
        <div className="w-full max-w-md flex flex-col gap-8 sm:gap-10">

          <div className="text-center flex flex-col items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/8 border border-white/15 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extralight tracking-[0.1em] text-white">
              {t("title")}
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            {POINTS.map((point) => (
              <div key={point} className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-white/60 text-sm sm:text-base font-light leading-relaxed">
                  {t(point)}
                </span>
              </div>
            ))}
          </div>

          <div className="h-px bg-white/8" />

          {error && (
            <p className="text-red-400/80 text-sm text-center font-light">{error}</p>
          )}

          <button
            onClick={handleAgree}
            disabled={creating}
            className="w-full h-14 sm:h-16 bg-white text-black rounded-xl sm:rounded-2xl text-base sm:text-xl font-semibold tracking-wide active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {creating && (
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" />
            )}
            {t("agree")}
          </button>
        </div>
      </div>
    </div>
  );
}
