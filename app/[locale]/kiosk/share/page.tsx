"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { DeleteSessionButton } from "@/components/ui/DeleteSessionButton";
import { HomeButton } from "@/components/ui/HomeButton";
import { QRCodeSVG } from "qrcode.react";

type Tab = "qr" | "email" | "apps";

export default function SharePage() {
  const t = useTranslations("share");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const { sessionId: sid } = useKioskStore();
  const handleTimeout = useCallback(() => router.push(`/${locale}/kiosk`), [router, locale]);
  useIdleTimeout(handleTimeout, 180000);

  const [tab, setTab] = useState<Tab>("qr");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const appUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  useEffect(() => {
    if (!sid) {
      setShareUrl(`${appUrl}/share/demo`);
      return;
    }
    fetch("/api/share/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid }),
    })
      .then((r) => r.json())
      .then((data) => setShareUrl(data.shareUrl ?? `${appUrl}/share/${data.shareToken}`))
      .catch(() => setShareUrl(`${appUrl}/share/${sid}`));
  }, [sid, appUrl]);

  async function handleSendEmail() {
    if (!email.includes("@")) return;
    setEmailState("sending");
    try {
      const res = await fetch("/api/share/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, email, shareUrl }),
      });
      setEmailState(res.ok ? "sent" : "error");
    } catch {
      setEmailState("error");
    }
  }

  function handleWhatsApp() {
    if (!shareUrl) return;
    const msg = encodeURIComponent(`Check out my virtual try-on looks! ${shareUrl}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  function handleTelegram() {
    if (!shareUrl) return;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("My virtual try-on looks!")}`,
      "_blank"
    );
  }

  async function handleWebShare() {
    if (navigator.share && shareUrl) {
      try {
        await navigator.share({ title: "My virtual looks", url: shareUrl });
      } catch {
        // User cancelled or not supported
      }
    }
  }

  const TAB_LABELS: Record<Tab, string> = {
    qr: "QR Code",
    email: "Email",
    apps: "Apps",
  };

  return (
    <div className="kiosk-screen">

      {/* Header */}
      <div className="px-5 sm:px-10 py-4 sm:py-5 border-b border-white/8 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => router.push(`/${locale}/kiosk/results`)}
          className="text-white/30 text-sm sm:text-base tracking-wider active:opacity-60"
        >
          ←
        </button>
        <h1 className="text-white text-base sm:text-xl font-light tracking-[0.1em]">{t("title")}</h1>
        <HomeButton />
      </div>

      {/* Tab selector */}
      <div className="px-4 sm:px-8 pt-4 sm:pt-5 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/8">
          {(["qr", "email", "apps"] as Tab[]).map((tabId) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className={`flex-1 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium tracking-wider transition-all ${
                tab === tabId
                  ? "bg-white text-black"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {TAB_LABELS[tabId]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 sm:px-8 py-5 sm:py-7 overflow-y-auto">
        <div className="max-w-2xl mx-auto">

          {/* QR Tab */}
          {tab === "qr" && (
            <div className="flex flex-col items-center gap-5 sm:gap-7">
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl">
                {shareUrl ? (
                  <QRCodeSVG value={shareUrl} size={180} level="H" />
                ) : (
                  <div className="w-[180px] h-[180px] bg-gray-100 animate-pulse rounded" />
                )}
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm sm:text-base font-light">{t("qrCode")}</p>
                <p className="text-white/25 text-xs sm:text-sm font-light mt-1">{t("qrSubtitle")}</p>
              </div>
              {shareUrl && (
                <p className="text-white/15 text-xs text-center break-all max-w-xs font-light">{shareUrl}</p>
              )}
            </div>
          )}

          {/* Email Tab */}
          {tab === "email" && (
            <div className="flex flex-col gap-3 sm:gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailState("idle"); }}
                placeholder={t("emailPlaceholder")}
                className="w-full h-12 sm:h-14 bg-white/[0.06] border border-white/15 rounded-xl px-4 sm:px-5 text-white text-base font-light placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button
                onClick={handleSendEmail}
                disabled={emailState === "sending" || emailState === "sent" || !email.includes("@")}
                className="w-full h-12 sm:h-14 bg-white text-black rounded-xl font-semibold text-sm sm:text-base tracking-wide active:scale-95 transition-all disabled:opacity-40"
              >
                {emailState === "sending" && t("sending")}
                {emailState === "sent" && "✓ " + t("sent")}
                {emailState === "error" && t("error")}
                {emailState === "idle" && t("send")}
              </button>
            </div>
          )}

          {/* Apps Tab */}
          {tab === "apps" && (
            <div className="flex flex-col gap-2 sm:gap-3 max-w-md mx-auto">
              <button
                onClick={handleWhatsApp}
                className="w-full h-14 sm:h-16 flex items-center gap-4 sm:gap-5 px-5 sm:px-7 bg-white/[0.04] border border-white/10 hover:border-[#25D366]/30 text-white rounded-xl active:scale-95 transition-all"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#25D366]/15 border border-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#25D366] text-sm sm:text-base font-bold">W</span>
                </div>
                <span className="text-sm sm:text-base font-light tracking-wide">{t("whatsapp")}</span>
              </button>
              <button
                onClick={handleTelegram}
                className="w-full h-14 sm:h-16 flex items-center gap-4 sm:gap-5 px-5 sm:px-7 bg-white/[0.04] border border-white/10 hover:border-[#2AABEE]/30 text-white rounded-xl active:scale-95 transition-all"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#2AABEE]/15 border border-[#2AABEE]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#2AABEE] text-sm sm:text-base font-bold">T</span>
                </div>
                <span className="text-sm sm:text-base font-light tracking-wide">{t("telegram")}</span>
              </button>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  onClick={handleWebShare}
                  className="w-full h-14 sm:h-16 flex items-center gap-4 sm:gap-5 px-5 sm:px-7 bg-white/[0.04] border border-white/10 text-white rounded-xl active:scale-95 transition-all"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base font-light tracking-wide">Share / AirDrop</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 sm:py-5 border-t border-white/8 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <DeleteSessionButton variant="button" />
        </div>
      </div>
    </div>
  );
}
