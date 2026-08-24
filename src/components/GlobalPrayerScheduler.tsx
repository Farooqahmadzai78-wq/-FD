import { useEffect } from "react";
import { appToast } from "@/lib/app-toast";
import { Bell, Volume2 } from "lucide-react";
import { useSettings } from "@/lib/app-settings";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useI18n } from "@/lib/i18n";
import { PRAYER_KEYS, toDateToday } from "@/lib/prayer-times";
import { resolveEffectiveReminder } from "@/lib/reminder-data";
import { speakReminderText } from "@/lib/reminder-speaker";
import { registerServiceWorker, sendSystemNotification } from "@/lib/sw-register";
import { syncNativePrayerAlarms } from "@/lib/native-prayer-bridge";
import { vibrate } from "@/lib/vibration";
import { playAzan, stopAzan, resolveImam } from "@/lib/azan-audio-engine";

const FIRED_STORAGE_KEY = "nur_fired_events_v4";

function getFiredEvents(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FIRED_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function recordFiredEvent(eventKey: string) {
  if (typeof window === "undefined") return;
  try {
    const fired = getFiredEvents();
    fired.add(eventKey);
    // Keep max 100 recent entries to keep storage clean
    const list = Array.from(fired).slice(-100);
    localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function GlobalPrayerScheduler() {
  const { settings } = useSettings();
  const { data } = usePrayerTimes();
  const { t } = useI18n();

  // 1. Register Service Worker on mount
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  // 2. Synchronize Native Android AlarmManager (Exact Alarms)
  useEffect(() => {
    if (data?.timings) {
      void syncNativePrayerAlarms(data.timings, settings, t);
    }
  }, [data?.timings, settings, t]);

  // 2. Prayer Scheduler Loop
  useEffect(() => {
    if (!data || !settings.notifications) return;

    const checkEvents = () => {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0]; // e.g. "2026-08-09"
      const firedSet = getFiredEvents();

      const imam = resolveImam(settings.imamId);

      for (const key of PRAYER_KEYS) {
        const adhanTime = toDateToday(data.timings[key], now);
        if (isNaN(adhanTime.getTime())) continue;

        const adhanTimeMs = adhanTime.getTime();
        const nowMs = now.getTime();

        // -------------------------------------------------------------
        // A. PRE-ADHAN REMINDER TRIGGERING
        // -------------------------------------------------------------
        if (settings.reminder > 0) {
          const reminderTimeMs = adhanTimeMs - settings.reminder * 60_000;
          const remEventKey = `rem_${key}_${dateStr}_${settings.reminder}_${settings.reminderMode}_${settings.notifTemplate}_${settings.customNotifText || ""}_${settings.audioReminder}_${settings.customAudioText || ""}`;

          // Check window: now is at or after reminder time, but strictly before adhan time
          if (!firedSet.has(remEventKey) && nowMs >= reminderTimeMs && nowMs < adhanTimeMs) {
            recordFiredEvent(remEventKey);

            const resolved = resolveEffectiveReminder(settings, key, t);

            // 1. Vibration
            if (settings.vibrateNotifications) {
              vibrate("notification", { vibrateNotifications: true });
            }

            // 2. Notification (Mode: notification OR both)
            if (resolved.mode === "notification" || resolved.mode === "both") {
              void sendSystemNotification("Islam-Noor — Rappel de prière", {
                body: resolved.notifText,
                tag: `rem-${key}`,
              });
              appToast.info(resolved.notifText, {
                category: "reminder",
                duration: 6000,
                icon: <Bell className="size-4 text-emerald-500" />,
              });
            }

            // 3. Vocal Audio Reminder (Mode: audio OR both)
            if (resolved.mode === "audio" || resolved.mode === "both") {
              void speakReminderText(
                `auto-reminder-${key}`,
                resolved.audioText,
                resolved.isArabicAudio,
              );
            }
          }
        }

        // -------------------------------------------------------------
        // B. AUTOMATIC ADHAN TRIGGERING (Exact prayer time)
        // -------------------------------------------------------------
        const adhanEventKey = `adhan_${key}_${dateStr}_${settings.imamId}`;
        const fiveMinAfterAdhan = adhanTimeMs + 300_000;

        // Check window: now is at or after adhan time, but within 5 minutes
        if (!firedSet.has(adhanEventKey) && nowMs >= adhanTimeMs && nowMs < fiveMinAfterAdhan) {
          recordFiredEvent(adhanEventKey);

          // 1. Vibration
          if (settings.vibrateAdhan) {
            vibrate("adhan", { vibrateAdhan: true });
          }

          const title = `Islam-Noor — Adhan ${key}`;
          const body = (t.azanPlayingToast || "Playing Azan: {name}").replace(
            "{name}",
            `${key} (${imam.name})`,
          );

          // 2. System Notification
          void sendSystemNotification(title, {
            body,
            tag: `adhan-${key}`,
          });

          appToast.success(body, {
            category: "reciter",
            duration: 7000,
            icon: <Volume2 className="size-4 text-amber-500" />,
          });

          // 3. Play exact Imam Adhan stream with single source of truth
          void playAzan(imam, { prayerName: key }).catch((err) => {
            console.warn("[GlobalPrayerScheduler] Adhan autoplay prevented or network error:", err);
          });
        }
      }
    };

    // Run check immediately on mount or settings change
    checkEvents();

    // High frequency interval (every 3 seconds)
    const intervalId = window.setInterval(checkEvents, 3000);

    // Event listeners to handle device unlock / tab focus / visibility change
    const handleFocusOrVisible = () => checkEvents();
    window.addEventListener("focus", handleFocusOrVisible);
    window.addEventListener("visibilitychange", handleFocusOrVisible);
    window.addEventListener("online", handleFocusOrVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocusOrVisible);
      window.removeEventListener("visibilitychange", handleFocusOrVisible);
      window.removeEventListener("online", handleFocusOrVisible);
    };
  }, [data, settings, t]);

  return null;
}
