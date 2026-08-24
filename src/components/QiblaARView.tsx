import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Check, RotateCcw, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

function KaabaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <ellipse cx="32" cy="54" rx="20" ry="5" fill="black" opacity="0.25" />
      <path d="M32 10 L52 20 L52 48 L32 58 L12 48 L12 20 Z" fill="#18181b" />
      <path d="M12 20 L32 30 L32 58 L12 48 Z" fill="#09090b" opacity="0.85" />
      <path d="M32 30 L52 20 L52 48 L32 58 Z" fill="#27272a" />
      <path d="M32 10 L52 20 L32 30 L12 20 Z" fill="#3f3f46" />
      <path d="M12 26 L32 36 L52 26 L52 29.5 L32 39.5 L12 29.5 Z" fill="url(#goldGradientAr)" />
      <path
        d="M37 36.5 L45 32.5 L45 46 L37 50 Z"
        fill="url(#goldGradientAr)"
        stroke="#fef08a"
        strokeWidth="0.5"
      />
      <defs>
        <linearGradient id="goldGradientAr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface QiblaARViewProps {
  heading: number | null;
  qiblaBearing: number | null;
  angularError: number | null;
  isAligned: boolean;
  kaabaDistanceKm: number | null;
  cityName?: string;
}

export function QiblaARView({
  heading,
  qiblaBearing,
  angularError,
  isAligned,
  kaabaDistanceKm,
  cityName,
}: QiblaARViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraState, setCameraState] = useState<
    "idle" | "loading" | "active" | "denied" | "unsupported"
  >("idle");

  const startCamera = async () => {
    setCameraState("loading");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraState("unsupported");
        return;
      }

      // Stop any existing stream before opening a new one
      if (videoRef.current && videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject as MediaStream;
        oldStream.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }

      let stream: MediaStream | null = null;

      // 1. Enumerate devices to identify explicit rear/back camera deviceId if available
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        const backDevice = videoDevices.find((d) => {
          const lbl = d.label.toLowerCase();
          return (
            lbl.includes("back") ||
            lbl.includes("rear") ||
            lbl.includes("environment") ||
            lbl.includes("arrière") ||
            lbl.includes("outer") ||
            lbl.includes("camera 0")
          );
        });

        if (backDevice && backDevice.deviceId) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: backDevice.deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        }
      } catch {
        /* proceed to facingMode constraints */
      }

      // 2. Try exact environment facingMode
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        } catch {
          /* proceed to ideal environment constraint */
        }
      }

      // 3. Fallback to ideal environment constraint
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      }

      // 4. Strict check: Verify acquired video track is NOT user-facing (front camera forbidden)
      const track = stream.getVideoTracks()[0];
      if (track) {
        const settings = track.getSettings?.();
        const label = (track.label || "").toLowerCase();

        if (
          settings?.facingMode === "user" ||
          label.includes("front") ||
          label.includes("user") ||
          label.includes("selfie") ||
          label.includes("avant")
        ) {
          // Stop stream immediately and refuse front camera fallback
          track.stop();
          stream.getTracks().forEach((t) => t.stop());
          console.warn("[QiblaAR] Front camera detected and rejected for VR mode");
          setCameraState("denied");
          return;
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("active");
    } catch (err) {
      console.warn("[QiblaAR] Back camera access failed:", err);
      setCameraState("denied");
    }
  };

  useEffect(() => {
    startCamera();
    const videoEl = videoRef.current;

    return () => {
      if (videoEl && videoEl.srcObject) {
        const stream = videoEl.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const currentHeading = heading ?? 0;
  const targetBearing = qiblaBearing ?? 0;

  // Relative angle delta in range [-180, 180]
  const deltaAngle =
    qiblaBearing !== null && heading !== null ? ((qiblaBearing - heading + 540) % 360) - 180 : 0;

  // Field of View calculation (assume camera FOV ~ 60deg)
  // Mapping deltaAngle [-30deg, +30deg] to xPercent [0%, 100%]
  const fovHalf = 30;
  const rawXPercent = 50 + (deltaAngle / fovHalf) * 50;
  const isOffScreen = rawXPercent < 8 || rawXPercent > 92;
  const clampedXPercent = Math.max(10, Math.min(90, rawXPercent));

  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-square max-w-sm sm:max-w-md mx-auto rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none">
      {/* VIDEO FEED */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />

      {/* Simulated background or camera fallback gradient when camera is denied or loading */}
      {cameraState !== "active" && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-zinc-950 flex flex-col items-center justify-center p-6 text-center text-white z-10">
          {cameraState === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <div className="size-12 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
              <p className="text-xs font-bold text-amber-400">Lancement de la caméra AR...</p>
            </div>
          )}

          {cameraState === "denied" && (
            <div className="flex flex-col items-center gap-3 max-w-xs">
              <div className="size-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 grid place-items-center">
                <CameraOff className="size-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Caméra non disponible</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Autorisez l'accès à la caméra pour superposer la direction de la Qibla en réalité
                  augmentée.
                </p>
              </div>
              <Button
                size="sm"
                onClick={startCamera}
                className="mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl px-4 text-xs shadow-lg shadow-amber-500/20"
              >
                <Camera className="size-3.5 mr-1.5" />
                Autoriser la caméra
              </Button>
            </div>
          )}

          {cameraState === "unsupported" && (
            <div className="flex flex-col items-center gap-2">
              <AlertTriangle className="size-8 text-amber-400" />
              <p className="text-xs font-bold text-slate-300">Caméra non gérée sur ce navigateur</p>
            </div>
          )}
        </div>
      )}

      {/* CAMERA OVERLAY HUD (TOP DEGREE SCALE / RULER) */}
      <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none">
        <div className="rounded-2xl bg-slate-950/70 backdrop-blur-md border border-white/20 p-2.5 shadow-2xl text-white">
          {/* Top HUD Info bar */}
          <div className="flex items-center justify-between text-[11px] font-bold pb-2 border-b border-white/10 px-1">
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="size-3" />
              <span>AR Mode Qibla</span>
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 font-extrabold border border-white/10">
              Cap : {Math.round(currentHeading)}°
            </span>
            <span className="text-slate-300">
              Qibla : <strong className="text-amber-400">{Math.round(targetBearing)}°</strong>
            </span>
          </div>

          {/* Scrolling Horizontal Degree Scale (Degree Tape) */}
          <div className="relative h-9 mt-1 flex items-center justify-center overflow-hidden">
            {/* Central Target Notch Line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-emerald-400 z-10 shadow-[0_0_8px_#34d399]" />

            {/* Rotating / Sliding degree marks */}
            <div className="relative w-full h-full">
              {Array.from({ length: 13 }).map((_, i) => {
                const step = (i - 6) * 10; // -60deg to +60deg relative to current heading
                const tickDeg = (Math.round(currentHeading) + step + 360) % 360;
                const isTargetNear = Math.abs(tickDeg - Math.round(targetBearing)) < 5;

                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 flex flex-col items-center justify-between transition-transform duration-100"
                    style={{
                      left: `calc(50% + ${step * 2.5}px)`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <span
                      className={`w-0.5 ${
                        step === 0
                          ? "h-4 bg-emerald-400"
                          : isTargetNear
                            ? "h-4 bg-amber-400"
                            : i % 2 === 0
                              ? "h-3 bg-white/60"
                              : "h-2 bg-white/30"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-mono ${
                        isTargetNear
                          ? "text-amber-400 font-black"
                          : step === 0
                            ? "text-emerald-300 font-bold"
                            : "text-white/60"
                      }`}
                    >
                      {tickDeg}°
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CENTER TARGET RETICLE (Crosshair) */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none z-10">
        <div
          className={`relative size-24 rounded-full border-2 transition-all duration-300 grid place-items-center ${
            isAligned
              ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.7)] ring-4 ring-emerald-300 scale-110"
              : "border-white/30 bg-black/20 backdrop-blur-[2px]"
          }`}
        >
          {/* Target Reticle Crosshair Ticks */}
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/80" />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/80" />
          <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-2 h-0.5 bg-white/80" />
          <span className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-2 h-0.5 bg-white/80" />

          {/* Center Point */}
          <span
            className={`size-2 rounded-full transition-colors ${
              isAligned ? "bg-emerald-400 shadow-[0_0_10px_#34d399]" : "bg-amber-400"
            }`}
          />
        </div>
      </div>

      {/* FLOATING KAABA AR MARKER OVERLAY */}
      <div
        className="absolute top-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none z-30"
        style={{
          left: `${clampedXPercent}%`,
          transform: `translate(-50%, -50%)`,
        }}
      >
        <div className="flex flex-col items-center gap-1.5">
          {/* Directional Off-screen Arrow (if Kaaba is outside current viewport) */}
          {isOffScreen && (
            <div className="animate-bounce text-amber-400 font-black text-xs px-2.5 py-1 rounded-full bg-slate-950/80 border border-amber-500/50 shadow-xl flex items-center gap-1">
              {deltaAngle < 0 ? (
                <>
                  <span>◄</span>
                  <span>{Math.round(Math.abs(deltaAngle))}°</span>
                </>
              ) : (
                <>
                  <span>{Math.round(Math.abs(deltaAngle))}°</span>
                  <span>➔</span>
                </>
              )}
            </div>
          )}

          {/* KAABA BADGE / REPERE (Changes color to emerald green when aligned!) */}
          <div
            className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-500 backdrop-blur-md ${
              isAligned
                ? "bg-emerald-500 text-white border-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.9)] scale-110 animate-pulse"
                : "bg-slate-900/85 text-amber-300 border-amber-500/50 shadow-xl"
            }`}
          >
            <div
              className={`grid size-12 place-items-center rounded-xl p-1 transition-transform ${
                isAligned ? "bg-emerald-600 scale-105" : "bg-slate-950/80"
              }`}
            >
              <KaabaIcon className="size-8" />
            </div>

            <div className="text-center mt-1">
              <span
                className={`text-[10px] font-black uppercase tracking-widest block ${
                  isAligned ? "text-white" : "text-amber-300"
                }`}
              >
                KAABA (QIBLA)
              </span>
              <span className="text-[9px] font-bold opacity-80 block">
                {kaabaDistanceKm ? `${kaabaDistanceKm} km` : "La Mecque"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM AR ALIGNMENT STATUS FOOTER BANNER */}
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
        <div
          className={`p-3 rounded-2xl backdrop-blur-md text-center transition-all duration-300 border ${
            isAligned
              ? "bg-emerald-500 text-white border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.8)]"
              : "bg-slate-950/80 text-white border-white/20"
          }`}
        >
          {isAligned ? (
            <div className="flex items-center justify-center gap-2 text-xs font-black">
              <Check className="size-4 stroke-[3]" />
              <span>ALIGNÉ AVEC LA KAABA (QIBLA)</span>
            </div>
          ) : (
            <div className="text-xs font-bold">
              {deltaAngle > 0 ? (
                <span className="text-amber-300">
                  Tournez votre téléphone vers la droite ➔ (
                  <strong className="text-white">{Math.round(Math.abs(deltaAngle))}°</strong>)
                </span>
              ) : (
                <span className="text-amber-300">
                  ◄ Tournez votre téléphone vers la gauche (
                  <strong className="text-white">{Math.round(Math.abs(deltaAngle))}°</strong>)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
