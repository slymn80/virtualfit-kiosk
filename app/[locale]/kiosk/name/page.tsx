"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { HomeButton } from "@/components/ui/HomeButton";

export default function NamePage() {
  const t = useTranslations("name");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { setCustomerName, customerName } = useKioskStore();
  const [name, setName] = useState(customerName || "");
  const [error, setError] = useState("");

  function validate(value: string) {
    if (value.length < 2) return t("errorMin");
    if (value.length > 30) return t("errorMax");
    return "";
  }

  function handleContinue() {
    const err = validate(name.trim());
    if (err) { setError(err); return; }
    setCustomerName(name.trim());
    router.push(`/${locale}/kiosk/consent`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleContinue();
  }

  const canContinue = name.trim().length >= 2;

  return (
    <div className="kiosk-screen relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-white/[0.02] blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-white/[0.015] blur-3xl" />
      </div>

      {/* Nav */}
      <div className="absolute top-5 left-5 sm:top-8 sm:left-8 right-5 sm:right-8 z-30 flex items-center justify-between">
        <button
          onClick={() => router.push(`/${locale}/kiosk`)}
          className="text-white/30 text-sm sm:text-base tracking-wider active:opacity-60 transition-opacity"
        >
          ←
        </button>
        <HomeButton />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 relative z-10">
        <div className="w-full max-w-md flex flex-col gap-8 sm:gap-10">

          {/* Header */}
          <div className="text-center flex flex-col items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/8 border border-white/15 flex items-center justify-center">
              <span className="text-white/70 text-lg sm:text-2xl font-light">✦</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-extralight tracking-[0.1em] text-white">
                {t("title")}
              </h1>
              <p className="text-white/35 text-sm sm:text-lg font-light mt-2 sm:mt-3">
                {t("subtitle")}
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("placeholder")}
              maxLength={30}
              autoFocus
              className="w-full h-14 sm:h-16 bg-white/[0.06] border border-white/15 rounded-xl sm:rounded-2xl px-5 sm:px-6 text-white text-xl sm:text-2xl font-light placeholder:text-white/20 focus:outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
            />
            {error && (
              <p className="text-red-400/80 text-sm px-1 font-light">{error}</p>
            )}
          </div>

          {/* Continue */}
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full h-14 sm:h-16 bg-white text-black rounded-xl sm:rounded-2xl text-base sm:text-xl font-semibold tracking-wide active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t("continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
