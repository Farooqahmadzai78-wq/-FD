import {
  Coordinates,
  CalculationMethod,
  CalculationParameters,
  PrayerTimes,
  Madhab,
  HighLatitudeRule,
} from "adhan";
import { getMawaqitMosqueDetailsServer, type MawaqitMosqueDetails } from "./mawaqit.functions";
import type { MosqueSetting } from "./app-settings";

export const PRAYER_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type PrayerKey = (typeof PRAYER_KEYS)[number];

export const ARABIC_NAMES: Record<PrayerKey | "Sunrise", string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

export type Timings = Record<string, string>;

export interface PrayerLocation {
  city: string;
  country?: string;
  mosqueName?: string;
  mosqueId?: string;
  mosqueSlug?: string;
  address?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  source: string;
  sourceType: "mosque" | "city" | "calculated";
  calculationMethod?: string;
  prayerTimes?: Record<string, string>;
  iqamaTimes?: Record<string, string>;
  lastUpdated?: string;
}

export type DayTimes = {
  timings: Timings;
  iqama?: Timings;
  iqamaDisplay?: Record<string, string>;
  shuruq?: string;
  jumua?: string;
  jumua2?: string;
  jumua3?: string;
  hijri: string;
  gregorian: string;
  gregorianDate?: Date;
  timezone: string;
  source?: string;
  sourceType?: "mosque" | "city" | "calculated";
  isMosqueOfficial?: boolean;
  mosqueName?: string;
  mosqueAddress?: string;
  calculationMethod?: string;
};

export function computeIqamaDisplay(
  adhanTime: string,
  iqamaValue?: string,
): { display: string; time?: string } {
  if (!iqamaValue) return { display: "" };
  const trimmed = iqamaValue.trim();
  if (trimmed.startsWith("+")) {
    const mins = parseInt(trimmed.replace("+", ""), 10);
    if (!isNaN(mins)) {
      if (mins === 0) {
        return { display: "Immédiat", time: adhanTime };
      }
      const [h, m] = adhanTime.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const totalMinutes = h * 60 + m + mins;
        const iH = Math.floor((totalMinutes / 60) % 24);
        const iM = totalMinutes % 60;
        const formatted = `${String(iH).padStart(2, "0")}:${String(iM).padStart(2, "0")}`;
        return { display: `+${mins} min (${formatted})`, time: formatted };
      }
      return { display: `+${mins} min` };
    }
  }
  return { display: trimmed, time: trimmed };
}

export const CALC_METHODS: { id: number; label: string }[] = [
  { id: 12, label: "UOIF — France (12°)" },
  { id: 20, label: "Grande Mosquée de Paris (18°)" },
  { id: 3, label: "Ligue Islamique Mondiale (MWL)" },
  { id: 4, label: "Umm Al-Qura — La Mecque" },
  { id: 2, label: "ISNA — Amérique du Nord (15°)" },
  { id: 5, label: "Autorité Générale Égyptienne (19.5°)" },
  { id: 1, label: "Karachi — Univ. des Sciences Islamiques" },
  { id: 13, label: "Diyanet — Turquie" },
  { id: 19, label: "Algérie — Ministère des Affaires Religieuses" },
  { id: 14, label: "Tunisie — Ministère des Affaires Religieuses" },
  { id: 8, label: "Pays du Golfe / Dubai" },
  { id: 9, label: "Koweït" },
  { id: 10, label: "Qatar" },
  { id: 11, label: "Singapour (MUIS)" },
];

export const SCHOOLS = [
  { id: 0, label: "Shafi'i / Maliki / Hanbali" },
  { id: 1, label: "Hanafi" },
];

export function getRecommendedMethodForPlace(
  country?: string,
  lat?: number,
  lon?: number,
): { method: number; school: number } {
  const c = (country || "").toLowerCase();
  // Central/South Asia (Afghanistan, Pakistan, India, Bangladesh) -> Karachi (1), Hanafi (1)
  if (
    c.includes("afghan") ||
    c.includes("pakistan") ||
    c.includes("india") ||
    c.includes("inde") ||
    c.includes("bangladesh") ||
    (lat !== undefined && lon !== undefined && lat >= 8 && lat <= 39 && lon >= 60 && lon <= 97)
  ) {
    return { method: 1, school: 1 };
  }
  // Saudi Arabia & Gulf -> Umm Al-Qura (4), Shafi'i/Hanbali (0)
  if (
    c.includes("saudi") ||
    c.includes("saoudite") ||
    c.includes("emirates") ||
    c.includes("émirats") ||
    c.includes("qatar") ||
    c.includes("kuwait") ||
    c.includes("oman") ||
    c.includes("bahrain")
  ) {
    return { method: 4, school: 0 };
  }
  // Turkey -> Diyanet (13), Hanafi (1)
  if (c.includes("turkey") || c.includes("turquie")) {
    return { method: 13, school: 1 };
  }
  // Egypt -> Egyptian General Authority (5)
  if (c.includes("egypt") || c.includes("égypte")) {
    return { method: 5, school: 0 };
  }
  // Algeria -> Algeria Ministry (19)
  if (c.includes("algeria") || c.includes("algérie")) {
    return { method: 19, school: 0 };
  }
  // Tunisia -> Tunisia Ministry (14)
  if (c.includes("tunisia") || c.includes("tunisie")) {
    return { method: 14, school: 0 };
  }
  // North America -> ISNA (2)
  if (
    c.includes("united states") ||
    c.includes("états-unis") ||
    c.includes("usa") ||
    c.includes("canada")
  ) {
    return { method: 2, school: 0 };
  }
  // France / Europe default -> UOIF (12)
  return { method: 12, school: 0 };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function cleanTime(v: string) {
  return (v ?? "").split(" ")[0] ?? "";
}

/**
 * Infer the IANA timezone from coordinates or country when not explicitly provided.
 */
export function inferTimezone(lat: number, lon: number, country?: string): string {
  const c = (country || "").toLowerCase().trim();

  // Afghanistan
  if (c.includes("afghan") || (lat >= 29.3 && lat <= 38.5 && lon >= 60.5 && lon <= 75.0)) {
    return "Asia/Kabul";
  }
  // Iran
  if (c.includes("iran") || (lat >= 25.0 && lat <= 39.8 && lon >= 44.0 && lon <= 63.5)) {
    return "Asia/Tehran";
  }
  // Pakistan
  if (c.includes("pakistan") || (lat >= 23.5 && lat <= 37.1 && lon >= 60.8 && lon <= 77.8)) {
    return "Asia/Karachi";
  }
  // India
  if (
    c.includes("india") ||
    c.includes("inde") ||
    (lat >= 8.0 && lat <= 37.0 && lon >= 68.0 && lon <= 97.5)
  ) {
    return "Asia/Kolkata";
  }
  // Bangladesh
  if (c.includes("bangladesh") || (lat >= 20.5 && lat <= 26.7 && lon >= 88.0 && lon <= 92.7)) {
    return "Asia/Dhaka";
  }
  // Saudi Arabia
  if (
    c.includes("saudi") ||
    c.includes("saoudite") ||
    (lat >= 16.0 && lat <= 32.2 && lon >= 34.5 && lon <= 55.7)
  ) {
    return "Asia/Riyadh";
  }
  // UAE
  if (
    c.includes("emirates") ||
    c.includes("émirats") ||
    (lat >= 22.5 && lat <= 26.1 && lon >= 51.5 && lon <= 56.4)
  ) {
    return "Asia/Dubai";
  }
  // Qatar
  if (c.includes("qatar") || (lat >= 24.5 && lat <= 26.2 && lon >= 50.7 && lon <= 51.7)) {
    return "Asia/Qatar";
  }
  // Kuwait
  if (
    c.includes("kuwait") ||
    c.includes("koweït") ||
    (lat >= 28.5 && lat <= 30.1 && lon >= 46.5 && lon <= 48.5)
  ) {
    return "Asia/Kuwait";
  }
  // Oman
  if (c.includes("oman")) {
    return "Asia/Muscat";
  }
  // Iraq
  if (c.includes("iraq") || c.includes("irak")) {
    return "Asia/Baghdad";
  }
  // Syria
  if (c.includes("syria") || c.includes("syrie")) {
    return "Asia/Damascus";
  }
  // Jordan
  if (c.includes("jordan") || c.includes("jordanie")) {
    return "Asia/Amman";
  }
  // Lebanon
  if (c.includes("lebanon") || c.includes("liban")) {
    return "Asia/Beirut";
  }
  // Palestine / Gaza / Jerusalem
  if (
    c.includes("palestin") ||
    c.includes("gaza") ||
    c.includes("jerusalem") ||
    c.includes("israel")
  ) {
    return "Asia/Gaza";
  }
  // Egypt
  if (
    c.includes("egypt") ||
    c.includes("égypte") ||
    (lat >= 22.0 && lat <= 31.7 && lon >= 24.7 && lon <= 37.0)
  ) {
    return "Africa/Cairo";
  }
  // Turkey
  if (
    c.includes("turkey") ||
    c.includes("turquie") ||
    (lat >= 35.8 && lat <= 42.1 && lon >= 25.6 && lon <= 44.8)
  ) {
    return "Europe/Istanbul";
  }
  // Morocco
  if (
    c.includes("morocco") ||
    c.includes("maroc") ||
    (lat >= 21.0 && lat <= 36.0 && lon >= -17.0 && lon <= -1.0)
  ) {
    return "Africa/Casablanca";
  }
  // Algeria
  if (
    c.includes("algeria") ||
    c.includes("algérie") ||
    (lat >= 19.0 && lat <= 37.1 && lon >= -8.7 && lon <= 12.0)
  ) {
    return "Africa/Algiers";
  }
  // Tunisia
  if (
    c.includes("tunisia") ||
    c.includes("tunisie") ||
    (lat >= 30.2 && lat <= 37.6 && lon >= 7.5 && lon <= 11.6)
  ) {
    return "Africa/Tunis";
  }
  // Libya
  if (c.includes("libya") || c.includes("libye")) {
    return "Africa/Tripoli";
  }
  // Sudan
  if (c.includes("sudan") || c.includes("soudan")) {
    return "Africa/Khartoum";
  }
  // Somalia
  if (c.includes("somali")) {
    return "Africa/Mogadishu";
  }
  // Senegal / West Africa
  if (c.includes("senegal") || c.includes("sénégal")) {
    return "Africa/Dakar";
  }
  if (c.includes("mali")) return "Africa/Bamako";
  if (c.includes("niger") && !c.includes("nigeria")) return "Africa/Niamey";
  if (c.includes("nigeria")) return "Africa/Lagos";
  if (c.includes("ivory coast") || c.includes("côte d'ivoire")) return "Africa/Abidjan";
  if (c.includes("mauritani")) return "Africa/Nouakchott";
  if (c.includes("guinea") || c.includes("guinée")) return "Africa/Conakry";
  // Central & East Asia
  if (c.includes("uzbek") || c.includes("ouzbek")) return "Asia/Tashkent";
  if (c.includes("kazakh")) return "Asia/Almaty";
  if (c.includes("kyrgyz") || c.includes("kirghiz")) return "Asia/Bishkek";
  if (c.includes("tajik") || c.includes("tadjik")) return "Asia/Dushanbe";
  if (c.includes("turkmen")) return "Asia/Ashgabat";
  if (c.includes("azerbaijan") || c.includes("azerbaïdjan")) return "Asia/Baku";
  if (c.includes("indonesia") || c.includes("indonésie")) return "Asia/Jakarta";
  if (c.includes("malaysia") || c.includes("malaisie")) return "Asia/Kuala_Lumpur";
  if (c.includes("china") || c.includes("chine")) return "Asia/Shanghai";
  if (c.includes("japan") || c.includes("japon")) return "Asia/Tokyo";
  // Europe
  if (c.includes("france") || (lat >= 41.3 && lat <= 51.1 && lon >= -5.2 && lon <= 9.6)) {
    return "Europe/Paris";
  }
  if (
    c.includes("united kingdom") ||
    c.includes("royaume-uni") ||
    c.includes("angleterre") ||
    (lat >= 49.8 && lat <= 60.9 && lon >= -8.6 && lon <= 1.8)
  ) {
    return "Europe/London";
  }
  if (c.includes("belgium") || c.includes("belgique")) return "Europe/Brussels";
  if (c.includes("switzerland") || c.includes("suisse")) return "Europe/Zurich";
  if (c.includes("germany") || c.includes("allemagne")) return "Europe/Berlin";
  if (c.includes("spain") || c.includes("espagne")) return "Europe/Madrid";
  if (c.includes("italy") || c.includes("italie")) return "Europe/Rome";
  if (c.includes("netherlands") || c.includes("pays-bas")) return "Europe/Amsterdam";
  if (c.includes("russia") || c.includes("russie")) return "Europe/Moscow";
  if (c.includes("sweden") || c.includes("suède")) return "Europe/Stockholm";
  if (c.includes("norway") || c.includes("norvège")) return "Europe/Oslo";
  if (c.includes("denmark") || c.includes("danemark")) return "Europe/Copenhagen";
  // Americas
  if (c.includes("united states") || c.includes("états-unis") || c.includes("usa")) {
    if (lon < -114) return "America/Los_Angeles";
    if (lon < -102) return "America/Denver";
    if (lon < -85) return "America/Chicago";
    return "America/New_York";
  }
  if (c.includes("canada")) {
    if (lon < -114) return "America/Vancouver";
    if (lon < -102) return "America/Edmonton";
    if (lon < -85) return "America/Winnipeg";
    return "America/Toronto";
  }
  if (c.includes("brazil") || c.includes("brésil")) return "America/Sao_Paulo";
  if (c.includes("australia") || c.includes("australie")) return "Australia/Sydney";

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Format a prayer time string (e.g. "05:20" or "17:45") with 12h / 24h localization.
 */
export function formatPrayerTime(
  timeStr: string,
  options?: {
    hour12?: boolean;
    lang?: string;
    format?: "auto" | "12h" | "24h";
  },
): string {
  if (!timeStr) return "";
  const cleaned = cleanTime(timeStr);
  const parts = cleaned.split(":");
  if (parts.length < 2) return cleaned;

  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return cleaned;

  const fmt = options?.format || "auto";
  const lang = options?.lang || "fr";

  let use12h = options?.hour12;
  if (use12h === undefined) {
    if (fmt === "12h") {
      use12h = true;
    } else if (fmt === "24h") {
      use12h = false;
    } else {
      const is12hLocale =
        ["en", "ps", "ur", "bn", "hi", "ar", "ar-SA", "fa"].includes(lang) || lang.startsWith("ar");
      use12h = is12hLocale;
    }
  }

  if (!use12h) {
    return `${pad(h)}:${pad(m)}`;
  }

  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;

  return `${h12}:${pad(m)} ${period}`;
}

/**
 * Build exact calculation parameters for adhan astronomical engine.
 */
export function getAdhanCalculationParams(
  methodId: number,
  schoolId: number,
): CalculationParameters {
  let params: CalculationParameters;

  switch (methodId) {
    case 12: // UOIF France 12°
      params = new CalculationParameters("UOIF", 12, 12);
      break;
    case 20: // Paris 18°
      params = new CalculationParameters("Paris18", 18, 18);
      break;
    case 3: // MWL
      params = CalculationMethod.MuslimWorldLeague();
      break;
    case 4: // Umm Al-Qura
      params = CalculationMethod.UmmAlQura();
      break;
    case 2: // ISNA
      params = CalculationMethod.NorthAmerica();
      break;
    case 5: // Egyptian
      params = CalculationMethod.Egyptian();
      break;
    case 1: // Karachi
      params = CalculationMethod.Karachi();
      break;
    case 13: // Turkey
      params = CalculationMethod.Turkey();
      break;
    case 19: // Algeria
      params = new CalculationParameters("Algeria", 18, 17);
      break;
    case 14: // Tunisia
      params = new CalculationParameters("Tunisia", 18, 18);
      break;
    case 8: // Dubai
      params = CalculationMethod.Dubai();
      break;
    case 9: // Kuwait
      params = CalculationMethod.Kuwait();
      break;
    case 10: // Qatar
      params = CalculationMethod.Qatar();
      break;
    case 11: // Singapore
      params = CalculationMethod.Singapore();
      break;
    default:
      params = new CalculationParameters("UOIF", 12, 12);
      break;
  }

  // Set Madhab for Asr calculation
  params.madhab = schoolId === 1 ? Madhab.Hanafi : Madhab.Shafi;

  // High latitude rule for northern latitudes (e.g. France / Europe / Canada in summer)
  params.highLatitudeRule = HighLatitudeRule.TwilightAngle;

  return params;
}

/**
 * Format a Date object into HH:mm in the specified IANA timezone,
 * correctly taking Daylight Saving Time (DST / heure d'été UTC+2 vs heure d'hiver UTC+1) into account.
 */
export function formatTimeInTz(date: Date, timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("fr-FR", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return formatter.format(date);
  } catch {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
}

/**
 * Offline / astronomical computation of prayer times with adhan.
 */
export function calculateAstronomicalDayTimes(
  lat: number,
  lon: number,
  method: number,
  school: number,
  date = new Date(),
  tz?: string,
): DayTimes {
  const timezone = tz || inferTimezone(lat, lon);
  const coords = new Coordinates(lat, lon);
  const params = getAdhanCalculationParams(method, school);
  const pt = new PrayerTimes(coords, date, params);

  const timings: Timings = {
    Fajr: formatTimeInTz(pt.fajr, timezone),
    Sunrise: formatTimeInTz(pt.sunrise, timezone),
    Dhuhr: formatTimeInTz(pt.dhuhr, timezone),
    Asr: formatTimeInTz(pt.asr, timezone),
    Sunset: formatTimeInTz(pt.maghrib, timezone),
    Maghrib: formatTimeInTz(pt.maghrib, timezone),
    Isha: formatTimeInTz(pt.isha, timezone),
  };

  const gregorian = date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return {
    timings,
    hijri: "",
    gregorian,
    gregorianDate: date,
    timezone,
  };
}

export async function fetchMosqueDayTimes(
  mosque: MosqueSetting,
  date = new Date(),
  tz?: string,
): Promise<DayTimes | null> {
  const dStr = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  const mosqueKey = mosque.slug || mosque.id;
  const cacheKey = `mosque_${mosqueKey}_${dStr}`;

  if (dayTimesCache.has(cacheKey)) {
    return dayTimesCache.get(cacheKey)!;
  }

  // Attempt to fetch Mawaqit data
  const slug =
    mosque.slug ||
    (mosque.id.startsWith("mawaqit-") ? mosque.id.replace("mawaqit-", "") : undefined);
  if (!slug) return null;

  try {
    let details: MawaqitMosqueDetails | null = null;
    try {
      details = await getMawaqitMosqueDetailsServer({ data: { slug } });
    } catch {
      // Fallback: direct browser fetch if server function fails
      const res = await fetch(`https://mawaqit.net/fr/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const html = await res.text();
        const match =
          html.match(/var\s+confData\s*=\s*(\{.*?\});/s) ||
          html.match(/confData\s*=\s*(\{.*?\});/s);
        if (match) {
          const raw = JSON.parse(match[1]);
          details = {
            slug,
            name: raw.name || raw.label || mosque.name,
            address: raw.address || mosque.address,
            latitude: Number(raw.latitude) || mosque.lat,
            longitude: Number(raw.longitude) || mosque.lon,
            timezone: raw.timezone || "Europe/Paris",
            jumua: raw.jumua,
            jumua2: raw.jumua2,
            jumua3: raw.jumua3,
            times: Array.isArray(raw.times) ? raw.times : [],
            shuruq: raw.shuruq,
            calendar: raw.calendar,
            iqamaCalendar: raw.iqamaCalendar,
          };
        }
      }
    }

    if (!details) return null;

    const mIdx = date.getMonth();
    const dNum = String(date.getDate());

    // Extract times for this specific day from the mosque 365-day calendar
    let dayArr: string[] = [];
    if (details.calendar && details.calendar[mIdx] && details.calendar[mIdx][dNum]) {
      dayArr = details.calendar[mIdx][dNum];
    } else if (details.times && details.times.length >= 5) {
      dayArr = details.times;
    }

    if (!dayArr || dayArr.length < 5) return null;

    let fajr = "";
    let sunrise = "";
    let dhuhr = "";
    let asr = "";
    let maghrib = "";
    let isha = "";

    if (dayArr.length >= 6) {
      [fajr, sunrise, dhuhr, asr, maghrib, isha] = dayArr;
    } else {
      [fajr, dhuhr, asr, maghrib, isha] = dayArr;
      sunrise = details.shuruq || "";
    }

    const timings: Timings = {
      Fajr: fajr,
      Sunrise: sunrise,
      Dhuhr: dhuhr,
      Asr: asr,
      Sunset: maghrib,
      Maghrib: maghrib,
      Isha: isha,
    };

    // Extract Iqama for this specific day
    const iqama: Timings = {};
    const iqamaDisplay: Record<string, string> = {};

    let iqamaArr: string[] | undefined = undefined;
    if (details.iqamaCalendar && details.iqamaCalendar[mIdx] && details.iqamaCalendar[mIdx][dNum]) {
      iqamaArr = details.iqamaCalendar[mIdx][dNum];
    }

    if (iqamaArr && Array.isArray(iqamaArr) && iqamaArr.length >= 5) {
      const pKeys: PrayerKey[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
      pKeys.forEach((k, idx) => {
        const rawVal = iqamaArr![idx];
        if (rawVal) {
          const parsed = computeIqamaDisplay(timings[k], rawVal);
          iqama[k] = parsed.time || rawVal;
          iqamaDisplay[k] = parsed.display;
        }
      });
    }

    const gregorian = date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const resolvedTz = details.timezone || tz || inferTimezone(details.latitude, details.longitude);

    const result: DayTimes = {
      timings,
      iqama: Object.keys(iqama).length > 0 ? iqama : undefined,
      iqamaDisplay: Object.keys(iqamaDisplay).length > 0 ? iqamaDisplay : undefined,
      shuruq: sunrise,
      jumua: details.jumua,
      jumua2: details.jumua2,
      jumua3: details.jumua3,
      hijri: "",
      gregorian,
      gregorianDate: date,
      timezone: resolvedTz,
      source: `${details.name || mosque.name} (Mawaqit / Officiel)`,
      sourceType: "mosque",
      isMosqueOfficial: true,
      mosqueName: details.name || mosque.name,
      mosqueAddress: details.address || mosque.address,
    };

    dayTimesCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn("Failed to fetch mosque day times:", err);
    return null;
  }
}

const dayTimesCache = new Map<string, DayTimes>();

export function getCachedDayTimes(
  lat: number,
  lon: number,
  method: number,
  school: number,
  date = new Date(),
  tz?: string,
  mosque?: MosqueSetting | null,
): DayTimes | undefined {
  const d = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  if (mosque && (mosque.slug || mosque.id.startsWith("mawaqit-"))) {
    const mosqueKey = mosque.slug || mosque.id;
    const mosqueCache = dayTimesCache.get(`mosque_${mosqueKey}_${d}`);
    if (mosqueCache) return mosqueCache;
  }
  const resolvedTz = tz || inferTimezone(lat, lon);
  const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}_${method}_${school}_${resolvedTz}_${d}`;
  return dayTimesCache.get(cacheKey);
}

export async function fetchDayTimes(
  lat: number,
  lon: number,
  method: number,
  school: number,
  date = new Date(),
  tz?: string,
  mosque?: MosqueSetting | null,
): Promise<DayTimes> {
  const resolvedTz = tz || inferTimezone(lat, lon);
  const d = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

  // PRIORITY 1: Selected Mosque Official Schedule
  if (mosque && (mosque.slug || mosque.id.startsWith("mawaqit-") || mosque.isOfficial)) {
    const mosqueResult = await fetchMosqueDayTimes(mosque, date, resolvedTz);
    if (mosqueResult) {
      return mosqueResult;
    }
  }

  // PRIORITY 3 (Fallback): Astronomical Calculation
  const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}_${method}_${school}_${resolvedTz}_${d}`;

  if (dayTimesCache.has(cacheKey)) {
    return dayTimesCache.get(cacheKey)!;
  }

  const methodLabel = CALC_METHODS.find((m) => m.id === method)?.label || "UOIF 12°";

  // Pre-calculate astronomical times immediately for instant accuracy
  const astroTimes = calculateAstronomicalDayTimes(lat, lon, method, school, date, resolvedTz);
  astroTimes.source = `Calcul astronomique (${methodLabel})`;
  astroTimes.sourceType = "calculated";
  astroTimes.calculationMethod = methodLabel;
  astroTimes.isMosqueOfficial = false;

  try {
    // Call Aladhan API with exact coordinates, method, school, and timezone string
    const url = `https://api.aladhan.com/v1/timings/${d}?latitude=${lat}&longitude=${lon}&method=${method}&school=${school}&timezonestring=${encodeURIComponent(resolvedTz)}`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      const data = json.data;
      const h = data.date.hijri;
      const g = data.date.gregorian;
      const gDate = new Date(Number(g.year), Number(g.month.number) - 1, Number(g.day));

      const result: DayTimes = {
        timings: data.timings || astroTimes.timings,
        hijri: `${h.day} ${h.month.en} ${h.year} H`,
        gregorian: `${g.weekday.en} ${g.day} ${g.month.en} ${g.year}`,
        gregorianDate: gDate,
        timezone: data.meta.timezone || resolvedTz,
        source: `Calcul astronomique (${methodLabel})`,
        sourceType: "calculated",
        calculationMethod: methodLabel,
        isMosqueOfficial: false,
      };

      dayTimesCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn("Aladhan API fetch error, using local astronomical computation:", err);
  }

  // Fallback to high-precision local astronomical computation
  dayTimesCache.set(cacheKey, astroTimes);
  return astroTimes;
}

export function getLocalizedGregorianDate(dayTimes: DayTimes, lang: string): string {
  if (dayTimes.gregorianDate) {
    try {
      let loc = lang;
      if (lang === "ps") loc = "ps-AF-u-ca-gregory";
      else if (lang === "fa") loc = "fa-IR-u-ca-gregory";
      else if (lang === "ur") loc = "ur-u-ca-gregory";
      else if (lang.startsWith("ar")) loc = "ar-SA";

      return dayTimes.gregorianDate.toLocaleDateString(loc, {
        calendar: "gregory",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dayTimes.gregorian;
    }
  }
  return dayTimes.gregorian;
}

/** "Now" expressed as a Date whose local fields match the wall clock of `tz`. */
export function zonedNow(tz?: string, base = new Date()) {
  if (!tz) return base;
  try {
    const shifted = new Date(base.toLocaleString("en-US", { timeZone: tz }));
    return Number.isNaN(shifted.getTime()) ? base : shifted;
  } catch {
    return base;
  }
}

export function toDateToday(hhmm: string, base = new Date()) {
  const [h, m] = cleanTime(hhmm).split(":").map(Number);
  const d = new Date(base);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

export function nextPrayer(timings: Timings, now = new Date()) {
  for (const key of PRAYER_KEYS) {
    const t = toDateToday(timings[key], now);
    if (t.getTime() > now.getTime()) return { key, at: t, tomorrow: false };
  }
  const t = toDateToday(timings.Fajr, now);
  t.setDate(t.getDate() + 1);
  return { key: "Fajr" as PrayerKey, at: t, tomorrow: true };
}

export function countdown(to: Date, now = new Date()) {
  const ms = Math.max(0, to.getTime() - now.getTime());
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return { h, m, s, label: `${pad(h)}:${pad(m)}:${pad(s)}` };
}

/* ---------- Geocoding ---------- */
export function formatLocalizedPlace(
  place: { name: string; country?: string; timezone?: string } | null | undefined,
  t: Record<string, string> | ((key: string, fallback?: string) => string),
): string {
  if (!place) return "";
  const tObj = typeof t === "function" ? (t as unknown as Record<string, string>) : t;
  const nameLower = place.name.toLowerCase();
  const isMakkah =
    place.name === "La Mecque" ||
    place.name === "Makkah" ||
    nameLower.includes("makkah") ||
    nameLower.includes("mecque");
  const localizedName = isMakkah ? tObj.makkahName || place.name : place.name;

  let localizedCountry = place.country;
  if (place.country) {
    if (place.country === "Arabie saoudite" || place.country === "Saudi Arabia") {
      localizedCountry = tObj.countrySa || tObj.saudiArabia || place.country;
    }
  }

  return `${localizedName}${localizedCountry ? `, ${localizedCountry}` : ""}`;
}

export async function reverseGeocode(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`,
    );
    const json = await res.json();
    const country = json.countryName as string | undefined;
    const timezone = inferTimezone(lat, lon, country);
    return {
      name: json.city || json.locality || json.principalSubdivision || "Position actuelle",
      country,
      timezone,
    };
  } catch {
    const timezone = inferTimezone(lat, lon);
    return { name: "Position actuelle", country: undefined, timezone };
  }
}

export async function searchCity(query: string) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=fr&format=json`,
  );
  const json = await res.json();
  return ((json.results ?? []) as Array<Record<string, unknown>>).map((r) => {
    const lat = Number(r.latitude);
    const lon = Number(r.longitude);
    const country = r.country ? String(r.country) : undefined;
    const timezone = r.timezone ? String(r.timezone) : inferTimezone(lat, lon, country);
    return {
      name: String(r.name),
      country,
      admin1: r.admin1 ? String(r.admin1) : undefined,
      lat,
      lon,
      timezone,
    };
  });
}

/**
 * Wall-clock time of `tz` (the timezone of the selected city), formatted.
 * Uses Intl directly so it always follows the city, never the device.
 */
export function formatZonedTime(tz: string | undefined, base = new Date(), withSeconds = true) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      ...(withSeconds ? { second: "2-digit" as const } : {}),
      hour12: false,
    }).format(base);
  } catch {
    return base.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
}
