import mosque from "@/assets/mosque.jpg";
import quranClosed from "@/assets/quran-closed.png";
import quranOpen from "@/assets/quran-open.png";
import scanProduct from "@/assets/scan-product.png";
import permissionsIllu from "@/assets/permissions-illu.png";
import splashLogo from "@/assets/images/splash_logo_crescent_1786275718969.jpg";
import categoryQuotidien from "@/assets/images/category_quotidien_1785582473894.jpg";
import categoryAdorations from "@/assets/images/category_adorations_1785582491908.jpg";
import categoryProtection from "@/assets/images/category_protection_new_1785585611011.jpg";
import categoryEvents from "@/assets/images/category_events_1785582524191.jpg";
import soothingBanner from "@/assets/images/cat_soothing_banner_1785678227815.jpg";
import powerfulBanner from "@/assets/images/cat_powerful_banner_1785678243172.jpg";
import calmBanner from "@/assets/images/cat_calm_banner_1785678259540.jpg";
import notifBg from "@/assets/images/reminder_notif_new_1786270350765.jpg";
import audioBg from "@/assets/images/reminder_audio_new_1786270363968.jpg";
import comboBg from "@/assets/images/reminder_combo_new_1786270378486.jpg";
import { fetchDayTimes } from "@/lib/prayer-times";

export interface PreloadProgress {
  step: number;
  totalSteps: number;
  percentage: number;
  status: string;
  statusKey?: string;
}

const CRITICAL_IMAGES = [
  splashLogo,
  mosque,
  quranClosed,
  quranOpen,
  scanProduct,
  permissionsIllu,
  categoryQuotidien,
  categoryAdorations,
  categoryProtection,
  categoryEvents,
  soothingBanner,
  powerfulBanner,
  calmBanner,
  notifBg,
  audioBg,
  comboBg,
];

export async function runFullAppPreload(
  onProgress?: (p: PreloadProgress) => void,
  checkSettingsReady?: () => boolean,
): Promise<{ userLoggedIn: boolean }> {
  const totalSteps = 5;

  const update = (step: number, statusKey: string, defaultStatus: string, pctOverride?: number) => {
    const percentage = pctOverride ?? Math.round((step / totalSteps) * 100);
    onProgress?.({ step, totalSteps, percentage, status: defaultStatus, statusKey });
  };

  // Step 1: Themes & Settings initialization
  update(1, "splashStep1", "Chargement des thèmes & des préférences...");
  let attempts = 0;
  while (checkSettingsReady && !checkSettingsReady() && attempts < 40) {
    await new Promise((r) => setTimeout(r, 50));
    attempts++;
  }
  await new Promise((r) => setTimeout(r, 150));

  // Step 2: Typography & Web Fonts Preloading
  update(2, "splashStep2", "Chargement de la typographie & des polices...");
  try {
    if (typeof document !== "undefined" && "fonts" in document) {
      await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]);
    }
  } catch (err) {
    console.warn("Fonts load warning:", err);
  }

  // Step 3: Critical Image Assets Preloading
  update(3, "splashStep3", "Préparation des visuels & de l'interface...");
  const imagePromises = CRITICAL_IMAGES.map(
    (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve;
      }),
  );
  await Promise.race([Promise.allSettled(imagePromises), new Promise((r) => setTimeout(r, 2500))]);

  // Step 4: Prayer Times Calculation & Location Data
  update(4, "splashStep4", "Calcul des horaires de prière en temps réel...");
  try {
    const savedPlaceRaw = localStorage.getItem("nur.place");
    const settingsRaw = localStorage.getItem("nur.settings.v1");
    let lat = 48.8566;
    let lon = 2.3522; // Paris fallback
    let method = 12; // UOIF 12° fallback
    let school = 0;

    if (savedPlaceRaw) {
      try {
        const parsed = JSON.parse(savedPlaceRaw);
        if (parsed?.lat && parsed?.lon) {
          lat = parsed.lat;
          lon = parsed.lon;
        }
      } catch {
        /* ignore */
      }
    }
    if (settingsRaw) {
      try {
        const parsedS = JSON.parse(settingsRaw);
        if (parsedS?.place?.lat && parsedS?.place?.lon) {
          lat = parsedS.place.lat;
          lon = parsedS.place.lon;
        }
        if (typeof parsedS?.method === "number") method = parsedS.method;
        if (typeof parsedS?.school === "number") school = parsedS.school;
      } catch {
        /* ignore */
      }
    }

    await Promise.race([
      fetchDayTimes(lat, lon, method, school),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch (err) {
    console.warn("Preloader prayer times warning:", err);
  }

  // Step 5: Finalizing local environment
  update(5, "splashStep5", "Initialisation de l'environnement local...");
  update(5, "splashReady", "L'application est prête !", 100);
  await new Promise((r) => setTimeout(r, 200));

  return { userLoggedIn: true };
}
