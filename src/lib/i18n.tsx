import { createContext, useContext, useMemo, type ReactNode } from "react";
import { en, type Dict } from "./locales/en";
import { fr } from "./locales/fr";
import { it } from "./locales/it";
import { ru } from "./locales/ru";
import { fa } from "./locales/fa";
import { ps } from "./locales/ps";
import { ar, arDZ, arEG, arMA, arTN } from "./locales/ar";
import { ur } from "./locales/ur";
import { bn } from "./locales/bn";
import { id } from "./locales/id";
import { tr } from "./locales/tr";
import { ha } from "./locales/ha";
import { sw } from "./locales/sw";

import { de } from "./locales/de";
import { es } from "./locales/es";
import { pt } from "./locales/pt";
import { nl } from "./locales/nl";
import { sv, no, da, fi } from "./locales/nordic";
import { pl, ro, el, sq, bs } from "./locales/easternEurope";
import { zh, ja, ko, vi, th } from "./locales/asian";
import { hi, ta, te, ml, kn, mr, gu, pa } from "./locales/indian";
import { uz, kk, ky, tg, tk, az } from "./locales/centralAsia";
import { ms } from "./locales/ms";

export const LOCALES = {
  fr,
  en,
  ar,
  "ar-DZ": arDZ,
  "ar-MA": arMA,
  "ar-EG": arEG,
  "ar-TN": arTN,
  de,
  es,
  pt,
  it,
  nl,
  ru,
  pl,
  ro,
  el,
  sq,
  bs,
  sv,
  no,
  da,
  fi,
  tr,
  fa,
  ps,
  ur,
  hi,
  bn,
  pa,
  gu,
  mr,
  ta,
  te,
  ml,
  kn,
  id,
  ms,
  ha,
  sw,
  zh,
  ja,
  ko,
  vi,
  th,
  uz,
  kk,
  ky,
  tg,
  tk,
  az,
} satisfies Record<string, Partial<Dict>>;

export type LocaleCode = keyof typeof LOCALES;

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية — Standard Arabic",
  "ar-DZ": "الدارجة الجزائرية — Algerian Arabic",
  "ar-MA": "الدارجة المغربية — Moroccan Arabic",
  "ar-EG": "العامية المصرية — Egyptian Arabic",
  "ar-TN": "الدارجة التونسية — Tunisian Arabic",
  de: "Deutsch — German",
  es: "Español — Spanish",
  pt: "Português — Portuguese",
  it: "Italiano — Italian",
  nl: "Nederlands — Dutch",
  ru: "Русский — Russian",
  pl: "Polski — Polish",
  ro: "Română — Romanian",
  el: "Ελληνικά — Greek",
  sq: "Shqip — Albanian",
  bs: "Bosanski — Bosnian",
  sv: "Svenska — Swedish",
  no: "Norsk — Norwegian",
  da: "Dansk — Danish",
  fi: "Suomi — Finnish",
  tr: "Türkçe — Turkish",
  fa: "فارسی — Persian",
  ps: "پښتو — Pashto",
  ur: "اردو — Urdu",
  hi: "हिन्दी — Hindi",
  bn: "বাংলা — Bengali",
  pa: "ਪੰਜਾਬੀ — Punjabi",
  gu: "ગુજરાતી — Gujarati",
  mr: "मराठी — Marathi",
  ta: "தமிழ் — Tamil",
  te: "తెలుగు — Telugu",
  ml: "മലയാളം — Malayalam",
  kn: "ಕನ್ನಡ — Kannada",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu — Malay",
  ha: "Hausa",
  sw: "Kiswahili",
  zh: "中文 — Chinese",
  ja: "日本語 — Japanese",
  ko: "한국어 — Korean",
  vi: "Tiếng Việt — Vietnamese",
  th: "ไทย — Thai",
  uz: "Oʻzbekcha — Uzbek",
  kk: "Қазақша — Kazakh",
  ky: "Кыргызча — Kyrgyz",
  tg: "Тоҷикӣ — Tajik",
  tk: "Türkmençe — Turkmen",
  az: "Azərbaycan dili — Azerbaijani",
};

export const RTL_LOCALES: LocaleCode[] = [
  "ar",
  "ar-DZ",
  "ar-MA",
  "ar-EG",
  "ar-TN",
  "fa",
  "ps",
  "ur",
];

export function isRtl(locale: LocaleCode) {
  return RTL_LOCALES.includes(locale);
}

export type TranslateFn = {
  (key: string, fallback?: string): string;
} & Dict;

export type I18nValue = { locale: LocaleCode; t: TranslateFn; dir: "ltr" | "rtl" };

export function createT(dict: Dict): TranslateFn {
  const fn = (key: string, fallback?: string): string => {
    return (dict as Record<string, string>)[key] ?? fallback ?? key;
  };

  return new Proxy(fn, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && prop in dict) {
        return (dict as Record<string, string>)[prop];
      }
      return Reflect.get(target, prop, receiver);
    },
    has(target, prop) {
      if (typeof prop === "string" && prop in dict) {
        return true;
      }
      return Reflect.has(target, prop);
    },
    ownKeys(target) {
      return Array.from(new Set([...Reflect.ownKeys(target), ...Object.keys(dict)]));
    },
    getOwnPropertyDescriptor(target, prop) {
      if (typeof prop === "string" && prop in dict) {
        return {
          configurable: true,
          enumerable: true,
          value: (dict as Record<string, string>)[prop],
          writable: false,
        };
      }
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
  }) as TranslateFn;
}

const defaultDict = { ...en, ...fr };
const defaultT = createT(defaultDict);

const I18nContext = createContext<I18nValue>({
  locale: "fr",
  t: defaultT,
  dir: "ltr",
});

export function I18nProvider({ locale, children }: { locale: LocaleCode; children: ReactNode }) {
  const value = useMemo<I18nValue>(() => {
    const dict = locale === "fr" ? { ...en, ...fr } : { ...fr, ...en, ...(LOCALES[locale] || {}) };
    return {
      locale,
      t: createT(dict),
      dir: isRtl(locale) ? "rtl" : "ltr",
    };
  }, [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
