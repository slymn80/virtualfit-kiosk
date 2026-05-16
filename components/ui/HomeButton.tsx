"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";

export function HomeButton() {
  const t = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { reset, sessionId } = useKioskStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      if (sessionId) {
        await fetch(`/api/session/${sessionId}`, { method: "DELETE" });
      }
    } catch {
      // best-effort
    } finally {
      reset();
      router.push(`/${locale}/kiosk`);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center active:scale-95 transition-transform hover:bg-white/[0.08]"
        aria-label="Go home"
      >
        <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#141414] border border-white/10 rounded-2xl p-7 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>

            <div className="text-center">
              <h2 className="text-white text-lg sm:text-xl font-light tracking-wide">
                {t("homeConfirmTitle")}
              </h2>
              <p className="text-white/35 text-sm font-light mt-2 leading-relaxed">
                {t("homeConfirmMessage")}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full h-12 bg-white text-black rounded-xl font-semibold text-sm tracking-wide active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" />}
                {t("homeConfirmYes")}
              </button>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="w-full h-12 border border-white/10 text-white/50 rounded-xl font-light text-sm active:scale-95 transition-transform disabled:opacity-50"
              >
                {t("homeConfirmNo")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
