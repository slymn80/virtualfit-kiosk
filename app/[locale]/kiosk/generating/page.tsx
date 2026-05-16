"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { DeleteSessionButton } from "@/components/ui/DeleteSessionButton";
import { HomeButton } from "@/components/ui/HomeButton";

const STEPS = ["step1", "step2", "step3", "step4", "step5", "step6"] as const;

export default function GeneratingPage() {
  const t = useTranslations("generating");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const {
    sessionId,
    customerName,
    storeId,
    language,
    photoUploadUrl,
    selectedProductId,
    garmentImageUrl,
    setJobId,
    setJobStatus,
    setResults,
    jobStatus,
  } = useKioskStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
      setCurrentStep((s) => {
        if (s < STEPS.length - 2) return s + 1;
        return s;
      });
      setPercentage((p) => Math.min(p + 14, 90));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function startJob() {
      try {
        setJobStatus("PENDING");

        const res = await fetch("/api/tryon/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId ?? "temp",
            customerName,
            storeId,
            language,
            personPhotoUrl: photoUploadUrl ?? "",
            productId: selectedProductId ?? "",
            garmentImageUrl: garmentImageUrl ?? "",
            requestType: "virtual_try_on_4_poses",
          }),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const jobId = data.jobId;
        setJobId(jobId);
        setJobStatus("QUEUED");

        if (data.results) {
          setResults(data.results);
          setJobStatus("COMPLETED");
          setCurrentStep(5);
          setPercentage(100);
          setTimeout(() => router.push(`/${locale}/kiosk/results`), 800);
          return;
        }

        // 5-minute hard timeout
        timeoutRef.current = setTimeout(() => {
          clearInterval(pollingRef.current!);
          setJobStatus("FAILED");
          setError("Generation timed out. Please try again.");
        }, 5 * 60 * 1000);

        pollingRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/tryon/status/${jobId}`);
            const statusData = await statusRes.json();

            if (statusData.status === "COMPLETED") {
              clearInterval(pollingRef.current!);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setResults(statusData.results ?? []);
              setJobStatus("COMPLETED");
              setCurrentStep(5);
              setPercentage(100);
              setTimeout(() => router.push(`/${locale}/kiosk/results`), 800);
            } else if (statusData.status === "FAILED") {
              clearInterval(pollingRef.current!);
              setJobStatus("FAILED");
              setError(statusData.error ?? "Generation failed");
            } else {
              setJobStatus("PROCESSING");
            }
          } catch {
            // Network error during polling — keep trying
          }
        }, 3000);

      } catch (err) {
        setJobStatus("FAILED");
        setError(err instanceof Error ? err.message : "Failed to start generation");
      }
    }

    startJob();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const displayPct = Math.min(percentage + Math.floor(elapsed * 1.2), 95);

  if (error) {
    return (
      <div className="kiosk-screen relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-white/[0.02] blur-3xl" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 gap-8 sm:gap-10 relative z-10">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 sm:w-9 sm:h-9 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extralight text-white tracking-[0.1em]">{t("failed")}</h1>
            <p className="text-white/30 text-sm sm:text-base font-light mt-3">{error}</p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={() => {
                startedRef.current = false;
                setError(null);
                window.location.reload();
              }}
              className="w-full h-14 sm:h-16 bg-white text-black rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg active:scale-95 transition-transform"
            >
              {t("tryAgain")}
            </button>
            <button
              onClick={() => router.push(`/${locale}/kiosk/products`)}
              className="w-full h-12 sm:h-14 border border-white/15 text-white/70 rounded-xl font-light text-sm sm:text-base active:scale-95 transition-transform"
            >
              {t("startOver")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk-screen relative overflow-hidden">
      {/* Home button */}
      <div className="absolute top-5 right-5 sm:top-8 sm:right-8 z-30">
        <HomeButton />
      </div>

      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: "50vw", height: "50vw",
            background: "radial-gradient(circle, rgba(255,255,255,0.022) 0%, transparent 70%)",
            left: "5%", top: "10%",
            animation: "spin 20s linear infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "40vw", height: "40vw",
            background: "radial-gradient(circle, rgba(255,255,255,0.016) 0%, transparent 70%)",
            right: "5%", bottom: "15%",
            animation: "spin 28s linear infinite reverse",
          }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 gap-8 sm:gap-10 relative z-10 max-w-2xl mx-auto w-full">

        {/* Spinner */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
          <div className="absolute inset-0 rounded-full border border-white/8 animate-spin-slow" />
          <div
            className="absolute inset-2 rounded-full border border-white/15"
            style={{ animation: "spin 6s linear infinite reverse" }}
          />
          <div
            className="absolute inset-4 sm:inset-5 rounded-full border-t-2 border-white animate-spin"
            style={{ animationDuration: "1.5s" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/80 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-extralight text-white tracking-[0.2em] uppercase">
            {t("title")}
          </h1>
          <p className="text-white/30 text-sm sm:text-base mt-2 sm:mt-3 font-light">
            {elapsed > 45 ? t("almostThere") : t("subtitle")}
          </p>
        </div>

        {/* Step text */}
        <p
          key={currentStep}
          className="text-white/50 text-base sm:text-lg font-light tracking-wider text-center animate-fade-in"
        >
          {t(STEPS[currentStep])}
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-xs sm:max-w-sm">
          <div className="flex justify-between text-white/25 text-xs sm:text-sm mb-2 font-light">
            <span>{displayPct}%</span>
            <span>~30–60s</span>
          </div>
          <div className="w-full h-px bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/60 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${displayPct}%` }}
            />
          </div>
        </div>

        <div className="mt-4">
          <DeleteSessionButton variant="text" />
        </div>
      </div>
    </div>
  );
}
