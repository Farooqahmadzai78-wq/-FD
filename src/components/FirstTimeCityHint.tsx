import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, X, MapPin, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/app-settings";

const STORAGE_KEY = "nur.has_seen_city_hint_v2";

export function markCityHintAsSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
    // Also trigger custom event in case multiple components are mounted
    window.dispatchEvent(new Event("nur:city_hint_dismissed"));
  } catch {
    // Ignore localStorage errors
  }
}

export function isCityHintSeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return true;
  }
}

interface FirstTimeCityHintProps {
  onOpenCityPicker?: () => void;
}

export function FirstTimeCityHint({ onOpenCityPicker }: FirstTimeCityHintProps) {
  const { t } = useI18n();
  const { settings, ready } = useSettings();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready) return;

    // Check if user has already seen the hint
    const alreadySeen = isCityHintSeen();
    if (!alreadySeen) {
      // Small timeout for smooth entrance animation after page mount
      const timer = setTimeout(() => {
        setVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [ready]);

  // Listen to external dismissal events (e.g. user opened city picker)
  useEffect(() => {
    const handleDismiss = () => setVisible(false);
    window.addEventListener("nur:city_hint_dismissed", handleDismiss);
    return () => window.removeEventListener("nur:city_hint_dismissed", handleDismiss);
  }, []);

  // If user changed city from default Makkah, automatically dismiss hint
  useEffect(() => {
    if (settings.place && settings.place.name !== "La Mecque" && settings.place.name !== "Makkah") {
      markCityHintAsSeen();
      setVisible(false);
    }
  }, [settings.place]);

  const handleDismiss = () => {
    markCityHintAsSeen();
    setVisible(false);
  };

  const handleCardClick = () => {
    markCityHintAsSeen();
    setVisible(false);
    if (onOpenCityPicker) {
      onOpenCityPicker();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="first-time-city-hint-container"
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-40 w-full max-w-sm mx-auto mt-2 px-3 select-none"
        >
          {/* Animated pointer arrow pointing up towards city pill */}
          <div className="flex justify-center -mb-1">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
            >
              <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
            </motion.div>
          </div>

          {/* Guide Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/95 via-teal-900/95 to-slate-900/95 text-white border border-emerald-500/30 shadow-xl shadow-emerald-950/40 backdrop-blur-md p-3.5">
            {/* Ambient decorative glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-emerald-200 tracking-wide uppercase">
                    {t.cityHintTitle || "Horaires de votre ville"}
                  </h4>
                  <button
                    id="dismiss-city-hint-btn"
                    onClick={handleDismiss}
                    aria-label="Fermer l'aide"
                    className="p-1 -mr-1 -mt-1 rounded-lg text-emerald-300/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="mt-1 text-xs text-emerald-50/90 leading-relaxed font-normal">
                  {t.cityHintText ||
                    "Vous pouvez changer de ville pour obtenir les horaires de prière de votre emplacement."}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    id="open-city-picker-from-hint-btn"
                    onClick={handleCardClick}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold text-xs transition-all shadow-sm active:scale-95 text-center flex items-center justify-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t.changeCity || "Changer de ville"}</span>
                  </button>
                  <button
                    id="confirm-city-hint-btn"
                    onClick={handleDismiss}
                    className="py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{t.cityHintCta || "Compris"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
