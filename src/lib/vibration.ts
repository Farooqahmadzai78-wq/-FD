/**
Native Haptic / Vibration Helper respecting user settings.
*/

export type VibrationType = "button" | "notification" | "adhan";

export function vibrate(
  type: VibrationType = "button",
  settings?: { vibrateButtons?: boolean; vibrateNotifications?: boolean; vibrateAdhan?: boolean },
) {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;

  const btnOpt = settings?.vibrateButtons ?? true;
  const notifOpt = settings?.vibrateNotifications ?? true;
  const adhanOpt = settings?.vibrateAdhan ?? true;

  try {
    if (type === "button" && btnOpt) {
      navigator.vibrate(12);
    } else if (type === "notification" && notifOpt) {
      navigator.vibrate([100, 50, 100]);
    } else if (type === "adhan" && adhanOpt) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  } catch {
    /* ignore unsupported vibration error */
  }
}
