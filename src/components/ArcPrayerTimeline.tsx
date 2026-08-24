import React, { useMemo } from "react";
import { Sunrise, Sun, SunMedium, Sunset, Moon } from "lucide-react";
import {
  PRAYER_KEYS,
  ARABIC_NAMES,
  cleanTime,
  toDateToday,
  formatPrayerTime,
  type PrayerKey,
  type DayTimes,
} from "@/lib/prayer-times";
import { getWidgetThemeById } from "@/lib/customization-themes";
import { useSettings } from "@/lib/app-settings";
import { useI18n } from "@/lib/i18n";

type ArcPrayerTimelineProps = {
  data: DayTimes | null;
  now: Date;
  next: { key: PrayerKey; at: Date; tomorrow: boolean } | null;
  placeName?: string;
};

const PRAYER_ICONS: Record<PrayerKey, React.ComponentType<{ className?: string }>> = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: SunMedium,
  Maghrib: Sunset,
  Isha: Moon,
};

export function ArcPrayerTimeline({ data, now, next }: ArcPrayerTimelineProps) {
  const { t, locale, dir } = useI18n();
  const { settings } = useSettings();
  const activeWidgetTheme = getWidgetThemeById(settings.widgetTheme);

  // Algorithm: Determine active upcoming prayer in real-time
  // Find the first prayer whose time today is strictly > now.
  // If all prayers today have passed (after Isha), active prayer is tomorrow's Fajr.
  const activeKey = useMemo<PrayerKey>(() => {
    if (!data?.timings) return (next?.key as PrayerKey) || "Asr";

    const timings = data.timings;
    const nowMs = now.getTime();

    const prayerDates = PRAYER_KEYS.map((k) => ({
      key: k,
      date: toDateToday(timings[k], now),
    }));

    const upcoming = prayerDates.find((p) => p.date.getTime() > nowMs);

    return upcoming ? upcoming.key : "Fajr";
  }, [data?.timings, now, next?.key]);

  const activeIndex = PRAYER_KEYS.indexOf(activeKey);

  // Dynamic horizontal position alignment per prayer card to recreate exact image staggering:
  // Fajr: Shifted Left
  // Dhuhr: Shifted Right
  // Asr: Center / Prominent
  // Maghrib: Shifted Right
  // Isha: Shifted Left
  const getCardAlignment = (key: PrayerKey, isActive: boolean) => {
    if (isActive) {
      return "ml-auto mr-auto xs:ml-16 sm:ml-20 z-30 scale-[1.06]";
    }
    switch (key) {
      case "Fajr":
        return "mr-auto ml-1 xs:ml-4 sm:ml-8 z-20 scale-[0.98]";
      case "Dhuhr":
        return "ml-auto mr-1 xs:mr-6 sm:mr-10 z-20 scale-[0.98]";
      case "Asr":
        return "ml-auto mr-3 xs:mr-8 sm:mr-12 z-20 scale-[0.98]";
      case "Maghrib":
        return "ml-auto mr-1 xs:mr-6 sm:mr-10 z-20 scale-[0.98]";
      case "Isha":
        return "mr-auto ml-1 xs:ml-4 sm:ml-8 z-20 scale-[0.98]";
      default:
        return "mx-auto z-20";
    }
  };

  // Dynamic Arc Bezier Highlight Path based on active index
  const activeArcPath = useMemo(() => {
    switch (activeKey) {
      case "Fajr":
        return "M 220 25 C 280 40, 310 70, 260 100";
      case "Dhuhr":
        return "M 220 25 C 365 90, 320 160, 200 130";
      case "Asr":
        return "M 160 90 C 65 130, 65 210, 160 245";
      case "Maghrib":
        return "M 200 180 C 330 220, 350 280, 220 315";
      case "Isha":
        return "M 220 240 C 340 280, 300 330, 220 335";
      default:
        return "M 160 90 C 65 130, 65 210, 160 245";
    }
  }, [activeKey]);

  return (
    <div
      data-widget-card
      className="bg-slate-50/90 dark:bg-slate-950/90 border border-slate-200/90 dark:border-slate-800/90 shadow-xs rounded-[38px] p-4 sm:p-6 relative overflow-hidden transition-all duration-700 ease-in-out"
    >
      {/* Main Organic Arc Stage Container - No Header, starts directly with prayers */}
      <div className="relative py-2 min-h-[380px] sm:min-h-[400px] flex flex-col justify-between">
        {/* SVG Arc Connectors Layer - Continuous smooth bezier paths passing behind speech bubbles */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0"
          viewBox="0 0 400 360"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="activeGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={activeWidgetTheme.from} stopOpacity="0.85" />
              <stop offset="100%" stopColor={activeWidgetTheme.to} stopOpacity="1" />
            </linearGradient>
            <filter id="emeraldGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Arc Connectors */}
          {/* Right Convex Arc: Curves out to the right connecting Fajr to Isha */}
          <path
            d="M 220 25 C 365 90, 365 250, 220 335"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.8"
            strokeOpacity="0.45"
            className="dark:stroke-slate-700 transition-all duration-700 ease-in-out"
          />

          {/* Left Convex Arc: Curves in to the left connecting Dhuhr and Maghrib behind Asr */}
          <path
            d="M 160 90 C 65 130, 65 210, 160 245"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.8"
            strokeOpacity="0.45"
            className="dark:stroke-slate-700 transition-all duration-700 ease-in-out"
          />

          {/* Dynamic Active Arc Glow Highlight */}
          <path
            d={activeArcPath}
            fill="none"
            stroke="url(#activeGlowGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            filter="url(#emeraldGlow)"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>

        {/* 5 Vertical Staggered Speech Bubble Cards */}
        <div className="flex flex-col space-y-4 sm:space-y-5 relative z-10 my-auto">
          {PRAYER_KEYS.map((key, index) => {
            const isActive = key === activeKey;
            const isPassed = index < activeIndex;
            const Icon = PRAYER_ICONS[key];
            const timeStr = data
              ? formatPrayerTime(data.timings[key], {
                  lang: locale,
                  format: settings.timeFormat,
                })
              : "--:--";
            const arabicName = ARABIC_NAMES[key];
            const frenchName = t[key.toLowerCase() as "fajr"];
            const alignmentClass = getCardAlignment(key, isActive);

            return (
              <div
                key={key}
                className={`relative w-full max-w-[260px] xs:max-w-[285px] sm:max-w-[310px] transition-all duration-700 ease-in-out ${alignmentClass}`}
              >
                {/* Fixed Rear White Depth Layer for Active Card */}
                {isActive && (
                  <div className="absolute -inset-1 bg-white dark:bg-slate-800 rounded-3xl shadow-xl translate-y-1 scale-[1.03] z-0 transition-all duration-700 pointer-events-none border border-slate-200/90 dark:border-slate-700/80" />
                )}

                {/* Speech Bubble Prayer Card Container */}
                <div
                  style={
                    isActive && !activeWidgetTheme.animClass
                      ? {
                          background: activeWidgetTheme.gradient || activeWidgetTheme.from,
                          color: activeWidgetTheme.fg,
                          boxShadow: `0 14px 32px -6px ${activeWidgetTheme.from}60, 0 0 25px ${activeWidgetTheme.from}40`,
                        }
                      : isActive
                        ? {
                            color: activeWidgetTheme.fg,
                            boxShadow: `0 14px 32px -6px ${activeWidgetTheme.from}60, 0 0 25px ${activeWidgetTheme.from}40`,
                          }
                        : undefined
                  }
                  className={`w-full flex items-center justify-between transition-all duration-700 ease-in-out rounded-2xl sm:rounded-3xl cursor-default relative min-h-[62px] ${
                    isActive
                      ? `py-[11px] pb-[14px] px-4 pr-[15px] sm:px-5 z-20 border border-white/50 ring-2 ring-white/30 text-white ml-[1px] ${
                          activeWidgetTheme.animClass || ""
                        }`
                      : "py-[10px] px-[14px] pr-[15px] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 shadow-2xs z-10 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {/* Speech Bubble Pointer Notch Tail */}
                  {/* Active card has tail on RIGHT pointing outward; Inactive card has tail on LEFT pointing outward */}
                  {isActive ? (
                    <div
                      style={
                        !activeWidgetTheme.animClass
                          ? {
                              background: activeWidgetTheme.to || activeWidgetTheme.from,
                            }
                          : undefined
                      }
                      className={`absolute -right-2 top-1/2 -translate-y-1/2 size-4 rotate-45 z-30 transition-all duration-700 pointer-events-none rounded-xs border-r border-t border-white/40 shadow-xs ${
                        activeWidgetTheme.animClass || ""
                      }`}
                    />
                  ) : (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 size-3.5 rotate-45 z-10 transition-all duration-700 pointer-events-none bg-white dark:bg-slate-900 border-l border-b border-slate-200/90 dark:border-slate-800" />
                  )}

                  {/* Left Section: Icon & Names */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div
                      className={`flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-700 shrink-0 ${
                        isActive
                          ? "size-9 sm:size-11 bg-white/20 text-white shadow-inner backdrop-blur-md"
                          : isPassed
                            ? "size-8 sm:size-9 bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500"
                            : "size-8 sm:size-9 bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <Icon className={isActive ? "size-5 sm:size-6" : "size-4 sm:size-4.5"} />
                    </div>

                    <div className="flex flex-col leading-tight min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-black tracking-tight transition-all duration-700 truncate ${
                            isActive
                              ? "text-sm sm:text-base text-white"
                              : isPassed
                                ? "text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-through/40"
                                : "text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {frenchName}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-white text-emerald-950 px-2 py-0.5 rounded-full shadow-2xs shrink-0 whitespace-nowrap">
                            {t.statusNext}
                          </span>
                        )}
                        {isPassed && (
                          <span className="text-[8px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.2 rounded-full border border-slate-200/60 dark:border-slate-700/60 shrink-0 whitespace-nowrap">
                            {t.statusCompleted}
                          </span>
                        )}
                      </div>

                      <span
                        className={`font-[var(--font-arabic)] font-bold transition-all duration-700 truncate ${
                          isActive
                            ? "text-xs sm:text-sm text-white/90 mt-0.5"
                            : "text-[11px] text-slate-400 dark:text-slate-500 mt-0.5"
                        }`}
                      >
                        {arabicName}
                      </span>
                    </div>
                  </div>

                  {/* Right Section: Time */}
                  <div
                    className={`font-mono font-extrabold tabular-nums shrink-0 transition-all duration-700 ${
                      isActive
                        ? "text-sm sm:text-base bg-black/20 text-white px-2.5 py-1 rounded-xl border border-white/20"
                        : isPassed
                          ? "text-xs sm:text-sm text-slate-400 dark:text-slate-500 px-2 py-0.5"
                          : "text-xs sm:text-sm text-slate-800 dark:text-slate-200 px-2 py-0.5"
                    }`}
                  >
                    {timeStr}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
