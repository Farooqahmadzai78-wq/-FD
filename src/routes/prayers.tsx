import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Loader2, Pause, Play, Square, Volume2 } from "lucide-react";
import { appToast } from "@/lib/app-toast";
import notifBg from "@/assets/images/reminder_notif_new_1786270350765.jpg";
import audioBg from "@/assets/images/reminder_audio_new_1786270363968.jpg";
import comboBg from "@/assets/images/reminder_combo_new_1786270378486.jpg";
import { PrayerRow } from "@/components/PrayerRow";
import { QiblaCompass } from "@/components/QiblaCompass";
import { PrayersQiblaARHint } from "@/components/AppFeatureHints";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/app-settings";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { IMAMS, getImamCountry } from "@/lib/nur-data";
import {
  PRAYER_KEYS,
  cleanTime,
  countdown,
  formatLocalizedPlace,
  formatZonedTime,
  getLocalizedGregorianDate,
  toDateToday,
} from "@/lib/prayer-times";
import { AUDIO_REMINDERS, NOTIF_TEMPLATES, resolveEffectiveReminder } from "@/lib/reminder-data";
import {
  speakReminderText,
  stopReminderSpeech,
  subscribeSpeakerState,
  type SpeakerState,
} from "@/lib/reminder-speaker";
import {
  playAzan,
  stopAzan,
  pauseAzan,
  resumeAzan,
  subscribeAzanStatus,
  type AzanPlaybackStatus,
} from "@/lib/azan-audio-engine";
import { sendSystemNotification } from "@/lib/sw-register";

export const Route = createFileRoute("/prayers")({
  head: () => ({
    meta: [
      { title: "Horaires de prière & Qibla — Islam-Noor" },
      {
        name: "description",
        content:
          "Horaires de prière calculés pour votre position, boussole Qibla en temps réel, choix du muezzin et rappels avant l'azan.",
      },
      { property: "og:title", content: "Horaires de prière & Qibla — Islam-Noor" },
      {
        property: "og:description",
        content: "Horaires réels, Qibla et azan personnalisé.",
      },
    ],
  }),
  component: PrayersPage,
});

function PrayersPage() {
  const { t, locale } = useI18n();
  const { settings, update } = useSettings();
  const {
    place,
    data,
    next,
    now,
    timezone,
    clock,
    loading,
    mosque,
    isMosqueOfficial,
    source,
    iqama,
    iqamaDisplay,
    jumua,
    jumua2,
  } = usePrayerTimes();
  const cd = next ? countdown(next.at, now) : null;

  const formattedPlace = mosque
    ? `${mosque.name} (${formattedPlaceBase(place, t)})`
    : place
      ? formatLocalizedPlace(place, t)
      : "…";

  function formattedPlaceBase(p: typeof place, tr: typeof t) {
    return p ? formatLocalizedPlace(p, tr) : "";
  }

  // Position of "now" along the day, for the timeline.
  const progress = (() => {
    if (!data) return 0;
    const start = toDateToday(data.timings.Fajr, now).getTime();
    const end = toDateToday(data.timings.Isha, now).getTime();
    return Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)));
  })();

  return (
    <div className="space-y-5 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <header data-widget-card className="widget p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs opacity-85 truncate" suppressHydrationWarning>
            {formattedPlace}
          </p>
          {isMosqueOfficial && (
            <span className="shrink-0 text-[10px] font-extrabold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur">
              Mosquée Officielle
            </span>
          )}
        </div>
        <h1 className="text-2xl font-extrabold">{t.prayersTitle}</h1>
        {data && (
          <p className="mt-1 text-[11px] opacity-85" suppressHydrationWarning>
            {data.hijri} · {getLocalizedGregorianDate(data, locale)}
          </p>
        )}
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] opacity-80">{t.currentTime}</p>
            {/* Always rendered in the timezone of the selected city. */}
            <p className="font-mono text-xl font-bold tabular-nums" suppressHydrationWarning>
              {formatZonedTime(timezone, clock)}
            </p>
            {timezone && <p className="text-[10px] opacity-70">{timezone}</p>}
          </div>
          <div className="text-right">
            <p className="text-[11px] opacity-80">{t.nextPrayer}</p>
            <p className="text-lg font-bold">
              {next ? t[next.key.toLowerCase() as "fajr"] : "—"}{" "}
              <span className="font-mono tabular-nums" suppressHydrationWarning>
                {cd?.label}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 rounded-full bg-black/15">
          <div
            className="h-2 rounded-full bg-white/85 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[9px] opacity-80">
          {PRAYER_KEYS.map((k) => (
            <span key={k}>{t[k.toLowerCase() as "fajr"]}</span>
          ))}
        </div>
      </header>

      {/* Mosque Sync / Source Information Banner */}
      <div
        data-widget-card
        className="rounded-2xl px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 text-xs"
      >
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">Source des horaires :</p>
          <p className="font-bold truncate text-foreground">
            {source || (mosque ? mosque.name : "Calcul astronomique")}
          </p>
          {jumua && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Prière du vendredi (Jumua) : <span className="font-mono font-semibold">{jumua}</span>
              {jumua2 && <span className="font-mono"> / {jumua2}</span>}
            </p>
          )}
        </div>
        <Link
          to="/mosques"
          className="shrink-0 text-xs font-bold text-[var(--w-from)] hover:underline px-2 py-1"
        >
          {mosque ? "Changer" : "Choisir mosquée"}
        </Link>
      </div>

      <section data-widget-card className="glass divide-y divide-border p-2">
        {loading && !data ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          PRAYER_KEYS.map((k) => (
            <PrayerRow
              key={k}
              prayerKey={k}
              time={data ? cleanTime(data.timings[k]) : "--:--"}
              iqama={iqama ? iqama[k] : undefined}
              iqamaDisplay={iqamaDisplay ? iqamaDisplay[k] : undefined}
              active={next?.key === k}
            />
          ))
        )}
      </section>

      {/* Feature Guide Hint: Boussole & Réalité Augmentée */}
      <PrayersQiblaARHint
        onScrollToCompass={() => {
          const el = document.getElementById("qibla");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <QiblaCompass />

      {/* Imam selector */}
      <section data-widget-card className="glass p-4">
        <h2 className="text-sm font-bold">{t.imamTitle}</h2>
        <p className="text-[11px] text-muted-foreground">{t.imamSub}</p>
        <ImamPicker />
      </section>

      {/* Reminder */}
      <section data-widget-card className="glass p-4">
        <h2 className="text-sm font-bold">{t.reminderTitle}</h2>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {([0, 5, 15, 30] as const).map((v) => (
            <Button
              key={v}
              variant={settings.reminder === v ? "widget" : "soft"}
              className="h-11 text-xs"
              onClick={() => update({ reminder: v })}
            >
              {v === 0 ? t.reminderNone : v === 5 ? t.r5 : v === 15 ? t.r15 : t.r30}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">{t.autoAzan}</p>

        {/* Reminder mode */}
        <h3 className="mt-6 text-sm font-bold flex items-center gap-1.5 text-foreground">
          <span className="text-base">🔔</span> {t.reminderModeTitle || "Mode du rappel"}
        </h3>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3.5">
          {/* Card 1: Notification */}
          <Link
            to="/reminder/notification"
            onClick={() => update({ reminderMode: "notification" })}
            className={`group relative flex flex-col items-center text-center transition-all duration-200 ${
              settings.reminderMode === "notification"
                ? "scale-[1.02] opacity-100"
                : "opacity-85 hover:opacity-100 hover:scale-[1.01]"
            }`}
          >
            {/* Image Box */}
            <div
              className={`relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-sm transition-all duration-200 ${
                settings.reminderMode === "notification"
                  ? "ring-2 ring-amber-500 shadow-md"
                  : "border border-slate-200/60 dark:border-white/10"
              }`}
            >
              <img
                src={notifBg}
                alt="Notification"
                referrerPolicy="no-referrer"
                className="size-full object-cover object-center pointer-events-none"
              />
              {/* Top Icon Badge */}
              <div className="absolute top-2 left-2 size-6 sm:size-7 rounded-full bg-white/35 dark:bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-xs">
                <Bell className="size-3 sm:size-3.5 text-white fill-white/30" />
              </div>
            </div>

            {/* Mode Name BELOW Image */}
            <span className="mt-2 font-serif italic text-xs sm:text-base font-bold text-amber-900 dark:text-amber-300 text-center tracking-tight leading-tight group-hover:text-amber-600 transition-colors">
              {t.reminderModeNotifTitle || "Notification"}
            </span>
          </Link>

          {/* Card 2: Audio */}
          <Link
            to="/reminder/audio"
            onClick={() => update({ reminderMode: "audio" })}
            className={`group relative flex flex-col items-center text-center transition-all duration-200 ${
              settings.reminderMode === "audio"
                ? "scale-[1.02] opacity-100"
                : "opacity-85 hover:opacity-100 hover:scale-[1.01]"
            }`}
          >
            {/* Image Box */}
            <div
              className={`relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-sm transition-all duration-200 ${
                settings.reminderMode === "audio"
                  ? "ring-2 ring-amber-500 shadow-md"
                  : "border border-slate-200/60 dark:border-white/10"
              }`}
            >
              <img
                src={audioBg}
                alt="Audio"
                referrerPolicy="no-referrer"
                className="size-full object-cover object-center pointer-events-none"
              />
              {/* Top Icon Badge */}
              <div className="absolute top-2 left-2 size-6 sm:size-7 rounded-full bg-white/35 dark:bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-xs">
                <Volume2 className="size-3 sm:size-3.5 text-white" />
              </div>
            </div>

            {/* Mode Name BELOW Image */}
            <span className="mt-2 font-serif italic text-xs sm:text-base font-bold text-amber-900 dark:text-amber-300 text-center tracking-tight leading-tight group-hover:text-amber-600 transition-colors">
              {t.reminderModeAudioTitle || "Audio"}
            </span>
          </Link>

          {/* Card 3: Notification + Audio */}
          <Link
            to="/reminder/combo"
            onClick={() => update({ reminderMode: "both" })}
            className={`group relative flex flex-col items-center text-center transition-all duration-200 ${
              settings.reminderMode === "both"
                ? "scale-[1.02] opacity-100"
                : "opacity-85 hover:opacity-100 hover:scale-[1.01]"
            }`}
          >
            {/* Image Box */}
            <div
              className={`relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-sm transition-all duration-200 ${
                settings.reminderMode === "both"
                  ? "ring-2 ring-amber-500 shadow-md"
                  : "border border-slate-200/60 dark:border-white/10"
              }`}
            >
              <img
                src={comboBg}
                alt="Notification + Audio"
                referrerPolicy="no-referrer"
                className="size-full object-cover object-center pointer-events-none"
              />
              {/* Top Icon Badge */}
              <div className="absolute top-2 left-2 px-1.5 h-6 sm:h-7 rounded-full bg-white/35 dark:bg-black/40 backdrop-blur-md flex items-center gap-1 text-white border border-white/40 shadow-xs">
                <Bell className="size-2.5 sm:size-3 text-white fill-white/30" />
                <Volume2 className="size-2.5 sm:size-3 text-white" />
              </div>
            </div>

            {/* Mode Name BELOW Image */}
            <span className="mt-2 font-serif italic text-xs sm:text-base font-bold text-amber-900 dark:text-amber-300 text-center tracking-tight leading-tight group-hover:text-amber-600 transition-colors">
              {t.reminderModeBothTitle || "Notification + Audio"}
            </span>
          </Link>
        </div>

        {/* Vocal Test Widget */}
        <ReminderTestWidget />
      </section>
    </div>
  );
}

function ReminderTestWidget() {
  const { t } = useI18n();
  const { settings } = useSettings();
  const [speakerState, setSpeakerState] = useState<SpeakerState>({
    activeId: null,
    isPlaying: false,
    isLoading: false,
  });

  useEffect(() => {
    return subscribeSpeakerState(setSpeakerState);
  }, []);

  const resolved = resolveEffectiveReminder(settings, "Fajr", t);

  const isAudioMode = resolved.mode === "audio";
  const isBothMode = resolved.mode === "both";
  const isNotifMode = resolved.mode === "notification";

  const handleTest = () => {
    if (speakerState.isPlaying) {
      stopReminderSpeech();
      appToast.info(t.reminderStopped || "Reminder stopped.", { category: "reminder" });
      return;
    }

    // MODE 1: Notification ONLY
    if (isNotifMode) {
      void sendSystemNotification("Islam-Noor — Rappel de prière", {
        body: resolved.notifText,
        tag: `test-rem-notif-${Date.now()}`,
      });
      appToast.info(resolved.notifText, {
        category: "reminder",
        duration: 5000,
        icon: <Bell className="size-4 text-emerald-500" />,
      });
      return;
    }

    // MODE 2: Audio ONLY
    if (isAudioMode) {
      appToast.success(t.playingAudioReminder || "Playing audio reminder...", {
        category: "reminder",
      });
      speakReminderText("test-prayers-audio", resolved.audioText, resolved.isArabicAudio);
      return;
    }

    // MODE 3: Both (Notification + Audio)
    if (isBothMode) {
      void sendSystemNotification("Islam-Noor — Rappel de prière", {
        body: resolved.notifText,
        tag: `test-rem-both-${Date.now()}`,
      });
      appToast.info(resolved.notifText, {
        category: "reminder",
        duration: 5000,
        icon: <Bell className="size-4 text-emerald-500" />,
      });
      speakReminderText("test-prayers-combo", resolved.audioText, resolved.isArabicAudio);
    }
  };

  const widgetTitle = isAudioMode
    ? t.reminderModeAudioTitle || "Audio"
    : isBothMode
      ? t.reminderModeBothTitle || "Notification + Audio"
      : t.reminderModeNotifTitle || "Notification";

  const widgetButtonLabel = isNotifMode
    ? "Tester la notification"
    : isAudioMode
      ? t.testVocalBtn || "Tester le vocal"
      : t.testCombo || "Tester la combinaison";

  const summaryText = isAudioMode
    ? resolved.audioLabel
    : isBothMode
      ? `${resolved.notifIcon} ${resolved.notifText} + ${resolved.audioLabel}`
      : `${resolved.notifIcon} ${resolved.notifText}`;

  return (
    <div className="mt-4 widget p-3.5 rounded-2xl flex items-center justify-between gap-3 border border-amber-500/20 shadow-xs">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          {isNotifMode ? (
            <Bell className="size-3.5 text-amber-500 shrink-0" />
          ) : (
            <Volume2 className="size-3.5 text-amber-500 animate-pulse shrink-0" />
          )}
          <span>Test ({widgetTitle})</span>
        </div>
        <p
          className="text-[11px] text-muted-foreground truncate mt-0.5"
          dir={isAudioMode && resolved.isArabicAudio ? "rtl" : "ltr"}
        >
          {summaryText}
        </p>
      </div>

      <Button
        size="sm"
        onClick={handleTest}
        className="shrink-0 h-8 px-3 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-xs flex items-center gap-1.5"
      >
        {speakerState.isLoading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : speakerState.isPlaying ? (
          <>
            <Pause className="size-3.5 fill-current" />
            <span>{t.stopVocalBtn || "Arrêter"}</span>
          </>
        ) : isNotifMode ? (
          <>
            <Bell className="size-3.5 fill-current" />
            <span>{widgetButtonLabel}</span>
          </>
        ) : (
          <>
            <Play className="size-3.5 fill-current ml-0.5" />
            <span>{widgetButtonLabel}</span>
          </>
        )}
      </Button>
    </div>
  );
}

function formatAudioTime(secs: number): string {
  if (!secs || Number.isNaN(secs) || !Number.isFinite(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function ImamPicker() {
  const { t } = useI18n();
  const { settings, update } = useSettings();
  const [status, setStatus] = useState<AzanPlaybackStatus>({
    isPlaying: false,
    imamId: null,
    imamName: null,
    prayerName: null,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
  });

  // Subscribe to centralized Adhan audio engine
  useEffect(() => {
    const unsubscribe = subscribeAzanStatus((newStatus) => {
      setStatus(newStatus);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopAzan();
    };
  }, []);

  const handlePlayPause = async (imam: (typeof IMAMS)[number]) => {
    update({ imamId: imam.id });

    // 1. If this reciter is already the active playback target
    if (status.imamId === imam.id) {
      if (status.isPlaying) {
        pauseAzan();
      } else {
        await resumeAzan();
      }
      return;
    }

    // 2. Switching to a new reciter: playAzan immediately stops previous stream & starts new one
    try {
      await playAzan(imam, {
        prayerName: "Aperçu",
        onError: (err) => {
          appToast.error(err.message || t.audioStreamFailed || "Failed to load audio stream", {
            category: "reciter",
          });
        },
      });
    } catch {
      appToast.error(t.cannotPlayAzan || "Cannot play Azan for this reciter.", {
        category: "reciter",
      });
    }
  };

  const handleStop = () => {
    stopAzan();
  };

  return (
    <div className="no-scrollbar -mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-1">
      {IMAMS.map((imam) => {
        const isSelectedSetting = settings.imamId === imam.id;
        const isActiveReciter = status.imamId === imam.id;
        const isThisLoading = isActiveReciter && status.isLoading;
        const isThisPlaying = isActiveReciter && status.isPlaying;

        return (
          <div
            key={imam.id}
            className={`relative flex w-36 shrink-0 flex-col items-center justify-between rounded-3xl p-3 text-center transition ${
              isSelectedSetting ? "widget" : "widget-soft"
            }`}
          >
            <button
              onClick={() => handlePlayPause(imam)}
              className="flex w-full flex-col items-center"
              aria-label={`Écouter ${imam.name}`}
            >
              <span className="text-3xl">{imam.flag}</span>
              <p className="mt-1 w-full truncate text-[11px] font-bold">{imam.name}</p>
              <p className="w-full truncate text-[10px] opacity-80">{getImamCountry(t, imam)}</p>
            </button>

            <div className="mt-2.5 flex items-center justify-center gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 rounded-full bg-black/10 p-0 text-current hover:bg-black/20 dark:bg-white/20 dark:hover:bg-white/30"
                onClick={() => handlePlayPause(imam)}
                disabled={isThisLoading}
              >
                {isThisLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : isThisPlaying ? (
                  <Pause className="size-3.5 fill-current" />
                ) : (
                  <Play className="ml-0.5 size-3.5 fill-current" />
                )}
              </Button>

              {isActiveReciter && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 rounded-full bg-black/10 p-0 text-current hover:bg-black/20 dark:bg-white/20 dark:hover:bg-white/30"
                  onClick={handleStop}
                  title="Arrêter"
                >
                  <Square className="size-3 fill-current" />
                </Button>
              )}
            </div>

            {/* Audio progress bar */}
            {isActiveReciter && (
              <div className="mt-2 w-full space-y-1">
                <div className="h-1 w-full overflow-hidden rounded-full bg-black/20 dark:bg-white/20">
                  <div
                    className="h-full bg-current transition-all duration-200"
                    style={{
                      width: `${status.duration > 0 ? Math.min(100, (status.currentTime / status.duration) * 100) : 0}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[9px] opacity-80">
                  <span>{formatAudioTime(status.currentTime)}</span>
                  <span>{formatAudioTime(status.duration)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
