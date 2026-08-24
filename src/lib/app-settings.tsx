import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LocaleCode } from "./i18n";
import { isRtl } from "./i18n";

export const WIDGET_COLORS = [
  "orange",
  "blue",
  "red",
  "green",
  "brown",
  "yellow",
  "black",
  "purple",
  "teal",
  "pink",
  "indigo",
  "emerald",
  "sunset",
  "ocean",
  "aurora",
  "peach",
  "berry",
  "lagoon",
  "gold",
  "midnight",
  "candy",
  "forest",
] as const;

export const BG_COLORS = [
  "white",
  "black",
  "lightorange",
  "lightblue",
  "red",
  "green",
  "cream",
  "sand",
  "mint",
  "lavender",
  "rose",
  "sky",
  "graphite",
  "dawn",
  "dusk",
  "meadow",
  "sorbet",
  "nightsky",
] as const;

/** Presets that use more than two blended colours. */
export const GRADIENT_WIDGETS: readonly string[] = [
  "sunset",
  "ocean",
  "aurora",
  "peach",
  "berry",
  "lagoon",
  "gold",
  "midnight",
  "candy",
  "forest",
];

export const GRADIENT_BGS: readonly string[] = ["dawn", "dusk", "meadow", "sorbet", "nightsky"];

export type WidgetColor = (typeof WIDGET_COLORS)[number];
export type BgColor = (typeof BG_COLORS)[number];

export type Mosque = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

export type SavedProduct = {
  code: string;
  name: string;
  brand: string;
  verdict: "halal" | "haram" | "doubtful" | "unknown";
  image?: string;
};

export type Place = {
  name: string;
  country?: string;
  admin1?: string;
  lat: number;
  lon: number;
  timezone?: string;
};

export type CustomGalleryBg = {
  imageUrl: string;
  zoom: number; // 100 - 200
  blur: number; // 0 - 20
  brightness: number; // 50 - 150
  contrast: number; // 50 - 150
  overlayType: "dark" | "light" | "none";
  overlayOpacity: number; // 0 - 80
};

export type MosqueSetting = {
  id: string;
  slug?: string;
  name: string;
  city: string;
  country?: string;
  address?: string;
  lat: number;
  lon: number;
  timezone?: string;
  source?: "mawaqit" | "osm" | "custom";
  isOfficial?: boolean;
  jumua?: string;
  jumua2?: string;
  shuruq?: string;
};

export type Settings = {
  profileName: string;
  profileAvatarUrl: string;
  language: LocaleCode;
  widgetTheme: string;
  bgTheme: string;
  widgetBorderTheme: string;
  customGalleryBg: CustomGalleryBg | null;
  widgetColor: WidgetColor;
  bgColor: BgColor;
  dark: boolean;
  notifications: boolean;
  imamId: string;
  reminder: 0 | 5 | 15 | 30;
  method: number;
  school: 0 | 1;
  place: Place | null;
  manualPlace: boolean;
  tracking: { date: string; done: string[] };
  savedProducts: SavedProduct[];
  tasbihCount: number;
  compassStyle: 1 | 2 | 3 | 4;
  compassActive: boolean;
  permissionsSeen: boolean;
  mosque: MosqueSetting | null;
  reminderMode: "notification" | "audio" | "both";
  notifTemplate: string;
  customNotifText: string;
  audioReminder: string;
  customAudioText: string;
  quranMode: "normal" | "tajwid";
  quranFont: "uthmani" | "tajwid" | "indopak" | "scheherazade" | "amiri";
  quranFontSize: number;
  quranLineHeight: number;
  quranLetterSpacing: number;
  quranReciter: string;
  quranAudioSpeed: number;
  quranAutoPlayNext: boolean;
  fontSize: "normal" | "large" | "xlarge";
  iconSize: "small" | "normal" | "large";
  animationIntensity: "full" | "reduced" | "none";
  batterySaver: boolean;
  vibrateButtons: boolean;
  vibrateNotifications: boolean;
  vibrateAdhan: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  profileName: "",
  profileAvatarUrl: "",
  language: "fr",
  widgetTheme: "w-grad-vert-chartreuse",
  bgTheme: "bg-default",
  widgetBorderTheme: "wb-rainbow-luxe",
  customGalleryBg: null,
  widgetColor: "sunset",
  bgColor: "white",
  dark: false,
  notifications: true,
  imamId: "makkah",
  reminder: 15,
  method: 12,
  school: 0,
  place: null,
  manualPlace: false,
  tracking: { date: "", done: [] },
  savedProducts: [],
  tasbihCount: 0,
  compassStyle: 1,
  compassActive: false,
  permissionsSeen: false,
  mosque: null,
  reminderMode: "notification",
  notifTemplate: "generic",
  customNotifText: "",
  audioReminder: "prepare",
  customAudioText: "",
  quranMode: "normal",
  quranFont: "uthmani",
  quranFontSize: 28,
  quranLineHeight: 2.2,
  quranLetterSpacing: 0,
  quranReciter: "ar.alafasy",
  quranAudioSpeed: 1,
  quranAutoPlayNext: true,
  fontSize: "normal",
  iconSize: "normal",
  animationIntensity: "full",
  batterySaver: false,
  vibrateButtons: true,
  vibrateNotifications: true,
  vibrateAdhan: true,
};

const STORAGE_KEY = "nur.settings.v1";

type Ctx = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetCustomization: () => void;
  ready: boolean;
};

const SettingsContext = createContext<Ctx>({
  settings: DEFAULT_SETTINGS,
  update: () => {},
  updateSetting: () => {},
  resetCustomization: () => {},
  ready: false,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      let loaded: Partial<Settings> = {};
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        loaded = JSON.parse(raw) as Partial<Settings>;
      } else {
        const legacyApp = window.localStorage.getItem("nur_app_settings");
        if (legacyApp) {
          try {
            loaded = { ...loaded, ...JSON.parse(legacyApp) };
          } catch {
            /* ignore */
          }
        }
      }

      const savedPlace = window.localStorage.getItem("nur.place");
      if (savedPlace && !loaded.place) {
        try {
          loaded.place = JSON.parse(savedPlace);
        } catch {
          /* ignore */
        }
      }

      setSettings((prev) => ({ ...prev, ...loaded }));
    } catch {
      /* ignore corrupted storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      window.localStorage.setItem("nur_app_settings", JSON.stringify(settings));
      if (settings.place) {
        window.localStorage.setItem("nur.place", JSON.stringify(settings.place));
      }
    } catch {
      /* quota */
    }
    const root = document.documentElement;
    root.dataset.widgetTheme = settings.widgetTheme || "w-grad-arc-en-ciel-luxe";
    root.dataset.bgTheme = settings.bgTheme || "bg-default";
    root.dataset.widgetBorder = settings.widgetBorderTheme || "wb-rainbow-luxe";
    root.dataset.widgetBorderTheme = settings.widgetBorderTheme || "wb-rainbow-luxe";
    root.dataset.widget = settings.widgetColor;
    root.dataset.bg = settings.bgColor;
    root.classList.toggle("dark", settings.dark);
    root.lang = settings.language;
    root.dir = isRtl(settings.language) ? "rtl" : "ltr";
    root.dataset.fontSize = settings.fontSize || "normal";
    root.dataset.iconSize = settings.iconSize || "normal";
    root.dataset.animationIntensity = settings.animationIntensity || "full";
    root.dataset.batterySaver = settings.batterySaver ? "true" : "false";

    if (settings.customGalleryBg) {
      root.style.setProperty("--custom-bg-url", `url("${settings.customGalleryBg.imageUrl}")`);
      root.style.setProperty("--custom-bg-zoom", `${settings.customGalleryBg.zoom}%`);
      root.style.setProperty("--custom-bg-blur", `${settings.customGalleryBg.blur}px`);
      root.style.setProperty("--custom-bg-brightness", `${settings.customGalleryBg.brightness}%`);
      root.style.setProperty("--custom-bg-contrast", `${settings.customGalleryBg.contrast}%`);
      root.style.setProperty(
        "--custom-bg-overlay",
        settings.customGalleryBg.overlayType === "dark"
          ? `rgba(0,0,0,${settings.customGalleryBg.overlayOpacity / 100})`
          : settings.customGalleryBg.overlayType === "light"
            ? `rgba(255,255,255,${settings.customGalleryBg.overlayOpacity / 100})`
            : "transparent",
      );
    }
  }, [settings, ready]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetCustomization = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      widgetTheme: DEFAULT_SETTINGS.widgetTheme,
      bgTheme: DEFAULT_SETTINGS.bgTheme,
      widgetBorderTheme: DEFAULT_SETTINGS.widgetBorderTheme,
      customGalleryBg: null,
      widgetColor: DEFAULT_SETTINGS.widgetColor,
      bgColor: DEFAULT_SETTINGS.bgColor,
      fontSize: DEFAULT_SETTINGS.fontSize,
      iconSize: DEFAULT_SETTINGS.iconSize,
      animationIntensity: DEFAULT_SETTINGS.animationIntensity,
      batterySaver: false,
    }));
  }, []);

  const value = useMemo(
    () => ({ settings, update, updateSetting, resetCustomization, ready }),
    [settings, update, updateSetting, resetCustomization, ready],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
