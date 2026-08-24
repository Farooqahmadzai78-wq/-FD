import { useEffect, useRef, useState } from "react";
import { Camera, Check, Compass, LocateFixed, Sliders, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQiblaSensors } from "@/hooks/useQiblaSensors";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";
import { formatLocalizedPlace } from "@/lib/prayer-times";
import { angleDiff, unwrapAngle } from "@/lib/qibla-geo";
import { QiblaARView } from "@/components/QiblaARView";

import type { Dict } from "@/lib/locales/en";

function KaabaSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* Cube shadow */}
      <ellipse cx="32" cy="54" rx="20" ry="5" fill="black" opacity="0.15" />
      {/* Kaaba Base Structure */}
      <path d="M32 10 L52 20 L52 48 L32 58 L12 48 L12 20 Z" fill="#18181b" />
      {/* Left Wall Shader */}
      <path d="M12 20 L32 30 L32 58 L12 48 Z" fill="#09090b" opacity="0.85" />
      {/* Right Wall Shader */}
      <path d="M32 30 L52 20 L52 48 L32 58 Z" fill="#27272a" />
      {/* Roof Top */}
      <path d="M32 10 L52 20 L32 30 L12 20 Z" fill="#3f3f46" />
      {/* Golden Kiswah Band (Upper band around the Kaaba) */}
      <path d="M12 26 L32 36 L52 26 L52 29.5 L32 39.5 L12 29.5 Z" fill="url(#goldGradient)" />
      {/* Golden Door (Bab al-Kaaba) on the right wall */}
      <path
        d="M37 36.5 L45 32.5 L45 46 L37 50 Z"
        fill="url(#goldGradient)"
        stroke="#fef08a"
        strokeWidth="0.5"
      />
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
    </svg>
  );
}

type StyleId = 1 | 2 | 3 | 4;

/**
 * FIXED DIAL COMPONENT
 * As requested in Rule 5:
 * - Outer circle stays fixed
 * - Graduations stay fixed
 * - N, E, S, O letters stay fixed
 * - Kaaba target logo at top stays fixed
 * - Background stays fixed
 */
function FixedDial({ styleId, isAligned }: { styleId: StyleId; isAligned: boolean }) {
  const { t } = useI18n();
  const accentColor = isAligned ? "#10b981" : "#f59e0b";

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Style 1: Modèle 1 – Moderne Minimaliste */}
      {styleId === 1 && (
        <>
          <div className="absolute inset-2 rounded-full border border-foreground/20 bg-background/50 backdrop-blur-sm" />
          <div className="absolute inset-5 rounded-full border border-foreground/10" />
          {Array.from({ length: 60 }).map((_, i) => {
            const deg = i * 6;
            const isMajor = i % 5 === 0;
            return (
              <span
                key={i}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300 ${
                  isMajor
                    ? isAligned
                      ? "bg-emerald-500 w-0.5 h-3.5"
                      : "bg-amber-500 w-0.5 h-3.5"
                    : "bg-foreground/25 w-0.5 h-1.5"
                }`}
                style={{
                  transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-118px)`,
                }}
              />
            );
          })}
        </>
      )}

      {/* Style 2: Modèle 2 – Luxe Islamique */}
      {styleId === 2 && (
        <>
          <div className="absolute inset-1 rounded-full bg-zinc-950/90 border-2 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)]" />
          <div className="absolute inset-5 rounded-full border border-dashed border-amber-500/35" />
          {/* Intricate Islamic Mandala Star Pattern */}
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={`star-${i}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-amber-500/30"
              style={{
                width: 80,
                height: 80,
                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              }}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm border"
              style={{
                width: 16,
                height: 16,
                borderColor: isAligned ? "#10b981" : "#f59e0b",
                opacity: i % 2 === 0 ? 0.9 : 0.4,
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-116px) rotate(45deg)`,
              }}
            />
          ))}
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={`dot-${i}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-400/80"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-118px)`,
              }}
            />
          ))}
        </>
      )}

      {/* Style 3: Modèle 3 – Digital 3D */}
      {styleId === 3 && (
        <>
          <div className="absolute inset-1 rounded-full bg-slate-950/90 border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.25)]" />
          <div className="absolute inset-6 rounded-full border border-dashed border-cyan-400/40" />
          {Array.from({ length: 36 }).map((_, i) => {
            const deg = i * 10;
            const isQuarter = i % 9 === 0;
            return (
              <span
                key={i}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-colors duration-300 ${
                  isQuarter
                    ? "bg-cyan-400 w-1 h-3 shadow-[0_0_10px_#22d3ee]"
                    : "bg-cyan-500/30 w-0.5 h-1.5"
                }`}
                style={{
                  transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-118px)`,
                }}
              />
            );
          })}
        </>
      )}

      {/* Style 4: Modèle 4 – Classique Premium */}
      {styleId === 4 && (
        <>
          {/* Brass Outer Rim with Cream Dial */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-b from-amber-200 via-amber-600 to-amber-900 p-1.5 shadow-xl border border-amber-700/60">
            <div className="w-full h-full rounded-full bg-[#faf6ed] dark:bg-[#1f1b16] border-2 border-amber-800/30 relative overflow-hidden" />
          </div>

          {/* Center 8-pointed Compass Rose Star */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-75">
            <svg width="130" height="130" viewBox="0 0 100 100">
              <polygon points="50,5 56,44 50,50 44,44" fill="#d97706" />
              <polygon points="50,5 50,50 44,44" fill="#b45309" />
              <polygon points="50,95 56,56 50,50 44,56" fill="#d97706" />
              <polygon points="50,95 50,50 56,56" fill="#b45309" />
              <polygon points="95,50 56,56 50,50 56,44" fill="#d97706" />
              <polygon points="95,50 50,50 56,56" fill="#b45309" />
              <polygon points="5,50 44,44 50,50 44,56" fill="#d97706" />
              <polygon points="5,50 50,50 44,44" fill="#b45309" />
              <polygon points="82,18 56,44 50,50 56,38" fill="#f59e0b" opacity="0.6" />
              <polygon points="18,82 44,56 50,50 44,62" fill="#f59e0b" opacity="0.6" />
              <polygon points="18,18 44,44 50,50 38,44" fill="#f59e0b" opacity="0.6" />
              <polygon points="82,82 56,56 50,50 62,56" fill="#f59e0b" opacity="0.6" />
            </svg>
          </div>

          {/* Degree Numbers around perimeter */}
          {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => (
            <span
              key={deg}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-serif font-bold text-amber-900/80 dark:text-amber-200/80"
              style={{
                transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-114px) rotate(${-deg}deg)`,
              }}
            >
              {deg}
            </span>
          ))}
        </>
      )}

      {/* FIXED CARDINAL LETTERS */}
      {[
        {
          label: t.cardinalN || "N",
          sub: styleId === 4 ? "ش" : undefined,
          angle: 0,
          color: isAligned
            ? "text-emerald-500"
            : styleId === 3
              ? "text-cyan-400"
              : "text-amber-500",
        },
        {
          label: t.cardinalE || "E",
          sub: styleId === 4 ? "ق" : undefined,
          angle: 90,
          color: "text-muted-foreground/70",
        },
        {
          label: t.cardinalS || "S",
          sub: styleId === 4 ? "ج" : undefined,
          angle: 180,
          color: "text-muted-foreground/70",
        },
        {
          label: t.cardinalW || "W",
          sub: styleId === 4 ? "غ" : undefined,
          angle: 270,
          color: "text-muted-foreground/70",
        },
      ].map((c, idx) => (
        <span
          key={idx}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black tracking-wider flex items-center gap-0.5 ${c.color}`}
          style={{
            transform: `translate(-50%, -50%) rotate(${c.angle}deg) translateY(-96px) rotate(${-c.angle}deg)`,
          }}
        >
          {c.label}
          {c.sub && <span className="text-[10px] font-normal opacity-70 ml-0.5">{c.sub}</span>}
        </span>
      ))}

      {/* FIXED KAABA TARGET AT THE TOP (0° / 12 o'clock) */}
      <div
        className={`absolute top-3 left-1/2 -translate-x-1/2 grid size-10 place-items-center rounded-2xl transition-all duration-500 ${
          isAligned
            ? "bg-emerald-500 text-white shadow-[0_0_24px_rgba(16,185,129,0.8)] ring-4 ring-emerald-300 scale-110 animate-pulse"
            : styleId === 3
              ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
              : "bg-amber-500/15 border border-amber-500/30 text-amber-500"
        }`}
      >
        <KaabaSvg className="size-6" />
      </div>
    </div>
  );
}

export function QiblaCompass() {
  const { t } = useI18n();
  const { settings, update } = useSettings();
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [compassMode, setCompassMode] = useState<"style" | "ar">("style");

  const fallbackCoords = settings.place
    ? { lat: settings.place.lat, lon: settings.place.lon }
    : null;

  const {
    coords,
    heading,
    qiblaBearing,
    kaabaDistanceKm,
    angularError,
    isAligned,
    isInterferenceDetected,
    status,
    errorKey,
    requestLocation,
  } = useQiblaSensors(fallbackCoords);

  // 60 FPS smooth animated needle angle
  const [animatedNeedleAngle, setAnimatedNeedleAngle] = useState<number>(0);
  const animRef = useRef<number | null>(null);
  const currentNeedleAngleRef = useRef<number>(0);
  const prevAlignedRef = useRef<boolean>(false);
  const [showLocationWarning, setShowLocationWarning] = useState<boolean>(true);

  useEffect(() => {
    if (status === "denied_location") {
      setShowLocationWarning(true);
      const mountedAt = Date.now();
      const timer = setTimeout(() => {
        setShowLocationWarning(false);
      }, 5000);

      const handleVisibility = () => {
        if (document.visibilityState === "visible" && Date.now() - mountedAt >= 5000) {
          setShowLocationWarning(false);
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    }
  }, [status]);

  // Calculate target needle angle: (qiblaBearing - heading)
  const targetNeedleAngle =
    qiblaBearing !== null && heading !== null ? (qiblaBearing - heading + 360) % 360 : 0;

  // 60 FPS Smooth Interpolation Loop
  useEffect(() => {
    let active = true;

    const loop = () => {
      if (!active) return;

      const current = currentNeedleAngleRef.current;
      const unwrappedTarget = unwrapAngle(targetNeedleAngle, current);

      // Lerp factor 0.15 for silky smooth rotation
      const next = current + (unwrappedTarget - current) * 0.15;
      currentNeedleAngleRef.current = next;
      setAnimatedNeedleAngle(next);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [targetNeedleAngle]);

  // Haptic feedback & vibration trigger when aligned
  useEffect(() => {
    if (isAligned && !prevAlignedRef.current) {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([70, 40, 70, 40, 90]);
        } catch {
          /* ignore */
        }
      }
    }
    prevAlignedRef.current = isAligned;
  }, [isAligned]);

  const styleId = (settings.compassStyle ?? 1) as StyleId;

  const STYLES: { id: StyleId; name: string; desc: string }[] = [
    {
      id: 1,
      name: t.compassStyle1Name || "Moderne Minimaliste",
      desc: t.compassStyle1Desc || "Style épuré et moderne",
    },
    {
      id: 2,
      name: t.compassStyle2Name || "Luxe Islamique",
      desc: t.compassStyle2Desc || "Design premium avec motifs islamiques",
    },
    {
      id: 3,
      name: t.compassStyle3Name || "Digital 3D",
      desc: t.compassStyle3Desc || "Affichage numérique 3D",
    },
    {
      id: 4,
      name: t.compassStyle4Name || "Classique Premium",
      desc: t.compassStyle4Desc || "Style boussole traditionnelle",
    },
  ];

  return (
    <section id="qibla" className="glass relative scroll-mt-4 p-4 text-center overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="text-left">
          <h2 className="text-base font-extrabold flex items-center gap-1.5">
            <Compass className="size-4.5 text-amber-500" />
            {t.qiblaTitle || "Boussole Qibla"}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {t.qiblaSub || "Orientation précise vers la Kaaba à La Mecque"}
          </p>
        </div>

        {/* Side-by-Side Mode Selector: Style & AR */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-muted/80 border border-border/60 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (compassMode === "style") {
                setShowStyleMenu(!showStyleMenu);
              } else {
                setCompassMode("style");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              compassMode === "style"
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="size-3.5 text-amber-500" />
            <span>{t.compassStyleLabel || t.styleTab || "Style"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCompassMode("ar");
              setShowStyleMenu(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              compassMode === "ar"
                ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Camera className="size-3.5" />
            <span>AR</span>
          </button>
        </div>
      </div>

      {/* Style Picker Menu Modal / Accordion */}
      {showStyleMenu && (
        <div className="mt-3 p-3 rounded-2xl bg-muted/60 border border-border/80 text-left animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-bold mb-2 text-foreground flex items-center gap-1">
            <Sparkles className="size-3.5 text-amber-500" />
            {t.compassStyle || "Style de boussole"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  update({ compassStyle: s.id });
                  setShowStyleMenu(false);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  styleId === s.id
                    ? "border-amber-500 bg-amber-500/10 shadow-sm font-bold"
                    : "border-border/60 hover:bg-background/80"
                }`}
              >
                <p className="text-xs font-bold">{s.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Permission Warning Card for Location */}
      {status === "denied_location" && showLocationWarning && (
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-bold text-amber-600 dark:text-amber-400">
              {t.qiblaLocationNeeded || "GPS restreint — Position approximative"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t.qiblaCalcBasedOnCity || "Calcul de la Qibla basé sur la ville sélectionnée :"}{" "}
              <strong className="text-foreground">
                {settings.place
                  ? formatLocalizedPlace(settings.place, t)
                  : t.makkahName || "La Mecque"}
              </strong>
              .
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold h-8 text-xs rounded-xl"
            onClick={requestLocation}
          >
            <LocateFixed className="size-3.5 mr-1" />
            {t.allow || "Réessayer GPS"}
          </Button>
        </div>
      )}

      {/* Unsupported Sensors Warning Card */}
      {status === "unsupported_sensors" && (
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left flex items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-bold text-amber-600 dark:text-amber-400">
              {t.qiblaDeviceNotSupported || "Capteurs d'orientation non disponibles."}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t.qiblaSensorsNotActiveMsg ||
                "Veuillez vérifier que les capteurs de boussole / magnétomètre sont activés sur votre appareil."}
            </p>
          </div>
        </div>
      )}

      {/* Magnetic Interference Warning Card */}
      {isInterferenceDetected && status === "active" && (
        <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left flex items-center gap-2.5">
          <Sparkles className="size-4 shrink-0 text-amber-500" />
          <div className="text-xs">
            <p className="font-bold text-amber-600 dark:text-amber-400">
              {t.magneticInterferenceTitle || "Perturbation magnétique détectée"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {t.magneticInterferenceSub ||
                "Déplacez votre téléphone en forme de 8 à l'écart des objets métalliques pour calibrer."}
            </p>
          </div>
        </div>
      )}

      {/* AR Mode or Style Mode Content */}
      {compassMode === "ar" ? (
        <div className="mt-4 animate-in fade-in duration-300">
          <QiblaARView
            heading={heading}
            qiblaBearing={qiblaBearing}
            angularError={angularError}
            isAligned={isAligned}
            kaabaDistanceKm={kaabaDistanceKm}
            cityName={settings.place?.name}
          />
        </div>
      ) : (
        <>
          {/* MAIN COMPASS DIAL CONTAINER */}
          <div className="relative mx-auto mt-5 size-72 sm:size-80 rounded-full flex items-center justify-center select-none transition-all duration-500">
            {/* Outer Glow Halo Ring when aligned */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                isAligned
                  ? "bg-emerald-500/15 shadow-[0_0_60px_16px_rgba(16,185,129,0.45)] ring-4 ring-emerald-400"
                  : "border-4 border-border/80 shadow-inner"
              }`}
            />

            {/* Outer Decorative Ring */}
            <div className="absolute inset-2 rounded-full border border-amber-500/20" />

            {/* FIXED DIAL (Circle, Graduations, Cardinal Letters, Kaaba Target Logo at Top) */}
            <FixedDial styleId={styleId} isAligned={isAligned} />

            {/* ROTATING NEEDLE / CENTRAL BAR */}
            <div
              className="absolute inset-0 will-change-transform"
              style={{ transform: `rotate(${animatedNeedleAngle}deg)` }}
            >
              {/* Main Arrow Line */}
              <span
                className={`absolute top-[42px] left-1/2 -translate-x-1/2 rounded-full transition-all duration-300 ${
                  isAligned
                    ? "w-2.5 h-[106px] sm:h-[122px] bg-gradient-to-b from-emerald-400 via-emerald-500 to-amber-400 shadow-[0_0_18px_rgba(16,185,129,0.9)]"
                    : "w-1.5 h-[98px] sm:h-[114px] bg-gradient-to-b from-amber-500 via-amber-400 to-foreground/30"
                }`}
              />

              {/* Needle Arrow Head / Pointer Top */}
              <div
                className={`absolute top-5 left-1/2 -translate-x-1/2 grid size-8 place-items-center rounded-full transition-all duration-300 ${
                  isAligned
                    ? "bg-emerald-500 text-white shadow-lg ring-2 ring-white scale-125"
                    : "bg-amber-500 text-white shadow-md scale-100"
                }`}
              >
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-white -mt-0.5" />
              </div>
            </div>

            {/* CENTRAL HUB (Shows Bearing in Degrees & Kaaba Distance) */}
            <div
              className={`absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-2xl transition-all duration-500 ${
                isAligned
                  ? "size-24 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white ring-4 ring-emerald-300 scale-110 shadow-emerald-500/50"
                  : "size-24 bg-background/90 backdrop-blur-md border border-border text-foreground"
              }`}
            >
              <p className="font-mono text-xl font-black tabular-nums tracking-tight">
                {qiblaBearing !== null ? `${Math.round(qiblaBearing)}°` : "--°"}
              </p>
              <p className="text-[10px] font-bold opacity-80 -mt-1">
                {kaabaDistanceKm !== null ? `${kaabaDistanceKm} km` : "—"}
              </p>
              <p className="text-[9px] text-amber-500 dark:text-amber-400 font-extrabold uppercase tracking-widest mt-0.5">
                Qibla
              </p>
            </div>
          </div>

          {/* ALIGNMENT STATUS MESSAGE BANNER */}
          <div className="mt-5 min-h-[44px] flex items-center justify-center">
            {isAligned ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-white px-6 py-2.5 text-xs font-black shadow-lg shadow-emerald-500/30 animate-bounce">
                <Check className="size-4 stroke-[3]" />
                {t.qiblaAlignedMsg || "Vous êtes aligné vers la Kaaba."}
              </div>
            ) : angularError !== null ? (
              <div className="inline-flex flex-col items-center gap-1">
                <p className="text-xs font-extrabold text-foreground">
                  {Math.abs(angularError) <= 15
                    ? t.qiblaAlmostAligned || "Encore quelques degrés..."
                    : t.qiblaFindDirection || "Trouvez la direction de la Kaaba."}
                </p>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {angularError > 0 ? (
                    <span>
                      {t.qiblaTurnPrefix || "Tournez de"}{" "}
                      <strong className="font-black text-amber-500">
                        {Math.round(Math.abs(angularError))}°
                      </strong>{" "}
                      {t.qiblaTurnToRight || "vers la droite"} ➔
                    </span>
                  ) : (
                    <span>
                      ◄ {t.qiblaTurnPrefix || "Tournez de"}{" "}
                      <strong className="font-black text-amber-500">
                        {Math.round(Math.abs(angularError))}°
                      </strong>{" "}
                      {t.qiblaTurnToLeft || "vers la gauche"}
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <p className="text-xs font-semibold text-muted-foreground">
                {t.qiblaTurnSlowly || "Tournez doucement votre téléphone."}
              </p>
            )}
          </div>
        </>
      )}

      {errorKey && (
        <p className="mt-3 text-[11px] font-semibold text-destructive">
          {t[errorKey as keyof Dict] || errorKey}
        </p>
      )}
    </section>
  );
}
