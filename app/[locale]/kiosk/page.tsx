"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import type { Locale } from "@/types";

const LANGUAGES = [
  { code: "en", label: "English", sub: "EN" },
  { code: "tr", label: "Türkçe", sub: "TR" },
  { code: "ru", label: "Русский", sub: "RU" },
  { code: "kk", label: "Қазақша", sub: "KK" },
] as const;

export default function WelcomePage() {
  const t = useTranslations("welcome");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { setLanguage, reset } = useKioskStore();

  function handleStart() {
    router.push(`/${locale}/kiosk/name`);
  }

  function handleLanguageSelect(code: Locale) {
    setLanguage(code);
    reset();
    router.push(`/${code}/kiosk/name`);
  }

  return (
    <div className="kiosk-screen relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-white/[0.02] blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-white/[0.015] blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-between py-12 sm:py-16 px-6 sm:px-12 relative z-10 max-w-2xl mx-auto w-full">

        {/* Brand */}
        <div className="flex flex-col items-center gap-5 sm:gap-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/8 border border-white/15 flex items-center justify-center">
            <span className="text-white text-2xl sm:text-3xl font-light tracking-widest">✦</span>
          </div>
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-extralight tracking-[0.15em] text-white uppercase">
              {t("title")}
            </h1>
            <p className="mt-3 sm:mt-5 text-white/40 text-base sm:text-xl font-light max-w-xs sm:max-w-md text-center leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
          <p className="text-white/25 text-xs sm:text-sm tracking-[0.2em] uppercase">
            {t("selectLanguage")}
          </p>
          <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`h-14 sm:h-18 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all active:scale-95 ${
                  locale === lang.code
                    ? "bg-white text-black border-white"
                    : "bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/25"
                }`}
              >
                <span className="font-semibold text-xs sm:text-sm tracking-wider">{lang.sub}</span>
                <span className="text-[10px] sm:text-xs opacity-70">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="w-full flex flex-col items-center gap-4">
          <button
            onClick={handleStart}
            className="w-full h-16 sm:h-20 bg-white text-black rounded-2xl text-lg sm:text-2xl font-semibold tracking-wide active:scale-95 transition-transform"
          >
            {t("cta")}
          </button>
          <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
        </div>
      </div>

      {/* Admin link — bottom right corner */}
      <a
        href={`/${locale}/admin`}
        className="absolute bottom-5 right-5 text-white/15 text-xs tracking-widest hover:text-white/35 transition-colors"
      >
        admin
      </a>
    </div>
  );
}
