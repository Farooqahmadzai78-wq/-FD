import { Capacitor, registerPlugin } from "@capacitor/core";
import { AppSettings } from "@/lib/app-settings";
import { IMAMS } from "@/lib/nur-data";
import { PRAYER_KEYS, PrayerTimings, toDateToday } from "@/lib/prayer-times";
import { resolveEffectiveReminder, ttsUrl } from "@/lib/reminder-data";

export interface NativePlatformStatus {
  isNativeAndroid: boolean;
  alarmManagerAvailable: boolean;
  sdkVersion: number;
  canScheduleExactAlarms: boolean;
  isIgnoringBatteryOptimizations: boolean;
}

export interface ScheduledAlarmInfo {
  eventId: string;
  type: "REMINDER_BEFORE_PRAYER" | "PRAYER_AZAN" | "reminder" | "adhan";
  prayerName: string;
  timestampMs: number;
  mode: string;
  title: string;
  notifText: string;
  message?: string;
  audioText: string;
  audioUrl: string;
  isArabic: boolean;
  vibrate: boolean;
}

export interface PrayerSchedulerPluginInterface {
  getNativePlatformStatus(): Promise<NativePlatformStatus>;
  requestNativePermissions(): Promise<{ canScheduleExactAlarms: boolean }>;
  requestBatteryOptimizationExemption(): Promise<{ requested: boolean }>;
  scheduleReminder(options: {
    eventId: string;
    prayerName: string;
    timestamp: number;
    mode: "notification" | "audio" | "both";
    title: string;
    notifText: string;
    message?: string;
    audioText: string;
    audioUrl?: string;
    isArabic?: boolean;
    vibrate?: boolean;
  }): Promise<{ success: boolean; eventId: string }>;
  scheduleAdhan(options: {
    eventId: string;
    prayerName: string;
    timestamp: number;
    imamId: string;
    title: string;
    message: string;
    audioUrl: string;
    vibrate?: boolean;
  }): Promise<{ success: boolean; eventId: string }>;
  scheduleTestAlarm(options: {
    delaySeconds: number;
    type: "reminder" | "adhan" | "REMINDER_BEFORE_PRAYER" | "PRAYER_AZAN";
    prayerName: string;
    mode: "notification" | "audio" | "both";
    title: string;
    notifText?: string;
    message?: string;
    audioText?: string;
    audioUrl?: string;
    isArabic?: boolean;
    vibrate?: boolean;
  }): Promise<{ success: boolean; eventId: string; timestampMs: number; delaySeconds: number }>;
  getPendingAlarms(): Promise<{ alarmsJson: string }>;
  cancelAll(): Promise<{ cancelled: boolean }>;
}

export const NativePrayerScheduler =
  registerPlugin<PrayerSchedulerPluginInterface>("PrayerScheduler");

export function isNativeAndroidPlatform(): boolean {
  return (
    typeof window !== "undefined" &&
    Capacitor.isNativePlatform() &&
    Capacitor.getPlatform() === "android"
  );
}

/**
 * Checks platform status (Exact alarms, battery optimization, Android SDK).
 */
export async function getNativeStatus(): Promise<NativePlatformStatus> {
  if (!isNativeAndroidPlatform()) {
    return {
      isNativeAndroid: false,
      alarmManagerAvailable: false,
      sdkVersion: 0,
      canScheduleExactAlarms: true,
      isIgnoringBatteryOptimizations: true,
    };
  }
  try {
    return await NativePrayerScheduler.getNativePlatformStatus();
  } catch {
    return {
      isNativeAndroid: true,
      alarmManagerAvailable: true,
      sdkVersion: 33,
      canScheduleExactAlarms: true,
      isIgnoringBatteryOptimizations: true,
    };
  }
}

/**
 * Requests exact alarm permissions on Android 12+ (SDK 31+)
 */
export async function requestNativeExactAlarmPermissions(): Promise<boolean> {
  if (!isNativeAndroidPlatform()) return true;
  try {
    const res = await NativePrayerScheduler.requestNativePermissions();
    return res.canScheduleExactAlarms;
  } catch {
    return true;
  }
}

/**
 * Prompts the user to exempt Islam-Noor from battery optimization for 100% reliable background execution.
 */
export async function requestNativeBatteryExemption(): Promise<boolean> {
  if (!isNativeAndroidPlatform()) return true;
  try {
    const res = await NativePrayerScheduler.requestBatteryOptimizationExemption();
    return res.requested;
  } catch {
    return false;
  }
}

/**
 * Synchronizes prayer timings and pre-adhan settings with native Android AlarmManager.
 * When on Web/PWA, returns status indicating fallback to Service Worker / in-app scheduler.
 */
export async function syncNativePrayerAlarms(
  timings: PrayerTimings,
  settings: AppSettings,
  t: (key: string) => string,
): Promise<{ nativeScheduledCount: number; isNative: boolean }> {
  const isNative = isNativeAndroidPlatform();

  if (!settings.notifications) {
    if (isNative) {
      try {
        await NativePrayerScheduler.cancelAll();
      } catch {
        // ignore
      }
    }
    return { nativeScheduledCount: 0, isNative };
  }

  if (!isNative) {
    return { nativeScheduledCount: 0, isNative: false };
  }

  let scheduledCount = 0;

  try {
    // 1. Clear old scheduled alarms before rescheduling
    await NativePrayerScheduler.cancelAll();

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const imam = IMAMS.find((i) => i.id === settings.imamId) ?? IMAMS[0];
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    for (const key of PRAYER_KEYS) {
      const adhanTime = toDateToday(timings[key], now);
      if (isNaN(adhanTime.getTime())) continue;

      const adhanTimeMs = adhanTime.getTime();

      // A. Pre-Adhan Reminder Exact Alarm
      if (settings.reminder > 0) {
        const reminderTimeMs = adhanTimeMs - settings.reminder * 60_000;

        if (reminderTimeMs > now.getTime()) {
          const remEventId = `rem_${key}_${dateStr}_${settings.reminder}_${settings.reminderMode}`;
          const resolved = resolveEffectiveReminder(settings, key, t);

          const relTtsUrl = ttsUrl(resolved.audioText, resolved.isArabicAudio);
          const fullAudioUrl = relTtsUrl.startsWith("http") ? relTtsUrl : `${origin}${relTtsUrl}`;

          await NativePrayerScheduler.scheduleReminder({
            eventId: remEventId,
            prayerName: key,
            timestamp: reminderTimeMs,
            mode: resolved.mode,
            title: "Islam-Noor — Rappel de prière",
            notifText: resolved.notifText,
            message: resolved.notifText,
            audioText: resolved.audioText,
            audioUrl: fullAudioUrl,
            isArabic: resolved.isArabicAudio,
            vibrate: settings.vibrateNotifications,
          });
          scheduledCount++;
        }
      }

      // B. Exact Adhan Alarm
      if (adhanTimeMs > now.getTime()) {
        const adhanEventId = `adhan_${key}_${dateStr}_${settings.imamId}`;

        await NativePrayerScheduler.scheduleAdhan({
          eventId: adhanEventId,
          prayerName: key,
          timestamp: adhanTimeMs,
          imamId: settings.imamId,
          title: `Islam-Noor — Adhan ${key}`,
          message: `Il est l'heure de la prière de ${key} (${imam.name})`,
          audioUrl: imam.audio,
          vibrate: settings.vibrateAdhan,
        });
        scheduledCount++;
      }
    }
  } catch (err) {
    console.warn("[NativePrayerBridge] Failed to sync native alarms:", err);
  }

  return { nativeScheduledCount: scheduledCount, isNative: true };
}

/**
 * Schedules a native test alarm after a given delay (in seconds) to test closed-app and locked-screen triggers.
 */
export async function scheduleNativeTestDelay(options: {
  delaySeconds: number;
  type: "reminder" | "adhan" | "REMINDER_BEFORE_PRAYER" | "PRAYER_AZAN";
  prayerName: string;
  mode: "notification" | "audio" | "both";
  title: string;
  notifText?: string;
  message?: string;
  audioText?: string;
  audioUrl?: string;
  isArabic?: boolean;
  vibrate?: boolean;
}): Promise<{ success: boolean; eventId: string; timestampMs: number }> {
  if (isNativeAndroidPlatform()) {
    try {
      const res = await NativePrayerScheduler.scheduleTestAlarm(options);
      return { success: res.success, eventId: res.eventId, timestampMs: res.timestampMs };
    } catch (err) {
      console.warn("[NativePrayerBridge] Native test alarm error:", err);
    }
  }

  // Fallback for Web/PWA
  const targetMs = Date.now() + options.delaySeconds * 1000;
  return {
    success: true,
    eventId: `web_test_${Date.now()}`,
    timestampMs: targetMs,
  };
}

/**
 * Fetches and parses the list of pending Android AlarmManager alarms.
 */
export async function getParsedScheduledAlarms(): Promise<ScheduledAlarmInfo[]> {
  if (!isNativeAndroidPlatform()) return [];
  try {
    const res = await NativePrayerScheduler.getPendingAlarms();
    if (!res?.alarmsJson) return [];
    const list = JSON.parse(res.alarmsJson);
    if (!Array.isArray(list)) return [];
    return list.sort((a, b) => (a.timestampMs || 0) - (b.timestampMs || 0));
  } catch (err) {
    console.warn("[NativePrayerBridge] Error fetching pending alarms:", err);
    return [];
  }
}
