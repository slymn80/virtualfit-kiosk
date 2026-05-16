"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { DeleteSessionButton } from "@/components/ui/DeleteSessionButton";
import { HomeButton } from "@/components/ui/HomeButton";

export default function EndPage() {
  const t = useTranslations("end");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { customerName, reset, sessionId } = useKioskStore();
  const [countdown, setCountdown] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          handleAutoDelete();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAutoDelete() {
    try {
      if (sessionId) {
        await fetch(`/api/session/${sessionId}`, { method: "DELETE" });
      }
    } catch {}
    reset();
    router.push(`/${locale}/kiosk`);
  }

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const progressPct = (countdown / 300) * 100;

  return (
    <div className="kiosk-screen relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-white/[0.02] blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-white/[0.015] blur-3xl" />
      </div>

      {/* Home button */}
      <div className="absolute top-5 right-5 sm:top-8 sm:right-8 z-30">
        <HomeButton />
      </div>

      <div className="flex-1 flex flex-col items-center justify-between py-12 sm:py-16 px-6 sm:px-12 relative z-10 max-w-2xl mx-auto w-full">

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8">

          {/* Check icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/[0.07] border border-white/15 flex items-center justify-center">
            <svg className="w-9 h-9 sm:w-11 sm:h-11 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-extralight text-white tracking-[0.1em]">
              {t("title", { name: customerName || "Friend" })}
            </h1>
            <p className="text-white/35 text-sm sm:text-lg font-light mt-3 sm:mt-4 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center gap-3 mt-2">
            <p className="text-white/20 text-xs sm:text-sm tracking-[0.15em] uppercase font-light">
              {t("autoDelete")}
            </p>
            <p className="text-white/50 text-2xl sm:text-3xl font-light font-mono tracking-widest">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
            {/* Progress bar */}
            <div className="w-32 sm:w-48 h-px bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/30 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <button
            onClick={() => {
              reset();
              router.push(`/${locale}/kiosk`);
            }}
            className="w-full h-14 sm:h-16 bg-white text-black rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base tracking-wide active:scale-95 transition-transform"
          >
            {t("newSession")}
          </button>
          <DeleteSessionButton variant="button" />
        </div>
      </div>
    </div>
  );
}
