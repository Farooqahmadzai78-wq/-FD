import { useEffect, useState } from "react";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import { runFullAppPreload, type PreloadProgress } from "@/lib/app-preloader";
import { SplashCrescentSymbol } from "@/routes/splash";

export function AppSplashGuard() {
  const { t } = useI18n();
  const { ready: settingsReady } = useSettings();
  const [isDone, setIsDone] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState<PreloadProgress>({
    step: 0,
    totalSteps: 5,
    percentage: 0,
    status: t.splashInit || "Initialisation de l'application...",
    statusKey: "splashInit",
  });

  useEffect(() => {
    let active = true;

    // Prevent background scroll while splash screen is active
    document.body.style.overflow = "hidden";

    runFullAppPreload(
      (p) => {
        if (active) {
          setProgress(p);
        }
      },
      () => settingsReady,
    ).then(() => {
      if (!active) return;

      // Small pause at 100% for smooth visual transition
      setTimeout(() => {
        if (!active) return;
        setFadingOut(true);
        setTimeout(() => {
          if (!active) return;
          setIsDone(true);
          document.body.style.overflow = "";
        }, 500); // 500ms fade duration
      }, 300);
    });

    return () => {
      active = false;
      document.body.style.overflow = "";
    };
  }, [settingsReady]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between overflow-hidden px-8 py-12 text-center select-none transition-opacity duration-500 ease-out ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #633218 0%, #442010 40%, #240e06 85%, #180803 100%)",
      }}
    >
      {/* Background Islamic Mandala Ornament */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          viewBox="0 0 400 400"
          className="size-[420px] max-w-[90vw] text-amber-200/20 animate-[spin_120s_linear_infinite]"
          fill="none"
          stroke="currentColor"
        >
          {/* Outer geometric rings */}
          <circle cx="200" cy="200" r="190" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
          <circle cx="200" cy="200" r="180" strokeWidth="1.5" opacity="0.8" />
          <circle cx="200" cy="200" r="160" strokeWidth="1" opacity="0.5" />
          <circle cx="200" cy="200" r="140" strokeWidth="2" opacity="0.8" />
          <circle cx="200" cy="200" r="120" strokeWidth="1" strokeDasharray="3 3" />

          {/* 16-pointed Islamic Star Mandala petals */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            return (
              <g key={i} transform={`rotate(${angle} 200 200)`}>
                <path
                  d="M200 20 C215 50 215 80 200 100 C185 80 185 50 200 20Z"
                  fill="currentColor"
                  opacity="0.12"
                />
                <path d="M200 20 L200 100" strokeWidth="1" opacity="0.4" />
                <circle cx="200" cy="40" r="3.5" fill="currentColor" opacity="0.6" />
                <path
                  d="M200 140 C218 160 218 180 200 200 C182 180 182 160 200 140Z"
                  strokeWidth="1"
                  opacity="0.3"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Top spacer */}
      <div className="h-6" />

      {/* Center Logo & Branding Block */}
      <div className="relative z-10 flex flex-col items-center my-auto">
        <SplashCrescentSymbol />

        <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-white font-serif drop-shadow-md">
          {t.appName || "Islam-Noor"}
        </h1>
        <p className="mt-1 text-base font-semibold text-amber-200/90 tracking-wide">
          {t.tagline || "Application Islamique"}
        </p>
      </div>

      {/* Bottom Progress Ring & Preparation Status */}
      <div className="relative z-10 flex flex-col items-center space-y-4 mb-4">
        {/* Glowing circular loader ring */}
        <div className="relative size-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md animate-pulse" />

          <svg className="size-full -rotate-90" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r="24"
              className="text-amber-950/60"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
            />
            <circle
              cx="30"
              cy="30"
              r="24"
              className="text-amber-300 transition-all duration-300 ease-out"
              strokeWidth="4"
              strokeDasharray={150.79}
              strokeDashoffset={150.79 - (150.79 * progress.percentage) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 6px rgba(251, 191, 36, 0.7))",
              }}
            />
          </svg>

          <span
            className="absolute font-mono text-[11px] font-extrabold text-amber-100"
            suppressHydrationWarning
          >
            {`${progress.percentage}%`}
          </span>
        </div>

        {/* Dynamic Preloading Status Indicator */}
        <div className="space-y-1 max-w-xs">
          <p
            className="text-xs font-semibold text-amber-100/90 transition-all duration-300 min-h-[1.25rem]"
            suppressHydrationWarning
          >
            {progress.statusKey && t[progress.statusKey] ? t[progress.statusKey] : progress.status}
          </p>
          <p
            className="text-[10px] text-amber-300/60 tracking-wider uppercase font-medium"
            suppressHydrationWarning
          >
            {t.splashPrep || "Préparation de l'application"}
          </p>
        </div>
      </div>
    </div>
  );
}
