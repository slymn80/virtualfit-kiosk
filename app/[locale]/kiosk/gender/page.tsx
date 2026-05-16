"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { DeleteSessionButton } from "@/components/ui/DeleteSessionButton";
import { HomeButton } from "@/components/ui/HomeButton";

const GENDERS = [
  {
    id: "women",
    labelKey: "women" as const,
    subKey: "womenSub" as const,
    accent: "border-rose-400/20 hover:border-rose-400/40",
    dot: "bg-rose-400/60",
  },
  {
    id: "men",
    labelKey: "men" as const,
    subKey: "menSub" as const,
    accent: "border-blue-400/20 hover:border-blue-400/40",
    dot: "bg-blue-400/60",
  },
  {
    id: "children",
    labelKey: "children" as const,
    subKey: "childrenSub" as const,
    accent: "border-amber-400/20 hover:border-amber-400/40",
    dot: "bg-amber-400/60",
  },
] as const;

export default function GenderPage() {
  const t = useTranslations("gender");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const { setSelectedGender, customerName } = useKioskStore();
  useIdleTimeout(() => router.push(`/${locale}/kiosk`), 120000);

  function handleSelect(genderId: string) {
    setSelectedGender(genderId);
    router.push(`/${locale}/kiosk/categories`);
  }

  return (
    <div className="kiosk-screen relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-white/[0.018] blur-3xl" />
      </div>

      {/* Header */}
      <div className="px-5 sm:px-10 py-4 sm:py-5 border-b border-white/8 flex items-center justify-between flex-shrink-0 relative z-10">
        <button
          onClick={() => router.push(`/${locale}/kiosk/camera`)}
          className="text-white/30 text-sm sm:text-base tracking-wider active:opacity-60"
        >
          ←
        </button>
        <div className="text-center">
          {customerName && (
            <p className="text-white/30 text-xs sm:text-sm tracking-widest uppercase">{customerName}</p>
          )}
          <h1 className="text-white text-base sm:text-xl font-light tracking-[0.1em]">{t("title")}</h1>
        </div>
        <HomeButton />
      </div>

      {/* Subtitle */}
      <p className="text-white/25 text-xs sm:text-sm tracking-[0.15em] uppercase text-center px-6 pt-5 sm:pt-7 pb-2 relative z-10">
        {t("subtitle")}
      </p>

      {/* Gender cards */}
      <div className="flex-1 flex flex-col justify-center gap-3 sm:gap-4 px-5 sm:px-10 py-4 relative z-10 max-w-2xl mx-auto w-full">
        {GENDERS.map((g) => (
          <button
            key={g.id}
            onClick={() => handleSelect(g.id)}
            className={`w-full flex items-center gap-5 sm:gap-8 px-6 sm:px-10 py-5 sm:py-7 rounded-2xl border bg-white/[0.04] ${g.accent} active:scale-[0.98] transition-all`}
          >
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${g.dot}`} />
            <div className="text-left flex-1">
              <p className="text-white text-xl sm:text-2xl font-light tracking-wide">{t(g.labelKey)}</p>
              <p className="text-white/35 text-xs sm:text-sm font-light mt-0.5">{t(g.subKey)}</p>
            </div>
            <span className="text-white/20 text-xl sm:text-2xl font-light">›</span>
          </button>
        ))}
      </div>

      <div className="px-6 py-4 sm:py-5 border-t border-white/8 flex justify-center relative z-10">
        <DeleteSessionButton variant="text" />
      </div>
    </div>
  );
}
