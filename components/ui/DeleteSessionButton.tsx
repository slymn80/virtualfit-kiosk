"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useKioskStore } from "@/store/kioskStore";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface DeleteSessionButtonProps {
  variant?: "text" | "button";
}

export function DeleteSessionButton({ variant = "text" }: DeleteSessionButtonProps) {
  const t = useTranslations("end");
  const tc = useTranslations("common");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { sessionId, reset } = useKioskStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  async function handleDelete() {
    setDeleting(true);
    try {
      if (sessionId) {
        await fetch(`/api/session/${sessionId}`, { method: "DELETE" });
      }
    } catch {
      // best-effort
    } finally {
      reset();
      setShowConfirm(false);
      setDeleting(false);
      router.push(`/${locale}/kiosk`);
    }
  }

  return (
    <>
      {variant === "button" ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full h-14 border border-red-500/40 text-red-400 rounded-xl font-medium text-base active:scale-95 transition-transform"
        >
          {tc("deleteSession")}
        </button>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="text-white/30 text-sm underline underline-offset-4 active:opacity-70"
        >
          {tc("deleteSession")}
        </button>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 max-w-sm w-full flex flex-col gap-6">
            <h2 className="text-white text-2xl font-light text-center">
              {t("deleteConfirmTitle")}
            </h2>
            <p className="text-white/60 text-base text-center leading-relaxed">
              {t("deleteConfirmMsg")}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="h-14 bg-red-500 text-white rounded-xl font-semibold text-base active:scale-95 transition-all disabled:opacity-50"
              >
                {deleting ? "..." : t("deleteConfirm")}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="h-14 border border-white/20 text-white/60 rounded-xl text-base active:scale-95 transition-all"
              >
                {t("deleteCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
