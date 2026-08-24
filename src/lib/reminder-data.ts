import type { Dict } from "@/lib/locales/en";

/** Fixed content for the "Rappel avant l'Adhan" reminder system (design + copy). */

export type NotifTemplate = { id: string; icon: string; text: string; arabic?: boolean };

/** `{prayer}` is replaced by the prayer name and `{min}` by the reminder delay. */
export const NOTIF_TEMPLATES: NotifTemplate[] = [
  {
    id: "fajr",
    icon: "🕌",
    text: "L'adhan de Fajr commence dans {min} minutes. Préparez-vous pour la prière.",
    arabic: false,
  },
  {
    id: "dhuhr",
    icon: "🕌",
    text: "L'adhan de Dhuhr commence dans {min} minutes. Préparez-vous pour la prière.",
    arabic: false,
  },
  {
    id: "asr",
    icon: "🕌",
    text: "L'adhan de Asr commence dans {min} minutes. Préparez-vous pour la prière.",
    arabic: false,
  },
  {
    id: "maghrib",
    icon: "🕌",
    text: "L'adhan de Maghrib commence dans {min} minutes. Préparez-vous pour la prière.",
    arabic: false,
  },
  {
    id: "isha",
    icon: "🕌",
    text: "L'adhan de Isha commence dans {min} minutes. Préparez-vous pour la prière.",
    arabic: false,
  },
  {
    id: "generic",
    icon: "🕌",
    text: "L'adhan de {prayer} commence dans {min} minutes. Préparez-vous pour la prière.",
    arabic: false,
  },
  {
    id: "dhikr",
    icon: "🤲",
    text: "Il est temps de faire du dhikr avant la prière.",
    arabic: false,
  },
  {
    id: "meet",
    icon: "📖",
    text: "Préparez-vous à rencontrer Allah dans quelques minutes.",
    arabic: false,
  },
  { id: "closer", icon: "🌙", text: "Que cette prière vous rapproche d'Allah.", arabic: false },
  {
    id: "call",
    icon: "❤️",
    text: "N'oubliez pas votre prière. Allah vous appelle.",
    arabic: false,
  },
  {
    id: "sleep",
    icon: "⭐",
    text: "La prière est meilleure que le sommeil (uniquement pour Fajr).",
    arabic: false,
  },
  {
    id: "ar_salat",
    icon: "🕋",
    text: "اقْتَرَبَتْ صَلَاةُ {prayer} - قُمْ وَتَوَضَّأْ لِلصَّلَاةِ",
    arabic: true,
  },
  {
    id: "ar_dhikr",
    icon: "🤲",
    text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    arabic: true,
  },
];

export type AudioReminder = {
  id: string;
  label: string;
  text: string;
  seconds: number;
  arabic: boolean;
};

/** Spoken with a real voice generated server-side or via web speech. */
export const AUDIO_REMINDERS: AudioReminder[] = [
  {
    id: "bismillah",
    label: "بِسْمِ اللَّه",
    text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيم",
    seconds: 5,
    arabic: true,
  },
  {
    id: "takbir",
    label: "اللهُ أَكْبَر",
    text: "اللهُ أَكْبَر، اللهُ أَكْبَر",
    seconds: 5,
    arabic: true,
  },
  {
    id: "tasbih",
    label: "سُبْحَانَ اللَّه",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِه",
    seconds: 8,
    arabic: true,
  },
  {
    id: "hamd",
    label: "الْحَمْدُ لِلَّه",
    text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِين",
    seconds: 8,
    arabic: true,
  },
  {
    id: "tahlil",
    label: "لَا إِلَٰهَ إِلَّا اللَّه",
    text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَه",
    seconds: 10,
    arabic: true,
  },
  {
    id: "istighfar",
    label: "أَسْتَغْفِرُ اللَّه",
    text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْه",
    seconds: 8,
    arabic: true,
  },
  {
    id: "hawla",
    label: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّه",
    text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيم",
    seconds: 12,
    arabic: true,
  },
  {
    id: "salat",
    label: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ نَبِيِّنَا مُحَمَّد",
    text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ نَبِيِّنَا مُحَمَّد",
    seconds: 15,
    arabic: true,
  },
  {
    id: "prepare",
    label: "Préparation à la prière (Français)",
    text: "Il est temps de se préparer pour la prière.",
    seconds: 10,
    arabic: false,
  },
  {
    id: "short",
    label: "Rappel vocal court avant l'adhan (Français)",
    text: "Dans quelques minutes, l'adhan sera appelé. Préparez-vous pour la prière.",
    seconds: 12,
    arabic: false,
  },
  {
    id: "fr_wudu",
    label: "Rappel ablutions (Français)",
    text: "Pensez à accomplir vos ablutions sereinement avant le début de la prière.",
    seconds: 10,
    arabic: false,
  },
  {
    id: "fr_fajr",
    label: "Rappel réveil Fajr (Français)",
    text: "C'est l'heure de se réveiller pour la prière de Fajr. La prière est meilleure que le sommeil.",
    seconds: 14,
    arabic: false,
  },
];

export function isArabicText(text: string): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

export function ttsUrl(text: string, arabic: boolean) {
  return `/api/tts?voice=${arabic ? "onyx" : "alloy"}&text=${encodeURIComponent(text)}`;
}

export function renderTemplate(text: string, prayer: string, min: number) {
  if (!text) return "";
  return text
    .replace(/\{prayer\}/gi, prayer)
    .replace(/\{min\}/gi, String(min))
    .replace(/\{minutes\}/gi, String(min));
}

export function getGenericTemplate(t?: Dict): NotifTemplate {
  const generic = NOTIF_TEMPLATES.find((n) => n.id === "generic") || NOTIF_TEMPLATES[5];
  if (t && t.tpl_generic && typeof t.tpl_generic === "string") {
    return { ...generic, text: t.tpl_generic };
  }
  return generic;
}

export function getNotifTemplates(t?: Dict): NotifTemplate[] {
  if (!t) return NOTIF_TEMPLATES;
  return NOTIF_TEMPLATES.map((tpl) => {
    const key = `tpl_${tpl.id}` as keyof Dict;
    if (t[key] && typeof t[key] === "string") {
      return {
        ...tpl,
        text: t[key] as string,
      };
    }
    return tpl;
  });
}

export function getNotifTemplateText(tplId: string, t?: Dict): string {
  if (!tplId) return getGenericTemplate(t).text;
  const tpl = NOTIF_TEMPLATES.find((n) => n.id === tplId);
  if (!tpl) {
    return getGenericTemplate(t).text;
  }
  if (t) {
    const key = `tpl_${tpl.id}` as keyof Dict;
    if (t[key] && typeof t[key] === "string") {
      return t[key] as string;
    }
  }
  return tpl.text;
}

export interface EffectiveReminderResult {
  notifText: string;
  notifRawText: string;
  notifIcon: string;
  isArabicNotif: boolean;
  audioText: string;
  audioLabel: string;
  isArabicAudio: boolean;
  mode: "notification" | "audio" | "both";
  minutes: number;
  notificationsEnabled: boolean;
}

export function resolveEffectiveReminder(
  settings: {
    reminder?: number;
    reminderMode?: "notification" | "audio" | "both";
    notifTemplate?: string;
    customNotifText?: string;
    audioReminder?: string;
    customAudioText?: string;
    notifications?: boolean;
  },
  prayerName: string = "Fajr",
  t?: Dict,
): EffectiveReminderResult {
  const minutes = settings.reminder ?? 15;
  const mode = settings.reminderMode || "notification";
  const notificationsEnabled = settings.notifications !== false;

  // 1. Resolve Notification message
  let notifRawText = "";
  let notifIcon = "🕌";
  let isArabicNotif = false;

  if (settings.notifTemplate === "custom" && settings.customNotifText?.trim()) {
    notifRawText = settings.customNotifText.trim();
    notifIcon = "🔔";
    isArabicNotif = isArabicText(notifRawText);
  } else {
    const tpl =
      NOTIF_TEMPLATES.find((n) => n.id === settings.notifTemplate) || getGenericTemplate(t);
    notifIcon = tpl.icon;
    isArabicNotif = !!tpl.arabic || isArabicText(tpl.text);
    if (t) {
      const locKey = `tpl_${tpl.id}` as keyof Dict;
      notifRawText = (t[locKey] as string) || tpl.text;
    } else {
      notifRawText = tpl.text;
    }
  }

  const notifText = renderTemplate(notifRawText, prayerName, minutes);

  // 2. Resolve Audio Reminder
  let audioText = "";
  let audioLabel = "";
  let isArabicAudio = false;

  if (settings.audioReminder === "custom" && settings.customAudioText?.trim()) {
    audioText = settings.customAudioText.trim();
    audioLabel = `Vocal personnalisé (${audioText.slice(0, 24)}${audioText.length > 24 ? "..." : ""})`;
    isArabicAudio = isArabicText(audioText);
  } else {
    const audioObj =
      AUDIO_REMINDERS.find((a) => a.id === settings.audioReminder) ||
      AUDIO_REMINDERS.find((a) => a.id === "prepare") ||
      AUDIO_REMINDERS[0];
    audioText = audioObj.text;
    audioLabel = audioObj.label;
    isArabicAudio = !!audioObj.arabic || isArabicText(audioText);
  }

  return {
    notifText,
    notifRawText,
    notifIcon,
    isArabicNotif,
    audioText,
    audioLabel,
    isArabicAudio,
    mode,
    minutes,
    notificationsEnabled,
  };
}
