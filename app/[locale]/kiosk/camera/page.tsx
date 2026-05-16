"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { SilhouetteOverlay } from "@/components/kiosk/SilhouetteOverlay";
import { CountdownOverlay } from "@/components/kiosk/CountdownOverlay";
import { PhotoConfirm } from "@/components/kiosk/PhotoConfirm";
import { DeleteSessionButton } from "@/components/ui/DeleteSessionButton";
import { HomeButton } from "@/components/ui/HomeButton";

type CameraState = "POSITIONING" | "COUNTDOWN" | "FLASH" | "CONFIRM";

const HINTS = [
  {
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
      </svg>
    ),
    labelKey: "hintFullBody" as const,
  },
  {
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    labelKey: "hintFace" as const,
  },
  {
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    labelKey: "hintCenter" as const,
  },
  {
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
    labelKey: "hintLight" as const,
  },
] as const;

export default function CameraPage() {
  const t = useTranslations("camera");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("POSITIONING");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { setPhotoDataUrl, setPhotoUploadUrl, sessionId } = useKioskStore();

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            facingMode: "user",
            frameRate: { ideal: 30 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        const error = err as DOMException;
        if (error.name === "NotAllowedError") {
          setCameraError(t("errorPermission"));
        } else if (error.name === "NotFoundError") {
          setCameraError(t("errorNotFound"));
        } else {
          setCameraError(t("errorPermission"));
        }
      }
    }
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [t]);

  const capturePhoto = useCallback(() => {
    setCameraState("FLASH");
    setTimeout(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setCapturedImage(dataUrl);
      setPhotoDataUrl(dataUrl);
      setCameraState("CONFIRM");
    }, 300);
  }, [setPhotoDataUrl]);

  async function handleConfirmPhoto() {
    if (!capturedImage) return;
    setUploading(true);
    try {
      const res = await fetch("/api/photo/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId ?? "temp",
          imageDataUrl: capturedImage,
        }),
      });
      const data = await res.json();
      setPhotoUploadUrl(data.photoUrl);
    } catch {
      setPhotoUploadUrl(capturedImage);
    } finally {
      setUploading(false);
      router.push(`/${locale}/kiosk/gender`);
    }
  }

  function handleRetake() {
    setCapturedImage(null);
    setPhotoDataUrl(null);
    setCameraState("POSITIONING");
  }

  if (cameraState === "CONFIRM" && capturedImage) {
    return (
      <PhotoConfirm
        imageDataUrl={capturedImage}
        onConfirm={handleConfirmPhoto}
        onRetake={handleRetake}
        uploading={uploading}
      />
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">

      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Silhouette guide */}
      {cameraState !== "FLASH" && (
        <SilhouetteOverlay dimmed={cameraState === "COUNTDOWN"} />
      )}

      {/* Flash */}
      {cameraState === "FLASH" && (
        <div className="absolute inset-0 bg-white z-50 animate-fade-in" />
      )}

      {/* Countdown */}
      {cameraState === "COUNTDOWN" && (
        <CountdownOverlay
          onCapture={capturePhoto}
          onCancel={() => setCameraState("POSITIONING")}
        />
      )}

      {/* Camera error */}
      {cameraError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 px-8">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 sm:w-9 sm:h-9 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
            <p className="text-white text-base sm:text-xl font-light">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Bottom UI */}
      {cameraState === "POSITIONING" && !cameraError && (
        <div
          className="absolute bottom-0 left-0 right-0 z-20"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)" }}
        >
          <div className="max-w-lg mx-auto px-6 sm:px-10 pb-8 sm:pb-12 pt-10 sm:pt-14">

            {/* Hints */}
            <div className="flex justify-center gap-5 sm:gap-10 mb-5 sm:mb-7">
              {HINTS.map((hint) => (
                <div key={hint.labelKey} className="flex flex-col items-center gap-1.5 text-white/45">
                  {hint.icon}
                  <span className="text-[10px] sm:text-xs font-light tracking-wide">{t(hint.labelKey)}</span>
                </div>
              ))}
            </div>

            {/* Guide text */}
            <p className="text-center text-white/55 text-sm sm:text-base font-light mb-5 sm:mb-6 tracking-wide">
              {t("guide")}
            </p>

            {/* Take Photo button */}
            <button
              onClick={() => setCameraState("COUNTDOWN")}
              className="w-full h-16 sm:h-20 bg-white text-black rounded-2xl text-lg sm:text-2xl font-semibold active:scale-95 transition-transform shadow-2xl tracking-wide flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              {t("takePhoto")}
            </button>

            <div className="flex justify-center mt-4 sm:mt-5">
              <DeleteSessionButton variant="text" />
            </div>
          </div>
        </div>
      )}

      {/* Back + Home */}
      {cameraState === "POSITIONING" && (
        <div className="absolute top-5 sm:top-7 left-5 sm:left-7 right-5 sm:right-7 z-20 flex items-center justify-between">
          <button
            onClick={() => router.push(`/${locale}/kiosk/consent`)}
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-black/40 border border-white/10 text-white/60 text-sm sm:text-base active:opacity-60 backdrop-blur-sm"
          >
            ←
          </button>
          <HomeButton />
        </div>
      )}
    </div>
  );
}
