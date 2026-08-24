import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { runFullAppPreload, type PreloadProgress } from "@/lib/app-preloader";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "Islam-Noor — Application Islamique" },
      {
        name: "description",
        content:
          "Islam-Noor, votre application islamique : horaires de prière, Qibla, Coran et scanner halal.",
      },
      { property: "og:title", content: "Islam-Noor — Application Islamique" },
      { property: "og:description", content: "Horaires de prière, Qibla, Coran et scanner halal." },
    ],
  }),
  component: SplashPage,
});

/** Floating Particles Data for Celestial Atmosphere */
const SPLASH_PARTICLES = [
  { left: "18%", top: "72%", size: 4, delay: "0s", duration: "4.2s" },
  { left: "82%", top: "68%", size: 3, delay: "0.6s", duration: "5.0s" },
  { left: "28%", top: "22%", size: 3, delay: "1.2s", duration: "4.5s" },
  { left: "75%", top: "28%", size: 5, delay: "1.8s", duration: "3.8s" },
  { left: "12%", top: "45%", size: 3, delay: "2.4s", duration: "5.2s" },
  { left: "88%", top: "48%", size: 4, delay: "3.0s", duration: "4.1s" },
  { left: "42%", top: "85%", size: 3, delay: "3.6s", duration: "4.8s" },
  { left: "62%", top: "82%", size: 4, delay: "4.2s", duration: "3.6s" },
];

/** Pure animated vector Crescent Moon & Stars for Splash visual */
export function SplashCrescentSymbol() {
  return (
    <div className="relative flex flex-col items-center justify-center animate-logo-appear">
      {/* 1. Multi-layered breathing ambient golden halo aura */}
      <div className="absolute size-56 sm:size-64 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-300/25 to-amber-600/30 blur-3xl animate-splash-glow pointer-events-none" />
      <div className="absolute size-36 sm:size-44 rounded-full bg-amber-300/20 blur-xl animate-pulse pointer-events-none" />

      {/* 2. Floating Cosmic Light Particles */}
      <div className="absolute inset-0 -m-8 pointer-events-none overflow-visible">
        {SPLASH_PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-200/90 blur-[0.3px] shadow-[0_0_8px_#fde047] animate-splash-particle"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* 3. Floating Geometric Crescent & Celestial Stars Container */}
      <div className="relative size-40 sm:size-48 flex items-center justify-center animate-splash-float">
        <svg
          viewBox="0 0 200 200"
          className="size-full drop-shadow-[0_14px_32px_rgba(245,158,11,0.5)] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Rich Golden Gradient */}
            <linearGradient
              id="splashMoonGold"
              x1="20"
              y1="20"
              x2="180"
              y2="180"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="18%" stopColor="#fef08a" />
              <stop offset="48%" stopColor="#f59e0b" />
              <stop offset="82%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Radiant Star Gold */}
            <linearGradient
              id="splashStarGold"
              x1="0"
              y1="0"
              x2="30"
              y2="30"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Inner Sheen Radial Glow */}
            <radialGradient id="splashCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#fde047" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            {/* 100% Mathematically Perfect Circle Crescent Mask */}
            <mask id="perfectGeometricCrescentMask">
              {/* Outer circle: center (100, 100), radius 70 */}
              <circle cx="100" cy="100" r="70" fill="#ffffff" />
              {/* Subtracting inner circle: center (126, 88), radius 62 */}
              <circle cx="126" cy="88" r="62" fill="#000000" />
            </mask>

            {/* Inner Highlight Crescent Edge Mask */}
            <mask id="crescentInnerEdgeMask">
              <circle cx="100" cy="100" r="68" fill="#ffffff" />
              <circle cx="123" cy="89" r="62" fill="#000000" />
            </mask>
          </defs>

          {/* Orbit Celestial Ring with Rotation */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="url(#splashStarGold)"
            strokeWidth="1.2"
            strokeDasharray="4 8 12 8"
            opacity="0.32"
            className="animate-[spin_35s_linear_infinite]"
          />

          {/* 100% Geometrically Pristine Crescent Moon Body */}
          <rect
            x="10"
            y="10"
            width="180"
            height="180"
            fill="url(#splashMoonGold)"
            mask="url(#perfectGeometricCrescentMask)"
          />

          {/* Shimmer / Sheen Layer across Moon surface */}
          <rect
            x="10"
            y="10"
            width="180"
            height="180"
            fill="url(#splashCenterGlow)"
            mask="url(#crescentInnerEdgeMask)"
            opacity="0.65"
          />

          {/* 1. Primary 8-Point Islamic Star (Khatam Suleiman) nestled in Crescent Nook */}
          <g
            transform="translate(142, 60) scale(1.0)"
            className="animate-[pulse_2.2s_ease-in-out_infinite]"
          >
            <path
              d="M 0,-16 L 4,-5 L 11,-11 L 5,-4 L 16,0 L 5,4 L 11,11 L 4,5 L 0,16 L -4,5 L -11,11 L -5,4 L -16,0 L -5,-4 L -11,-11 L -4,-5 Z"
              fill="url(#splashStarGold)"
              className="drop-shadow-[0_0_8px_rgba(254,240,138,0.9)]"
            />
            <circle cx="0" cy="0" r="3" fill="#ffffff" opacity="0.95" />
          </g>

          {/* 2. Secondary 4-Point Sparkling Stars */}
          <g
            transform="translate(154, 118) scale(0.75)"
            className="animate-[pulse_2.8s_ease-in-out_infinite_300ms]"
          >
            <path
              d="M 0,-14 L 3,-3 L 14,0 L 3,3 L 0,14 L -3,3 L -14,0 L -3,-3 Z"
              fill="#fde047"
              className="drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]"
            />
          </g>

          <g
            transform="translate(42, 48) scale(0.65)"
            className="animate-[pulse_3.4s_ease-in-out_infinite_800ms]"
          >
            <path
              d="M 0,-14 L 3,-3 L 14,0 L 3,3 L 0,14 L -3,3 L -14,0 L -3,-3 Z"
              fill="#fffbeb"
              opacity="0.9"
            />
          </g>

          <g
            transform="translate(112, 172) scale(0.55)"
            className="animate-[pulse_2.4s_ease-in-out_infinite_1200ms]"
          >
            <path
              d="M 0,-14 L 3,-3 L 14,0 L 3,3 L 0,14 L -3,3 L -14,0 L -3,-3 Z"
              fill="#fde047"
              opacity="0.85"
            />
          </g>

          <g
            transform="translate(54, 142) scale(0.5)"
            className="animate-[pulse_3.8s_ease-in-out_infinite_1600ms]"
          >
            <path
              d="M 0,-14 L 3,-3 L 14,0 L 3,3 L 0,14 L -3,3 L -14,0 L -3,-3 Z"
              fill="#fef08a"
              opacity="0.75"
            />
          </g>

          <g
            transform="translate(166, 82) scale(0.4)"
            className="animate-[pulse_2.0s_ease-in-out_infinite_500ms]"
          >
            <path d="M 0,-14 L 3,-3 L 14,0 L 3,3 L 0,14 L -3,3 L -14,0 L -3,-3 Z" fill="#ffffff" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function SplashPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user, guest } = useAuth();
  const [progress, setProgress] = useState<PreloadProgress>({
    step: 0,
    totalSteps: 5,
    percentage: 0,
    status: t.splashInit,
    statusKey: "splashInit",
  });

  useEffect(() => {
    let active = true;

    runFullAppPreload((p) => {
      if (active) {
        setProgress(p);
      }
    }).then(({ userLoggedIn }) => {
      if (!active) return;

      // Small pause at 100% for smooth transition
      setTimeout(() => {
        navigate({ to: "/" });
      }, 400);
    });

    return () => {
      active = false;
    };
  }, [navigate, user, guest]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-8 py-12 text-center select-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #633218 0%, #442010 40%, #240e06 85%, #180803 100%)",
      }}
    >
      {/* Background Islamic Mandala Ornament (matching Image 2) */}
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
          {t.appName}
        </h1>
        <p className="mt-1 text-base font-semibold text-amber-200/90 tracking-wide">{t.tagline}</p>
      </div>

      {/* Bottom Progress Ring & Preparation Status (matching Image 2) */}
      <div className="relative z-10 flex flex-col items-center space-y-4 mb-4">
        {/* Glowing circular loader ring */}
        <div className="relative size-16 flex items-center justify-center">
          {/* Outer glowing blur */}
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
            {t.splashPrep}
          </p>
        </div>
      </div>
    </div>
  );
}
